import UserService from "../../services/user";
import L from "../../../common/logger";
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
    const user = await UserService.createUser(req.body).catch(next);
    res.json(user);
  }

  async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.json(await UserService.findUser(req.params.id).catch(next));
  }
}
export default new Controller();
