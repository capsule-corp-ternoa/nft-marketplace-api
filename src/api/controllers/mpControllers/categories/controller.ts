import CategoryService from "../../../services/mpServices/category";

import L from "../../../../common/logger";
import { NextFunction, Request, Response } from "express";

export class Controller {
  async getCategories(
    _: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    res.json(await CategoryService.getCategories().catch(next));
  }
}
export default new Controller();
