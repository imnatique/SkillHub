import { Router } from "express";
import {
  googleLogin,
  handleLogout,
} from "../controllers/auth.controllers.js";

const router = Router();

router.post("/google", googleLogin);
router.get("/logout", handleLogout);

export default router;