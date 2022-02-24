import UserService from "../../services/user";
import { NextFunction, Request, Response } from "express";
import { TERNOA_API_URL, decryptCookie } from "../../../utils";
import { validationGetAccountBalance, validationGetUser, validationReviewRequested, validationGetUsers, validationGetFilters } from "../../validators/userValidators";

export class Controller {
  async getUsers(
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      const queryValues = validationGetUsers({...req.params, ...req.query})
      const users = await UserService.findUsers(queryValues, req.originalUrl);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async newUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.redirect(307, `${TERNOA_API_URL}${req.originalUrl}`)
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
      const queryValues = validationGetUser({...req.params, ...req.query})
      const user = await UserService.findUser(queryValues);
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
      const { cookie } = JSON.parse(req.body)
      const { id } = req.params
      const queryValues = validationReviewRequested({id, cookie})
      if(decryptCookie(queryValues.cookie) === queryValues.id){
        res.redirect(307, `${TERNOA_API_URL}${req.originalUrl}`)
      }else{
        throw new Error('Unvalid authentication')
      }
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
      const queryValues = validationGetAccountBalance(req.params)
      res.json(await UserService.getAccountBalance(queryValues));
    } catch (err) {
      next(err);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.redirect(307, `${TERNOA_API_URL}${req.originalUrl}`)
    } catch (err) {
      next(err)
    }
  }

  async verifyTwitter(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      res.redirect(`${TERNOA_API_URL}${req.originalUrl}`)
    }catch(err){
      next(err)
    }
  }

  async getTopSellers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const queryValues = validationGetFilters(req.query)
      res.json(await UserService.getTopSellers(queryValues));
    } catch (err) {
      next(err)
    }
  }

  async getMostFollowed(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const queryValues = validationGetFilters(req.query)
      res.json(await UserService.getMostFollowed(queryValues));
    } catch (err) {
      next(err)
    }
  }
}
export default new Controller();
