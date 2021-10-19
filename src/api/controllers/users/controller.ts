import UserService from "../../services/user";
import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { LIMIT_MAX_PAGINATION, TERNOA_API_URL, decryptCookie } from "../../../utils";

export class Controller {
  async all(req: Request, res: Response): Promise<void> {
    const {page, limit} = req.query
    const data = await fetch(`${TERNOA_API_URL}/api/users/?page=${page}&limit=${limit}`)
    const response = await data.json()
    res.json(response)
  }

  async newUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { body } = req;
      const stringifyBody = typeof body === 'string'? body : JSON.stringify(body)
      const data = await fetch(`${TERNOA_API_URL}/api/users/create`,{
        method: 'POST',
        body : stringifyBody
      });
      const response = await data.json()
      res.json(response)
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
      const { id } = req.params
      const { incViews, walletIdViewer } = req.query
      const { ip } = req
      const user = await UserService.findUser(id, incViews === "true", walletIdViewer as string, ip, true);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getUsersBywalletId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const walletIds = typeof req.query.walletIds === "string" ? [req.query.walletIds] : req.query.walletIds as string[]
      const data = await fetch(`${TERNOA_API_URL}/api/users/getUsers?walletIds=${walletIds.join("&walletIds=")}`)
      const users = await data.json()
      res.json(users);
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
      const {cookie} = JSON.parse(req.body)
      if(cookie && decryptCookie(cookie) === req.params.id){
        const data = await fetch(`${TERNOA_API_URL}/api/users/reviewRequested/${req.params.id}`,{
          method: 'PATCH'
        });
        const user = await data.json()
        res.json(user);
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
  ): Promise<void> {
    try {
      const data = await fetch(`${TERNOA_API_URL}/api/users/${req.params.walletId}`,{
        method: 'POST',
        body: JSON.stringify(req.body)
      });
      const user = await data.json();
      res.json(user);
    } catch (err) {
      next(err)
    }
  }

  async likeNft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletId, nftId, serieId } = req.query
      const {cookie} = JSON.parse(req.body)
      if(cookie && decryptCookie(cookie) === walletId){
        const data = await fetch(`${TERNOA_API_URL}/api/users/like?walletId=${walletId}&nftId=${nftId}&serieId=${serieId}`, {
          method: 'POST',
        })
        const user = await data.json()
        res.json(user);
      }else{
        throw new Error('Unvalid authentication')
      }
    } catch (err) {
      next(err)
    }
  }

  async unlikeNft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletId, nftId, serieId } = req.query
      const {cookie} = JSON.parse(req.body)
      if(cookie && decryptCookie(cookie) === walletId){
        const data = await fetch(`${TERNOA_API_URL}/api/users/unlike?walletId=${walletId}&nftId=${nftId}&serieId=${serieId}`, {
          method: 'POST',
        })
        const user = await data.json()
        res.json(user);
      }else{
          throw new Error('Unvalid authentication')
        }
    } catch (err) {
      next(err)
    }
  }

  async getLikedNfts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      const {page, limit} = req.query
      if (!id) throw new Error("wallet id not given")
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      const nfts = await UserService.getLikedNfts(id as string, page as string, limit as string);
      res.json(nfts);
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
      if (!req.params.id) throw new Error("User wallet id not given")
      res.redirect(`${TERNOA_API_URL}/api/users/verifyTwitter/${req.params.id}`)
    }catch(err){
      next(err)
    }
  }
}
export default new Controller();
