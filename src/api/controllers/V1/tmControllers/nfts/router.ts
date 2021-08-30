import express from "express";
import controller from "./controller";
export default express
  .Router()
  .get("/category/", controller.getCategoriesNFTs);
