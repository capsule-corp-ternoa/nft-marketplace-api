import express from "express";
import controller from "./controller";
export default express
  .Router()
  .get("/:id", controller.getUser)
  .patch("/patch", controller.patchUser)
  .get("/:id/caps", controller.getAccountBalance)
  .post("/create", controller.newUser)
  .get("/", controller.all)
  .post("/:walletId", controller.updateUser);
