import jwt from "jsonwebtoken";
export async function isAdminLoggedIn(req, res, next) {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            res.status(401).json({ error: "Unauthorized. No token provided." });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (typeof decoded === "object" &&
            decoded !== null &&
            "id" in decoded &&
            "email" in decoded &&
            "name" in decoded) {
            req.admin = decoded;
            next();
        }
        else {
            res.status(401).json({ error: "Invalid token payload" });
            return;
        }
    }
    catch (error) {
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({ error: "Invalid token." });
        }
        else if (error.name === "TokenExpiredError") {
            res.status(401).json({ error: "Token has expired." });
        }
        else {
            console.error("Authentication Error:", error);
            res
                .status(500)
                .json({ error: "Internal Server Error", details: error.message });
        }
    }
}
