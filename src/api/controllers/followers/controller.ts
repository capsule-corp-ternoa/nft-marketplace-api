import FollowerService from "../../services/follower";
import L from "../../../common/logger";
import { NextFunction, Request, Response } from "express";

export class Controller {
  async getUserFollowers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.json(FollowerService.getUserFollowers(req.params.id).catch(next));
  }
  async getUserFollowings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.json(FollowerService.getUserFollowings(req.params.id).catch(next));
  }
}
export default new Controller();
