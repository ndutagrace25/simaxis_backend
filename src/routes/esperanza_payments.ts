import express, { Router } from "express";
import esperanza_payments from "../controllers/esperanza_payments";
import verifyToken from "../utils/verifyToken";
import { attachCurrentUser, requireDirector } from "../utils/currentUser";
import { saveEsperanzaPayment } from "../utils/esperanzaPaymentValidator";

const router: Router = express.Router();

router.get("/", verifyToken, esperanza_payments.getAllEsperanzaPayments);
router.get(
  "/export",
  verifyToken,
  attachCurrentUser,
  requireDirector,
  esperanza_payments.exportEsperanzaPayments
);
router.get("/:id", verifyToken, esperanza_payments.getEsperanzaPayment);
router.post(
  "/",
  verifyToken,
  attachCurrentUser,
  saveEsperanzaPayment,
  esperanza_payments.createEsperanzaPayment
);
router.put(
  "/:id",
  verifyToken,
  attachCurrentUser,
  saveEsperanzaPayment,
  esperanza_payments.updateEsperanzaPayment
);
router.delete("/:id", verifyToken, esperanza_payments.deleteEsperanzaPayment);

export default router;
