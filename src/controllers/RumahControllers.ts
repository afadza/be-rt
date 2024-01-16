import { Request, Response } from "express";
import RumahServices from "../services/RumahServices";

export default new (class RumahControllers {
  find(req: Request, res: Response) {
    RumahServices.find(req, res);
  }
  create(req: Request, res: Response) {
    RumahServices.create(req, res);
  }
  update(req: Request, res: Response) {
    RumahServices.update(req, res);
  }

  delete(req: Request, res: Response) {
    RumahServices.delete(req, res);
  }
})();
