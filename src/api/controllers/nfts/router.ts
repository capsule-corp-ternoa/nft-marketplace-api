import express from "express";
import controller from "./controller";
export default express
  .Router()
  .get("/", controller.getNFTs)
  .get("/history", controller.getHistory)
  .get("/total-on-sale", controller.getTotalOnSale)
  .post("/like", controller.likeNft)
  .post("/unlike", controller.unlikeNft)
  .get("/:id", controller.getNFT)
  .get("/stat/:id", controller.getStatNFTsUser)
  .get("/series/data", controller.getNFTsBySeries)
  .get("/series/status/:seriesId", controller.getSeriesStatus)
  .get("/series/can-add", controller.canAddToSeries)
  .post("/add-nfts-categories", controller.addCategoriesNFTs)