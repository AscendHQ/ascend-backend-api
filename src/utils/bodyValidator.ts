import { Request, Response, NextFunction } from "express";
import { errorResponse } from "./responseHandler";
import { Segments, celebrate } from "celebrate";

const bodyValidator =
  (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    return celebrate({
      [Segments.BODY]: schema,
    })(req, res, (error) => {
      if (error) {
        errorResponse(res, 400, error.joi.details[0].message);
      } else {
        next();
      }
    });
  };

export default bodyValidator;
