import NFTService from "../../../services/mpServices/nft";
import { NextFunction, Request, Response } from "express";

const LIMIT_MAX = 20;

export class Controller {

  async getUsersNFTS(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.params.id) next(new Error("id param is needed"));
    try {
      const { page, limit } = req.query;
      if (page === undefined || limit === undefined)
        res.json(await NFTService.getNFTsFromOwner(req.params.id));
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
            limitNumber
          )
        );
      }
    } catch (err) {
      next(err);
    }
  }

}

export default new Controller();
