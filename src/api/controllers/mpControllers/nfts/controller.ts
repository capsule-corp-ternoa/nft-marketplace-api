import NFTService from "../../../services/mpServices/nft";

import L from "../../../../common/logger";
import { NextFunction, Request, Response } from "express";

const LIMIT_MAX = 20;

export class Controller {
  async getAllNFTs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, listed } = req.query;
      if (page === undefined || limit === undefined)
        res.json(await NFTService.getAllNFTs(listed as string));
      else {
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        if (isNaN(pageNumber) || pageNumber < 1)
          throw new Error("Page argument is invalid");
        if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > LIMIT_MAX)
          throw new Error("Limit argument is invalid");

        res.json(await NFTService.getPaginatedNFTs(pageNumber, limitNumber, listed as string));
      }
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
      if (page === undefined || limit === undefined)
        res.json(await NFTService.getNFTsFromOwner(req.params.id, listed as string));
      else {
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        if (isNaN(pageNumber) || pageNumber < 1)
          throw new Error("Page argument is invalid");
        if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > LIMIT_MAX)
          throw new Error("Limit argument is invalid");

        res.json(
          await NFTService.getPaginatedNFTsFromOwner(
            req.params.id,
            pageNumber,
            limitNumber,
            listed as string
          )
        );
      }
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
      if (page === undefined || limit === undefined)
        res.json(await NFTService.getNFTsFromCreator(req.params.id, listed as string));
      else {
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        if (isNaN(pageNumber) || pageNumber < 1)
          throw new Error("Page argument is invalid");
        if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > LIMIT_MAX)
          throw new Error("Limit argument is invalid");

        res.json(
          await NFTService.getPaginatedNFTsFromCreator(
            req.params.id,
            pageNumber,
            limitNumber,
            listed as string
          )
        );
      }
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
      const categoriesCodes = codes === undefined ? null : (typeof codes==='string' ? [codes] : codes)
      if (page === undefined || limit === undefined){
        res.json(await NFTService.getNFTsFromCategories(categoriesCodes as string[] | null, listed as string));
      } else {
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        if (isNaN(pageNumber) || pageNumber < 1)
          throw new Error("Page argument is invalid");
        if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > LIMIT_MAX)
          throw new Error("Limit argument is invalid");

        res.json(
          await NFTService.getPaginatedNFTsFromCategories(
            categoriesCodes as string[] | null,
            pageNumber,
            limitNumber,
            listed as string
          )
        );
      }
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
    // tslint:disable-next-line:no-console
    console.log("aaaaa")
    if (!req.params.id) next(new Error("id parameter is needed"));
    try {
      const nft = await NFTService.getNFT(req.params.id);
      if (nft.serieId === '0' || !nft.owner) throw new Error("NFT is missing data")
      const nfts = (await NFTService.getNFTsForSerie(nft)).nftEntities.nodes
      res.json(nfts);
    } catch (err) {
      next(err);
    }
  }
}

export default new Controller();
