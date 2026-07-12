import { Router } from 'express';
import { upload } from '../middleware/upload';
import { importCsv } from '../controllers/import.controller';

const router = Router();

router.post('/', upload.single('file'), importCsv);

export default router;
