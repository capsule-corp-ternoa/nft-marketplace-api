import CategoryService from "../../services/category";
import { NextFunction, Request, Response } from "express";
import { validationGetCategories, validationCreateCategory } from "../../validators/categoryValidators";

export class Controller {
  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      const queryValues = validationGetCategories(req.query)
      res.json(await CategoryService.getCategories(queryValues));
    }catch(err){
      next(err)
    }
  }

  async addCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try{
      const queryValues = validationCreateCategory(req.body)
      res.json(await CategoryService.addCategory(queryValues));
    }catch(err){
      next(err)
    }
  }
}
export default new Controller();
