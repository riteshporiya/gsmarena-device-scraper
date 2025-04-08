import express from 'express';
import { scrappingDeviceUnstructureData, scrappingDeviceStructureData } from '../controller/scrapping.controller.js';

const router = express.Router();

router.post('/scrapping-device-unstructure-data', scrappingDeviceUnstructureData);
router.post('/scrapping-device-structure-data', scrappingDeviceStructureData);

export default router;