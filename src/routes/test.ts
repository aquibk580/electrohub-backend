import { Router, Request, Response, RouterOptions } from "express";

const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
  res.end("<h1>Hello How Are you</h1>");
});

export default router;
