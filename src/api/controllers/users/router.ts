import express from "express";
import controller from "./controller";
export default express
  .Router()
  .patch("/reviewRequested/:id", controller.reviewRequested) // ternoa-api
  .get("/top-sellers", controller.getTopSellers) // ternoa-api
  .get("/most-followed", controller.getMostFollowed) // ternoa-api
  .get("/", controller.getUsers) // ternoa-api
  .get("/verifyTwitter/:id", controller.verifyTwitter) // ternoa-api
  .get("/:id", controller.getUser) // ternoa-api
  .get("/:id/caps", controller.getAccountBalance)
  .post("/create", controller.newUser) // ternoa-api
  .post("/:walletId", controller.updateUser); // ternoa-api
