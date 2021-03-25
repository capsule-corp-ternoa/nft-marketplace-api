import NFTService from "../../services/nft";
import L from "../../../common/logger";
import { NextFunction, Request, Response } from "express";

export class Controller {
  async getAllNFTs(
    _: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const nfts = await NFTService.getAllNFTs();
      res.json(nfts);
    } catch (err) {
      next(err);
    }
  }

  async getNFT(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.params.id) next(new Error("id parameter is needed"));
    try {
      const nft = await NFTService.getNFT(req.params.id);
      res.json(nft);
    } catch (err) {
      next(err);
    }
  }

  async getUsersNFTS(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.params.id) next(new Error("id param is needed"));
    try {
      const nfts = await NFTService.getNFTsFromOwner(req.params.id).catch(next);
      res.json(nfts);
    } catch (err) {
      next(err);
    }
  }
}
export default new Controller();
