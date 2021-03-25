import express from "express";
import controller from "./controller";
export default express
  .Router()
  .get("/", controller.getAllNFTs)
  .get("/owner/:id", controller.getUsersNFTS)
  .get("/:id", controller.getNFT);
