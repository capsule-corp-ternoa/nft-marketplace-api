import express from "express"
import controller from "./controller"
export default express
    .Router()
    .get("/followers/:walletId", controller.getUserFollowers)
    .get("/followed/:walletId", controller.getUserFollowings)
    .get("/isUserFollowing", controller.isUserFollowing)
    .post("/follow", controller.follow)
    .post("/unfollow", controller.unfollow)