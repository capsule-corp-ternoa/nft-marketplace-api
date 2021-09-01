import express from "express";
import controller from "./controller";
export default express
  .Router()
  .patch("/reviewRequested/:id", controller.reviewRequested)
  .get("/", controller.all)
  .get("/verifyTwitter/callback", controller.verifyTwitterCallback)
  .get("/verifyTwitter/:id", controller.verifyTwitter)
  .get("/:id", controller.getUser)
  .get("/:id/caps", controller.getAccountBalance)
  .get("/:id/liked", controller.getLikedNfts)
  .post("/create", controller.newUser)
  .post("/like", controller.likeNft)
  .post("/unlike", controller.unlikeNft)
  .post("/:walletId", controller.updateUser);
