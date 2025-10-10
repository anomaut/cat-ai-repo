import express from 'express';
import fileRoutes from './routes/fileRoutes.mjs';
import generateRoutes from './routes/generateRoutes.mjs';
import apiKeyRoutes from './routes/apiKeyRoutes.mjs';

const router = express.Router();

router.use("/file",fileRoutes);
router.use("/generate",generateRoutes);
router.use("/apikey",apiKeyRoutes);


export default router;