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
      const { serieId, ownerId, usersNumber, usersToExclude, specialNFTsIds } = req.query;
      if (!serieId || !ownerId || !usersNumber || !usersToExclude || !specialNFTsIds) throw new Error("Arguments are missing")
      const arrayUserToExclude = usersToExclude === "[]" ? [] : (usersToExclude as string).substring(1, (usersToExclude as string).length - 1).split(',')
      const arraySpecialNFTsIds = specialNFTsIds === "[]" ? [] : (specialNFTsIds as string).substring(1, (specialNFTsIds as string).length - 1).split(',')
      const data = await NFTService.getNFTsDistribution(serieId as string, ownerId as string,  Number(usersNumber as string), arrayUserToExclude, arraySpecialNFTsIds)
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  
}

export default new Controller();
