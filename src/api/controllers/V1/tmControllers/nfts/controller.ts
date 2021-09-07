import NFTService from "../../../../services/V1/mpServices/nft";
import L from "../../../../../common/logger";
import { NextFunction, Request, Response } from "express";

const LIMIT_MAX = 20;

export class Controller {

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
}

export default new Controller();
