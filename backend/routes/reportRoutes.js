import express from 'express';
import { protect, adminOnly } from '../middlewares/authmiddleware.js';
import { exportBugsReport, exportUsersReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/export/bugs', protect, adminOnly, exportBugsReport); // Export all bugs as Excel/PDF
router.get('/export/users', protect, adminOnly, exportUsersReport); // Export user-bug report

export default router;
