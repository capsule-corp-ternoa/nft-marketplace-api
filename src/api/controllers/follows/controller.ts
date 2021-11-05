import FollowService from "../../services/follow";
import { NextFunction, Request, Response } from "express";
import { decryptCookie } from "../../../utils";
import { validationCountFollowersFollowing, validationFollowUnfollow, validationGetFollowersFollowing, validationIsUserFollowing } from "../../validators/followValidators";

export class Controller {
  async getUserFollowers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      const queryValues = validationGetFollowersFollowing({ ...req.params, ...req.query })
      res.json(await FollowService.getUserFollowers(queryValues));
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
      const queryValues = validationGetFollowersFollowing({ ...req.params, ...req.query })
      res.json(await FollowService.getUserFollowings(queryValues));
    }catch(err){
      next(err);
    }
  }

  async countUserFollowers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      const queryValues = validationCountFollowersFollowing(req.params)
      res.json(await FollowService.countUserFollowers(queryValues))
    }catch(err){
      next(err);
    }
  }

  async countUserFollowing(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      const queryValues = validationCountFollowersFollowing(req.params)
      res.json(await FollowService.countUserFollowing(queryValues))
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
      const queryValues = validationIsUserFollowing(req.query)
      res.json(await FollowService.isUserFollowing(queryValues));
    }catch(err){
      next(err);
    }
  }

  async follow(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      const queryValues = validationFollowUnfollow({...req.query, ...JSON.parse(req.body)})
      if(decryptCookie(queryValues.cookie) === queryValues.walletIdFollower){
        res.json(await FollowService.follow(queryValues));
      }else{
        throw new Error('Unvalid authentication')
      }
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
      const queryValues = validationFollowUnfollow({...req.query, ...JSON.parse(req.body)})
      if(decryptCookie(queryValues.cookie) === queryValues.walletIdFollower){
        res.json(await FollowService.unfollow(queryValues));
      }else{
        throw new Error('Unvalid authentication')
      }
    }catch(err){
      next(err);
    }
  }
}
export default new Controller();
