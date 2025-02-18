import { Request, Response } from "express";
import { db } from "../../lib/db.js";


// Get all banner carousels
export async function getAllBannerCarousels(req: Request, res: Response) {
    try {
      const bannerCarousels = await db.bannerCarousel.findMany({});
  
      if (bannerCarousels.length === 0) {
        res.status(404).json({ error: "No Banner Carousel Available" });
        return;
      }
  
      res.status(200).json(bannerCarousels);
      return;
    } catch (error: any) {
      console.log("ERROR_WHILE_GETTING_ALL_BANNER_CAROUSELS");
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
      return;
    }
  }