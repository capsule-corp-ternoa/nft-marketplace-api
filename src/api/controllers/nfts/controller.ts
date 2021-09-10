import NFTService from "../../services/nft";
import { NextFunction, Request, Response } from "express";
import { LIMIT_MAX_PAGINATION } from "../../../utils";

export class Controller {
  async getAllNFTs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, listed } = req.query;
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      res.json(await NFTService.getAllNFTs(page as string, limit as string, listed as string));
    } catch (err) {
      next(err);
    }
  }

  async getNFT(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.params.id) next(new Error("id parameter is needed"));
    const { incViews, viewerWalletId } = req.query
    const { ip } = req
    try {
      const nft = await NFTService.getNFT(req.params.id, incViews === "true", viewerWalletId as string, ip);
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
      const { page, limit, listed } = req.query;
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      res.json(await NFTService.getNFTsFromOwner(req.params.id, page as string, limit as string, listed as string));
    } catch (err) {
      next(err);
    }
  }

  async getCreatorsNFTs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.params.id) next(new Error("id param is needed"));
    try {
      const { page, limit, listed } = req.query;
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      res.json(await NFTService.getNFTsFromCreator(req.params.id, page as string, limit as string, listed as string));
    } catch (err) {
      next(err);
    }
  }

  async getCategoriesNFTs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, codes, listed } = req.query;
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      const categoriesCodes = codes === undefined ? null : (typeof codes==='string' ? [codes] : codes)
      res.json(await NFTService.getNFTsFromCategories(categoriesCodes as string[] | null, page as string, limit as string, listed as string));
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
      const nft = await NFTService.createNFT(JSON.parse(req.body));
      res.json(nft);
    } catch (err) {
      next(err);
    }
  }

  async getNFTsBySerie(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try {
      const { page, limit } = req.query;
      if (!req.params.id) next(new Error("id parameter is needed"));
      if (page && (isNaN(Number(page)) || Number(page) < 1)) throw new Error("Page argument is invalid")
      if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > LIMIT_MAX_PAGINATION)) throw new Error("Limit argument is invalid")
      const nft = await NFTService.getNFT(req.params.id);
      if (!nft.serieId || nft.serieId === '0' || !nft.owner) throw new Error("NFT is missing data")
      const nfts = (await NFTService.getNFTsForSerie(nft, page as string, limit as string))
      res.json(nfts);
    } catch (err) {
      next(err);
    }
  }
}

export default new Controller();
