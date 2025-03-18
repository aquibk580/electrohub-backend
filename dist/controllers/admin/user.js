import { db } from "../../lib/db.js";
async function getAllUsers(req, res) {
    try {
        const users = await db.user.findMany({
            orderBy: {
                createdAt: "asc",
            },
        });
        if (users.length === 0) {
            res.status(404).json({ error: "No users available" });
            return;
        }
        res.status(200).json(users);
        return;
        // You can retrive the users at the frontend directly as "response.data" no need to do "response.data.users"
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_USERS", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
async function getSingleUser(req, res) {
    const params = req.params;
    const userId = parseInt(params.userId, 10);
    try {
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                reviews: {
                    include: {
                        product: true,
                    },
                },
                orders: {
                    include: {
                        orderItems: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const orderItems = user.orders?.flatMap((order) => order.orderItems) || [];
        const totalSpend = orderItems.reduce((acc, { product }) => {
            if (!product || typeof product.price !== "number")
                return acc;
            const discount = product.offerPercentage
                ? (Number(product.offerPercentage) / 100) * product.price
                : 0;
            return acc + (product.price - discount);
        }, 0);
        const itemsPurchased = orderItems.length;
        const returns = orderItems.filter((item) => item.status === "Returned").length;
        const avgOrderValue = itemsPurchased > 0 ? totalSpend / itemsPurchased : 0;
        res.status(200).json({
            user,
            orderItems,
            totalSpend,
            itemsPurchased,
            returns,
            avgOrderValue,
        });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_USERS", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
export { getAllUsers, getSingleUser };
