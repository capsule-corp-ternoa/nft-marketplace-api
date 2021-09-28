import express from "express"
import controller from "./controller"
export default express
    .Router()
    .get("/followers/:walletId", controller.getUserFollowers)
    .get("/followed/:walletId", controller.getUserFollowings)
    .get("/countFollowers/:walletId", controller.countUserFollowers)
    .get("/countFollowed/:walletId", controller.countUserFollowing)
    .get("/isUserFollowing", controller.isUserFollowing)
    .post("/follow", controller.follow)
    .post("/unfollow", controller.unfollow)