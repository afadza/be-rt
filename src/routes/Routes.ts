import * as express from "express";
import RumahControllers from "../controllers/RumahControllers";
import PembayaranControllers from "../controllers/PembayaranControllers";

const router = express.Router();

router.get("/rumah", RumahControllers.find);
router.post("/rumah", RumahControllers.create);
router.patch("/rumah", RumahControllers.update);
router.delete("/rumah", RumahControllers.delete);

router.get("/pembayaran", PembayaranControllers.find);
router.post("/pembayaran", PembayaranControllers.create);
router.patch("/pembayaran", PembayaranControllers.update);
router.get("/pembayaran/bulanan", PembayaranControllers.pembayaranPerBulan);
router.get("/pembayaran/rekap", PembayaranControllers.findRekapTotal);
router.get("/pembayaran/rumah", PembayaranControllers.pembayaranPerRumah);
router.delete("/pembayaran", PembayaranControllers.delete);

export default router;
