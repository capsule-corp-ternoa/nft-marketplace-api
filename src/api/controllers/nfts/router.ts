import express from "express";
import controller from "./controller";
export default express
  .Router()
  .get("/", controller.getNFTs)
  .get("/:id", controller.getNFT)
  .get("/stat/:id", controller.getStatNFTsUser)
  .get("/series/data", controller.getNFTsBySeries)
  .get("/series/status/:seriesId", controller.getSeriesStatus)
  .get("/series/can-add", controller.canAddToSeries)
  .get("/history/:seriesId/:nftId", controller.getHistory)
  .get("/likes/ranking", controller.getMostLiked)
  .post("/add-nfts-categories", controller.addCategoriesNFTs)