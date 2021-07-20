import UserService from "../../../services/mpServices/user";
import L from "../../../../common/logger";
import { NextFunction, Request, Response } from "express";

export class Controller {
  all(_: Request, res: Response): void {
    UserService.getAllUsers().then((r) => res.json(r));
  }
  async newUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await UserService.createUser(req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await UserService.findUser(req.params.id, true, true);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async reviewRequested(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const user = await UserService.reviewRequested(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getAccountBalance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const balance = await UserService.getAccountBalance(req.params.id);
      res.json(balance);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      const user = await UserService.updateUser(req.params.id, req.body);
      res.json(user);
    }catch(err){
      next(err)
    }
  }
  
}
export default new Controller();
