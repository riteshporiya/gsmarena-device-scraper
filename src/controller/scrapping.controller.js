import { grabDeviceHTML } from '../services/scrapping.service.js';
import { scrapeGSMArenaBrands } from '../services/scrapping.brands.service.js';

export const scrappingDeviceUnstructureData = async (req, res, next) => {
  try {
    const { deviceUrl } = req.body.data;
    console.log("🚀 ~ scrappingDeviceUnstructureData ~ deviceUrl:", deviceUrl)
    const data = await grabDeviceHTML(deviceUrl, false);
    res.json({
      data,
      message: "Scraping device with unstructured data completed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const scrappingDeviceStructureData = async (req, res, next) => {
  try {
    const { deviceUrl } = req.body.data;
    const data = await grabDeviceHTML(deviceUrl, true);
    res.json({
      data,
      message: "Scraping device with structured data completed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const scrappingAllBrands = async (req, res, next) => {
  try {
    const data = await scrapeGSMArenaBrands();
    res.json({
      data,
      message: "Scrap all Brands successfully",
    });
  } catch (error) {
    next(error);
  }
}