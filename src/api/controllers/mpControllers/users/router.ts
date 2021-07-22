import express from "express";
import controller from "./controller";
export default express
  .Router()
  .get("/", controller.all)
  .get("/verifyTwitter/callback", controller.verifyTwitterCallback)
  .get("/verifyTwitter/:id", controller.verifyTwitter)
  .get("/:id", controller.getUser)
  .patch("/reviewRequested/:id", controller.reviewRequested)
  .get("/:id/caps", controller.getAccountBalance)
  .post("/create", controller.newUser)
  .post("/:walletId", controller.updateUser)
