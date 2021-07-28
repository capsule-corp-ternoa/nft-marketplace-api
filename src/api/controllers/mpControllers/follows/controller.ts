import FollowService from "../../../services/mpServices/follow";
import L from "../../../../common/logger";
import { NextFunction, Request, Response } from "express";

export class Controller {
  async follow(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      const {walletIdFollowed, walletIdFollower} = req.query
      if (!walletIdFollowed || !walletIdFollower) next(new Error("wallet ids parameters are needed"));
      res.json(await FollowService.follow(walletIdFollowed as string, walletIdFollower as string));
    }catch(err){
      next(err);
    }
  }

  async unfollow(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      const {walletIdFollowed, walletIdFollower} = req.query
      if (!walletIdFollowed || !walletIdFollower) next(new Error("wallet ids parameters are needed"));
      res.json(await FollowService.unfollow(walletIdFollowed as string, walletIdFollower as string));
    }catch(err){
      next(err);
    }
  }

  async isUserFollowing(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      const {walletIdFollowed, walletIdFollower} = req.query
      if (!walletIdFollowed || !walletIdFollower) next(new Error("wallet ids parameters are needed"));
      res.json(await FollowService.isUserFollowing(walletIdFollower as string, walletIdFollowed as string));
    }catch(err){
      next(err);
    }
  }

  async getUserFollowers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      if (!req.params.walletId) next(new Error("wallet id parameter is needed"));
      const users = await FollowService.getUserFollowers(req.params.walletId)
      res.json(users);
    }catch(err){
      next(err);
    }
  }
  
  async getUserFollowings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      if (!req.params.walletId) next(new Error("wallet id parameter is needed"));
      const users = await FollowService.getUserFollowings(req.params.walletId)
      res.json(users);
    }catch(err){
      next(err);
    }
  }
}
export default new Controller();
