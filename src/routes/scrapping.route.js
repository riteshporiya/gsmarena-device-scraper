import express from 'express';
import { scrappingDeviceUnstructureData, scrappingDeviceStructureData, scrappingAllBrands } from '../controller/scrapping.controller.js';

const router = express.Router();

router.post('/scrapping-device-unstructure-data', scrappingDeviceUnstructureData);
router.post('/scrapping-device-structure-data', scrappingDeviceStructureData);
router.get('/scrapping-all-brands', scrappingAllBrands);

export default router;