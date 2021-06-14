import express from "express";
import controller from "./controller";
export default express
  .Router()
  .get("/", controller.getAllNFTs)
  .get("/owner/:id", controller.getUsersNFTS)
  .get("/creator/:id", controller.getCreatorsNFTs)
  .get("/category/:code", controller.getCategoryNFTs)
  .get("/:id", controller.getNFT)
  .post("/new", controller.createNFT)
  .get("/onSaleSeriesNFTsCount/:serieId", controller.getNFTTotalOnSaleCount);
