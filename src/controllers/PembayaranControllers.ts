import { Request, Response } from "express";
import PembayaranServices from "../services/PembayaranServices";

export default new (class PembayaranControllers {
  find(req: Request, res: Response) {
    PembayaranServices.find(req, res);
  }

  create(req: Request, res: Response) {
    PembayaranServices.create(req, res);
  }

  update(req: Request, res: Response) {
    PembayaranServices.update(req, res);
  }

 pembayaranPerBulan(req: Request, res: Response) {
   PembayaranServices.pembayaranPerBulan(req, res);
 }

 findRekapTotal(req: Request, res: Response) {
   PembayaranServices.findRekapTotal(req, res);
 }

  pembayaranPerRumah(req: Request, res: Response) {
    PembayaranServices.pembayaranPerRumah(req, res);
  }
})();
