import express from "express";
import controller from "./controller";
export default express
  .Router()
  .get("/:id", controller.getUser)
  .post("/", controller.newUser)
  .get("/", controller.all);
