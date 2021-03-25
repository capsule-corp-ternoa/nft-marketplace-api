import NFTService from "../../services/nft";
import L from "../../../common/logger";
import { NextFunction, Request, Response } from "express";

export class Controller {
  async getAllNFTs(
    _: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const nfts = await NFTService.getAllNFTs().catch(next);
    res.json(nfts);
  }

  async getNFT(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.params.id) next();
    const nft = await NFTService.getNFT(req.params.id).catch(next);
    res.json(nft);
  }

  async getUsersNFTS(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.params.id) next();
    const nfts = await NFTService.getNFTsFromOwner(req.params.id).catch(next);
    res.json(nfts);
  }
}
export default new Controller();
