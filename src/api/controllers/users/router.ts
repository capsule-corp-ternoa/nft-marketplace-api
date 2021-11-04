import express from "express";
import controller from "./controller";
export default express
  .Router()
  .patch("/reviewRequested/:id", controller.reviewRequested) // ternoa-api
  .get("/", controller.all) // ternoa-api
  .get("/verifyTwitter/:id", controller.verifyTwitter) // ternoa-api
  .get("/getUsers", controller.getUsersBywalletId) // ternoa-api
  .get("/:id", controller.getUser) // ternoa-api
  .get("/:id/caps", controller.getAccountBalance)
  .post("/create", controller.newUser) // ternoa-api
  .post("/like", controller.likeNft) // ternoa-api
  .post("/unlike", controller.unlikeNft) // ternoa-api
  .post("/:walletId", controller.updateUser); // ternoa-api
