import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import chatController from '../controllers/chatController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Chat routes
router.post('/', chatController.createChat);
router.get('/', chatController.getChats);
router.get('/:id', chatController.getChatById);
router.put('/:id', chatController.updateChat);
router.delete('/:id', chatController.deleteChat);

// Message routes
router.post('/:id/messages', upload.array('attachments', 5), chatController.sendMessage);
router.get('/:id/messages', chatController.getMessages);

export default router; 