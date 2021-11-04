import NFTService from "../../services/nft";
import { NextFunction, Request, Response } from "express";
import { validationGetNFTs, validationGetNFT, validationGetStatNFTsUser, validationCreateNFT, validationNFTsBySeries } from "../../validators/nftValidators";

export class Controller {
  async getNFTs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const queryValues = validationGetNFTs(req.query)
      res.json(await NFTService.getNFTs(queryValues));
    } catch (err) {
      next(err);
    }
  }

  async getNFT(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryValues = validationGetNFT({...req.params, ...req.query})
      res.json(await NFTService.getNFT(queryValues));
    } catch (err) {
      next(err);
    }
  }

  async getStatNFTsUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const queryValues = validationGetStatNFTsUser({...req.params, ...req.query})
      res.json(await NFTService.getStatNFTsUser(queryValues));
    } catch (err) {
      next(err);
    }
  }

  async createNFT(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const queryValues = validationCreateNFT(req.body)
      res.json(await NFTService.createNFT(queryValues));
    } catch (err) {
      next(err);
    }
  }

  async getNFTsBySeries(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try {
      const queryValues = validationNFTsBySeries(req.query)
      res.json(await NFTService.getNFTsForSeries(queryValues));
    } catch (err) {
      next(err);
    }
  }
}

export default new Controller();
