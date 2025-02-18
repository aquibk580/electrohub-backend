import express from "express";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy, } from "passport-google-oauth20";
import { db } from "../lib/db.js";
import { isLoggedIn, optionalAuth } from "../middlewares/auth.js";
config();
const router = express.Router();
const googleStrategyOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ["profile", "email"],
    passReqToCallback: true,
};
const verifyCallback = async (req, accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const userType = req.query.state
            ? JSON.parse(decodeURIComponent(req.query.state)).userType
            : null;
        console.log("UserType from state:", userType); // Debugging
        if (!userType) {
            return done(new Error("User type not found in state"), null);
        }
        let existingUser;
        if (userType === "seller") {
            existingUser = await db.seller.findUnique({ where: { email } });
        }
        else {
            existingUser = await db.user.findUnique({ where: { email } });
        }
        if (existingUser) {
            return done(null, existingUser, { userType, isNew: false });
        }
        let newUser;
        if (userType === "seller") {
            newUser = await db.seller.create({
                data: {
                    name: profile.displayName,
                    email: email,
                    pfp: profile.photos[0].value,
                    provider: "google",
                },
            });
        }
        else {
            newUser = await db.user.create({
                data: {
                    name: profile.displayName,
                    pfp: profile.photos[0].value,
                    email: email,
                    provider: "google",
                },
            });
        }
        done(null, newUser, { userType, isNew: userType });
    }
    catch (error) {
        console.error("ERROR_WHILE_AUTHENTICATING_TO_GOOGLE", error);
        return done(error, null);
    }
};
passport.use(new GoogleStrategy(googleStrategyOptions, verifyCallback));
router.get("/google", (req, res, next) => {
    const { redirectUrl, userType } = req.query;
    const state = encodeURIComponent(JSON.stringify({ redirectUrl, userType }));
    passport.authenticate("google", {
        session: false,
        scope: ["profile", "email"],
        state,
    })(req, res, next);
});
router.get("/google/callback", (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
        if (err) {
            console.error("ERROR_IN_GOOGLE_CALLBACK", err);
            return res.redirect("/login?error=google_auth_failed");
        }
        if (!user) {
            return res.redirect("/login?error=user_not_found");
        }
        const { state } = req.query;
        if (!state) {
            return res.redirect("/login?error=missing_state");
        }
        const { redirectUrl, userType } = JSON.parse(decodeURIComponent(state));
        if (!userType) {
            return res.redirect("/login?error=missing_user_type");
        }
        const token = jwt.sign({ id: user.id, email: user.email, userType }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
        });
        if (info.isNew) {
            if (info.isNew === "seller") {
                res.redirect(`${process.env.FRONTEND_URL}/seller/auth/seller-details`);
            }
            else if (info.isNew === "user") {
                res.redirect(`${process.env.FRONTEND_URL}/user/auth/user-details`);
            }
        }
        else {
            res.redirect(redirectUrl);
        }
    })(req, res, next);
});
router.get("/user-data", optionalAuth, async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser) {
            res
                .status(401)
                .json({ error: "Unauthorized", user: null, authorized: false });
            return;
        }
        if (currentUser.userType !== "user") {
            res
                .status(401)
                .json({ error: "Unauthorized", user: null, authorized: false });
            return;
        }
        const user = await db.user.findUnique({
            where: { email: currentUser.email },
        });
        if (!user) {
            res
                .status(404)
                .json({ error: "User not found", user: null, authorized: false });
            return;
        }
        res.status(200).json({
            user,
            authorized: true,
        });
        return;
    }
    catch (error) {
        console.error("ERROR_WHILE_GETTING_USER_DATA", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
});
router.get("/seller-data", optionalAuth, async (req, res) => {
    try {
        const currentSeller = req.user;
        if (!currentSeller) {
            res
                .status(401)
                .json({ error: "Unauthorized", seller: null, authorized: false });
            return;
        }
        if (currentSeller.userType !== "seller") {
            res
                .status(401)
                .json({ error: "Unauthorized", user: null, authorized: false });
            return;
        }
        const seller = await db.seller.findUnique({
            where: { email: currentSeller.email },
        });
        if (!seller) {
            res
                .status(404)
                .json({ error: "Seller not found", seller: null, authorized: false });
            return;
        }
        res.status(200).json({
            seller,
            authorized: true,
        });
        return;
    }
    catch (error) {
        console.error("ERROR_WHILE_GETTING_USER_DATA", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
});
router.get("/get-id", isLoggedIn, async (req, res) => {
    try {
        const currentUser = req.user;
        const id = currentUser.id;
        res.status(200).json(id);
        return;
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
});
router.get("/logout", isLoggedIn, (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });
        res.status(200).json({ message: "Logged Out successfully" });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_LOGOUT");
        res.status(500).json({ error: "Internal Sever Error" });
        return;
    }
});
export default router;
