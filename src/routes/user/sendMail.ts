import { Router, Request, Response } from "express";
import { sendEmail } from "../../controllers/user/sendMail.js";

const router: Router = Router();

router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const Data = req.body;
    console.log(Data)
    const result = await sendEmail(Data);
    if (result.success) {
      res.json({ message: "Email sent successfully" });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
