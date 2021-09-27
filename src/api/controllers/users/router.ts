import express from "express";
import controller from "./controller";
export default express
  .Router()
  .patch("/reviewRequested/:id", controller.reviewRequested) // ternoa-api, ok
  .get("/", controller.all) // ternoa-api, ok
  .get("/verifyTwitter/:id", controller.verifyTwitter) // ternoa-api, ok
  .get("/getUsers", controller.getUsersBywalletId) // ternoa-api, ok
  .get("/:id", controller.getUser) // ternoa-api, ok
  .get("/:id/caps", controller.getAccountBalance)
  .get("/:id/liked", controller.getLikedNfts)
  .post("/create", controller.newUser) // ternoa-api, ok
  .post("/like", controller.likeNft) // ternoa-api, ok
  .post("/unlike", controller.unlikeNft) // ternoa-api, ok
  .post("/:walletId", controller.updateUser); // ternoa-api, ok
