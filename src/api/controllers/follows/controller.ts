import FollowService from "../../services/follow";
import { NextFunction, Request, Response } from "express";
import { LIMIT_MAX_PAGINATION } from "../../../utils";

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
      const {page, limit} = req.query
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      const users = await FollowService.getUserFollowers(req.params.walletId, page as string, limit as string)
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
      const {page, limit} = req.query
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      const users = await FollowService.getUserFollowings(req.params.walletId, page as string, limit as string)
      res.json(users);
    }catch(err){
      next(err);
    }
  }
}
export default new Controller();
