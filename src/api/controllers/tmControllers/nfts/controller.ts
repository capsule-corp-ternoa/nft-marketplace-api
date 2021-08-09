import NFTService from "../../../services/tmServices/nft";
import L from "../../../../common/logger";
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

  async getNFTsDistribution(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { serieId, usersNumber, usersToExclude } = req.query;
      if (!serieId || !usersNumber) throw new Error("Arguments are missing")
      const arrayUserToExclude = !usersToExclude ? [] : (Array.isArray(usersToExclude) ? usersToExclude as string[] : [usersToExclude as string])
      const data = await NFTService.getNFTsDistribution(serieId as string, Number(usersNumber as string), arrayUserToExclude)
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  
}

export default new Controller();
