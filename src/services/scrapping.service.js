//@ts-nocheck
import axios from 'axios';
import { parse } from 'node-html-parser';
import fs from 'fs';
import FormData from 'form-data';
export async function grabDeviceHTML(ProductURL, isStructure) {
  const devicesHTML = await axios.get(ProductURL, {
    timeout: 10000,
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      Connection: 'keep-alive',
      Host: 'www.gsmarena.com',
      Referer: 'https://www.google.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
      'sec-ch-ua':
        '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': 'Linux',
    },
  });

  return await grabDevices(devicesHTML.data, isStructure);
}

async function grabDevices(devicesHTMLData, isStructure = false) {
    // let deviceHTML = await axios.get(
    //   "https://www.gsmarena.com/lenovo_tab_p11_pro_gen_2-11841.php"
    // );
    // let deviceResponse = deviceHTML.data;
    let deviceData = parse(devicesHTMLData ? devicesHTMLData : '');
    const tableRows = deviceData.querySelectorAll('tr');
    const deviceName = deviceData.querySelectorAll('h1.specs-phone-name-title');
    const version = deviceData.querySelectorAll('#specs-list p');
    const pricingTable = deviceData?.querySelector('.widget');
    const pricingTableRows = pricingTable?.querySelectorAll('tr');
    // let imageHTML;
    // let imageHTMLResponse;
    // let imageResponse;
    // if (
    //   `${deviceData
    //     ?.querySelector(".specs-photo-main a")
    //     ?.getAttribute("href")}` !== "undefined"
    // ) {
    //   imageHTML = await axios.get(
    //     `https://www.gsmarena.com/${deviceData
    //       ?.querySelector(".specs-photo-main a")
    //       ?.getAttribute("href")}`
    //   );
    //   imageHTMLResponse = imageHTML?.data;
    //   imageResponse = parse(deviceResponse);
  
    // }
    // let imageResponse = parse(
    //   deviceData["imagesHTML"] ? deviceData["imagesHTML"] : ""
    // );
    // Get the element with the class "specs-photo-main"
    // const specsPhotoMain = deviceData ?  deviceData.querySelector(".specs-photo-main") : imageResponse.querySelector(".specs-photo-main");
    // Get the <img> tag within the element
    // const imgTag = specsPhotoMain?.querySelector("img");
  
    // Get the value of the "src" attribute (which contains the URL)
    // const mainImageImgSrc = imgTag?.getAttribute("src");
    // console.log('mainImageImgSrc', mainImageImgSrc);
  
    // let pictureList;
    // if (imageResponse) {
    //   pictureList = imageResponse?.querySelectorAll("#pictures-list img");
    // }
  
    const deviceDetails = {};
    let currentHeading = '';
  
    for (const name of deviceName) {
      const deviceName = name?.textContent?.trim();
      deviceDetails['deviceName'] = deviceName;
    }
  
    // deviceDetails["images"] = [];
    // for (const pic of pictureList) {
    //   let link = pic?.getAttribute("src") || pic?.getAttribute("data-src");
    //   if (link !== undefined && link?.includes("vv/pics")) {
    //     deviceDetails["images"].push(link);
    //   }
    // }
    // if (deviceDetails["images"]?.length) saveImagesInPictureFolder(deviceDetails);
    for (const v of version) {
      const versionInfo = v?.textContent
        ?.trim()
        .split('\n')
        .map((res) => res.trim());
      deviceDetails['info'] = versionInfo;
    }
    // let i = 0;
    let previousKey = '';
    for (const row of tableRows) {
      // i = i + 1;
      const thElement = row.querySelector('th');
      const keyElement = row.querySelector('.ttl');
      const valueElement = row.querySelector('.nfo');
      if (thElement) {
        currentHeading = thElement?.textContent
          ?.trim()
          ?.replaceAll(' ', '_')
          ?.toLowerCase();
        deviceDetails[currentHeading] = {};
      }
  
      if (keyElement && valueElement) {
        const key = keyElement?.textContent
          ?.trim()
          ?.replaceAll(' ', '_')
          .replaceAll('.', '_')
          .toLowerCase();
  
        const value = valueElement?.textContent?.trim()?.replaceAll('\r', '');
        if (key !== '') {
          if (currentHeading === 'network' && key === 'technology') {
            deviceDetails[currentHeading][key] = value
              ?.split('/')
              ?.map((res) => res.trim());
          } else if (currentHeading === 'network' && key === 'gprs') {
            if (value.trim() === 'No') {
              deviceDetails[currentHeading][key] = false;
            } else {
              deviceDetails[currentHeading][key] = true;
            }
          } else if (currentHeading === 'network' && key === 'edge') {
            if (value.trim() === 'No') {
              deviceDetails[currentHeading][key] = false;
            } else {
              deviceDetails[currentHeading][key] = true;
            }
          } else if (currentHeading === 'network' && key === 'speed') {
            // Network Speed:
            // "HSPA 21.1/5.76 Mbps"
            //   speed:  {
            //              type:"HSPA"
            //              "download_speed":21.1,
            //              "upload_speed":5.76
            //            }
            // "HSPA 42.2/5.76 Mbps, LTE Cat4 150/50 Mbps or LTE-A (2CA) Cat6 300/50 M…"
            //   speed:  [{
            //              type:"HSPA"
            //              "download_speed": 42.2,
            //              "upload_speed":5.76
            //            },{
            //              type:"LTE Cat4"
            //              "download_speed":150,
            //              "upload_speed":50
            //            },{
            //              type:"LTE-A (2CA) Cat6"
            //              "download_speed":300,
            //              "upload_speed":50
            //            }]
            // "HSPA, LTE Cat4 150/50 Mbps"
            //   speed:  [{
            //              type:"HSPA"
            //              "download_speed":null,
            //              "upload_speed":null
            //            },{
            //              type:"LTE Cat4"
            //              "download_speed":150,
            //              "upload_speed":50
            //            }]
            //  HSPA
            //  speed:Yes, 384 kbps
            //  HSPA 42.2/5.76 Mbps, LTE Cat4 150/50 Mbps
            //  "HSPA, LTE"
            //  TD-SCDMA
            // "HSPA, LTE, 5G"
            //   speed:  [{
            //              type:"HSPA"
            //              "download_speed":null,
            //              "upload_speed":null
            //            },{
            //              type:"LTE"
            //        "download_speed":null,
            //              "upload_speed":null
            //            },{
            //              type:"5G"
            //        "download_speed":null,
            //              "upload_speed":null
            //            }]
            // "HSPA 42.2/5.76 Mbps, LTE-A (2CA) Cat6 300/50 Mbps"
            // "No"||"N/A"
            //speed=[]
            let speedValue = value?.trim();
  
            let speedObj;
            if (speedValue?.split(',').length === 1 && speedValue === 'No') {
              speedObj = null;
            } else if (
              speedValue?.includes('Yes,') &&
              speedValue?.split(',').length === 2
            ) {
              speedObj = null;
            } else if (speedValue === 'N/A') {
              speedObj = null;
            } else if (
              speedValue?.split(',').length === 1 &&
              !speedValue?.split(',')[0].includes('/')
            ) {
              speedObj = [
                {
                  type: !speedValue?.split(',')[0].includes('/')
                    ? speedValue?.split(',')[0]
                    : null,
                  download_speed: null,
                  upload_speed: null,
                },
              ];
            } else if (
              speedValue?.split(',').length === 1 &&
              speedValue?.split(',')[0].includes('/')
            ) {
              speedObj = [
                {
                  type: speedValue?.split(' ')[0],
                  download_speed: parseFloat(
                    speedValue
                      ?.split(' ')
                      .map((res) => {
                        if (res.includes('/')) {
                          return res.split('/')[0];
                        }
                      })
                      .filter((res) => res !== undefined),
                  ),
                  upload_speed: parseFloat(
                    speedValue
                      ?.split(' ')
                      .map((res) => {
                        if (res.includes('/')) {
                          return res.split('/')[1];
                        }
                      })
                      .filter((res) => res !== undefined),
                  ),
                },
              ];
            } else if (/^(HSPA|LTE|5G)$/.test(speedValue)) {
              speedObj = speedValue?.split(',').map((res) => ({
                type: res.trim(),
                download_speed: null,
                upload_speed: null,
              }));
            } else if (
              /([^,\s]+(?:\s[^,\s]+)?)\s([\d.]+)\/([\d.]+)\sMbps/g.test(
                speedValue,
              )
            ) {
              let regex = /([^,\s]+(?:\s[^,\s]+)?)\s([\d.]+)\/([\d.]+)\sMbps/g;
              let match;
              speedObj = [];
              while ((match = regex.exec(speedValue)) !== null) {
                let obj = {
                  type: match[1],
                  download_speed: parseFloat(match[2]),
                  upload_speed: parseFloat(match[3]),
                };
                speedObj.push(obj);
              }
            } else if (speedValue?.split(',')?.length === 2) {
              speedObj = speedValue?.split(',')?.map((res) => ({
                type: res.trim(),
                download_speed: null,
                upload_speed: null,
              }));
            } else {
              speedObj = speedValue?.split(',')?.map((res) => ({
                type: res.trim(),
                download_speed: null,
                upload_speed: null,
              }));
            }
            deviceDetails[currentHeading][key] =
              speedObj !== undefined ? speedObj : {};
          } else if (currentHeading === 'launch' && key === 'announced') {
            // launch - announced - posibility;
            // ("2016, August. Released 2016, December");
            // ("2016, February");
            // ("2023, February 24");
            // announced:{
            //   announced_date:{
            //     year:2023, month:February,day:24
            //   }
            //   released:{}
            // }
            // ("2013. Released 2013");
            // announced:{
            //   announced_date:{
            //     year:2016, month:August,day:null
            //   }
            //   released:{ year:2016, month:December,,day:null}
            // }
            let announcedValue = value?.trim();
            let announcedObject = {};
            const regexPattern = /^(\d{4}), (\w+)\. Released (\d{4}), (\w+)$/;
            let matchResult = announcedValue.match(regexPattern);
            // if (announcedValue === "Discontinued") {
            //   deviceDetails[currentHeading][key] = {};
            // } else
            if (matchResult) {
              announcedObject = {
                announced: {
                  year: parseInt(matchResult[1]),
                  month: matchResult[2],
                  day: null,
                },
                released: {
                  year: parseInt(matchResult[3]),
                  month: matchResult[4],
                  day: null,
                },
              };
            } else if (announcedValue.match(/^(\d{4}), (\w+)$/)) {
              let matchResult = announcedValue.match(/^(\d{4}), (\w+)$/);
              if (matchResult) {
                announcedObject = {
                  announced: {
                    year: parseInt(matchResult[1]),
                    month: matchResult[2],
                    day: null,
                  },
                  released: {},
                };
              }
            } else if (announcedValue.match(/^(\d{4}), (\w+) (\d{1,2})$/)) {
              let matchResult = announcedValue.match(
                /^(\d{4}), (\w+) (\d{1,2})$/,
              );
              if (matchResult) {
                announcedObject = {
                  announced: {
                    year: parseInt(matchResult[1]),
                    month: matchResult[2],
                    day: parseInt(matchResult[3]),
                  },
                  released: {},
                };
              }
            } else if (announcedValue.match(/^(\d{4})\. Released \1$/)) {
              let matchResult = announcedValue.match(/^(\d{4})\. Released \1$/);
              if (matchResult) {
                announcedObject = {
                  announced: {
                    year: parseInt(matchResult[1]),
                    month: null,
                    day: null,
                  },
                  released: {
                    year: parseInt(matchResult[1]),
                    month: null,
                    day: null,
                  },
                };
              }
            } else {
              deviceDetails[currentHeading] = {};
            }
            deviceDetails[currentHeading] = announcedObject;
          }
          // else if (currentHeading === "body" && key === "dimensions") {
          //   let dimensionsObject;
          //   if (value?.includes("x")) {
          //     const dimensionsArray = value?.trim()?.split(" ");
          //     dimensionsObject = {
          //       width: parseInt(dimensionsArray[0]),
          //       height: isNaN(parseInt(dimensionsArray[2]))
          //         ? parseInt(dimensionsArray[3])
          //         : parseInt(dimensionsArray[2]),
          //       depth:
          //         dimensionsArray[4] === "mm"
          //           ? null
          //           : parseInt(dimensionsArray[4]),
          //     };
          //     // console.log("value", value);
          //     // console.log("dimensionsObject", dimensionsObject);
          //   } else {
          //     dimensionsObject = {};
          //   }
          //   deviceDetails[currentHeading][key] = dimensionsObject;
          // }
          else if (currentHeading === 'body' && key === 'weight') {
            deviceDetails[currentHeading][key] =
              value !== '-' && value !== ''
                ? parseInt(value?.split(' ')[0]?.match(/\d/g)?.join(''))
                : null;
          } else if (currentHeading === 'platform' && key === 'os') {
            const osString = value?.trim();
            let osObject;
            if (/^(\w+)\s([\d.]+)\s\((\w+)\)$/.test(osString)) {
              //Android 6.0 (Marshmallow)
              // osObject = {
              //   os: Android,
              //   version: 6.0,
              //   upgradableVersion: null,
              // };
              let matchResult = osString.match(/^(\w+)\s([\d.]+)\s\((\w+)\)$/);
              const os = matchResult[1];
              const version = matchResult[2];
              osObject = {
                type: os,
                version: version,
                upgradableVersion: null,
              };
            } else if (osString.match(/^(\w+)\s([\d.]+)\s\(([\w\s]+)\)$/)) {
              //Android 4.2.2 (Jelly Bean)
              // osObject = {
              //   os: Android,
              //   version: 6.0,
              //   upgradableVersion: null,
              // };
              let matchResult = osString.match(
                /^(\w+)\s([\d.]+)\s\(([\w\s]+)\)$/,
              );
              const os = matchResult[1];
              const version = matchResult[2];
              osObject = {
                type: os,
                version: version,
                upgradableVersion: null,
              };
            } else if (
              osString.match(
                /^(\w+)\s([\d.]+)\s\(([\w\s]+)\), upgradable to ([\d.]+)\s\(([\w\s]+)\)$/,
              )
            ) {
              //Android 4.0 (Ice Cream Sandwich), upgradable to 4.1 (Jelly Bean)
              // osObject = {
              //   os: Android,
              //   version: 4.0,
              //   upgradableVersion: 4.1,
              // };
              let matchResult = osString?.match(
                /^(\w+)\s([\d.]+)\s\(([\w\s]+)\), upgradable to ([\d.]+)\s\(([\w\s]+)\)$/,
              );
              if (matchResult) {
                const os = matchResult[1];
                const version = matchResult[2];
                const upgradableVersion = matchResult[4];
                osObject = {
                  type: os,
                  version: version,
                  upgradableVersion: upgradableVersion,
                };
              }
            } else if (
              /^(\w+\s\d+\.\d+),\supgradable\sto\s(\d+\.\d+)\s\(([\w\s]+)\)$/.exec(
                osString,
              )
            ) {
              // Android 3.0, upgradable to 4.0 (Ice Cream Sandwich)
              //   {
              //     "os": "Android",
              //     "version": "3.0",
              //     "upgradableVersion": "4.0",
              // }
              let matchResult =
                /^(\w+\s\d+\.\d+),\supgradable\sto\s(\d+\.\d+)\s\(([\w\s]+)\)$/.exec(
                  osString,
                );
              osObject = {
                type: matchResult[1].split(' ')[0],
                version: matchResult[1].split(' ')[1],
                upgradableVersion: matchResult[2],
              };
            } else if (/^(\w+)\s([\w\s]+)$/.exec(osString)) {
              //Microsoft Windows 10
              //   {
              //     "os": "Microsoft",
              //     "version": "Windows 10",
              //     "upgradableVersion": null,
              // }
              let matchResult = /^(\w+)\s([\w\s]+)$/.exec(osString);
              osObject = {
                type: matchResult[1],
                version: /\d/?.test(matchResult[2]) ? matchResult[2] : null,
                upgradableVersion: null,
              };
              //Android OS
              //Microsoft Windows Phone 7.5 Mango
              //Microsoft Windows Mobile 6.1 Professional
              //Microsoft Windows Mobile 6.5.3
            } else if (
              /^(\w+)\s(\d+\.\d+)\s\(([\w\s]+)\),\s([\w\s]+)$/.exec(osString)
            ) {
              //Android 4.2 (Jelly Bean), Float UI
              let matchResult =
                /^(\w+)\s(\d+\.\d+)\s\(([\w\s]+)\),\s([\w\s]+)$/.exec(osString);
              osObject = {
                type: matchResult[1],
                version: matchResult[2],
                upgradableVersion: null,
              };
            } else if (osString === 'Firefox 2.0') {
              osObject = {
                type: 'Firefox',
                version: '2.0',
                upgradableVersion: null,
              };
            } else {
              osObject = {
                type: osString,
              };
            }
            deviceDetails[currentHeading][key] = osObject;
          } else if (currentHeading === 'platform' && key === 'chipset') {
            let chipsetString = value?.trim();
            let chipsetArray;
            if (
              /^([\w\s]+)\s([\w\s\d]+)(?:\s\(([\d\s\w]+)\))?$/.test(chipsetString)
            ) {
              // Qualcomm MSM8926 Snapdragon 400 (28 nm)
              //   [
              //     {
              //         "processor": "Qualcomm MSM8926 Snapdragon",
              //         "model": "400",
              //         "manufacturing_technology": "28 nm"
              //     }
              // ]
              // Mediatek MT6582 (28 nm)
              // Nvidia Tegra 3
              //  [ {
              //     "processor": "Nvidia Tegra",
              //     "model": "3",
              //     "manufacturing_technology": null
              // }]
              //MT7198D
              let regexResult =
                /^([\w\s]+)\s([\w\s\d]+)(?:\s\(([\d\s\w]+)\))?$/.exec(
                  chipsetString,
                );
              chipsetArray = [
                {
                  processor: regexResult[1],
                  model: regexResult[2].trim(),
                  manufacturing_technology: regexResult[3] || '',
                },
              ];
            } else if (
              /^(.*?)\s(.*?)(?:\s\((\d+\s?nm)\))?$/.exec(chipsetString)
            ) {
              let regexResult = /^(.*?)\s(.*?)(?:\s\((\d+\s?nm)\))?$/.exec(
                chipsetString,
              );
              //'Qualcomm SM8550-AB Snapdragon 8 Gen 2 (4 nm)'
              chipsetArray = [
                {
                  processor: regexResult[1],
                  model: regexResult[2].trim(),
                  manufacturing_technology: regexResult[3] || '',
                },
              ];
            } else if (
              /(\w+)\s([\w\s-]+)(?:\s\((\d+)\snm\))?/.exec(chipsetString)
            ) {
              let regexResult = /(\w+)\s([\w\s-]+)(?:\s\((\d+)\snm\))?/.exec(
                chipsetString,
              );
              //Intel Atom x7-Z8700
              chipsetArray = [
                {
                  processor: regexResult[1],
                  model: regexResult[2].trim(),
                  manufacturing_technology: regexResult[3] || '',
                },
              ];
              // console.log("🚀 ~ file: scrapping.ts:579 ~ grabDevices ~ chipsetArray:", regexResult)
            } else if (
              value?.trim() === 'Mediatek MT6580 - Z525Mediatek MT6735 - Z525'
            ) {
              chipsetArray = [
                {
                  processor: 'Mediatek MT6580',
                  model: null,
                  manufacturing_technology: 'Z525',
                },
                {
                  processor: 'Mediatek MT6735',
                  model: null,
                  manufacturing_technology: 'Z525',
                },
              ];
            } else if (value?.trim() === 'MT7198D') {
              chipsetArray = [
                {
                  processor: 'MT7198D',
                  model: null,
                  manufacturing_technology: null,
                },
              ];
            } else {
              chipsetArray = [{ processor: chipsetString, model: '' }];
            }
            deviceDetails[currentHeading][key] = chipsetArray;
          } else if (currentHeading === 'platform' && key === 'cpu') {
            let cpuString = value?.trim();
            let cpuArray;
            if (/^(\w+-\w+)$/g.exec(cpuString)) {
              //Quad-core
              let regexResult = /^(\w+-\w+)$/g.exec(cpuString);
              cpuArray = [
                {
                  cores: regexResult[1],
                  frequency: null,
                  architecture: null,
                },
              ];
            } else if (
              /^(\w+)-core\s([\d.]+)\sGHz(?:\s([\w-]+))?$/.exec(cpuString)
            ) {
              //Quad-core 1.3 GHz Cortex-A53
              //Quad-core 1.33 GHz
              //   [
              //     {
              //         "cores": "Quad",
              //         "frequency": 1.3,
              //         "architecture": "Cortex-A53"
              //     }
              // ]
              let regexResult = /^(\w+)-core\s([\d.]+)\sGHz(?:\s([\w-]+))?$/.exec(
                cpuString,
              );
              cpuArray = [
                {
                  cores: regexResult[1],
                  frequency: parseFloat(regexResult[2]),
                  architecture: regexResult[3] || null,
                },
              ];
            } else if (/^([\d.]+)\s(GHz|MHz)$/.exec(cpuString)) {
              //1.2 GHz||416 MHz
              let regexResult = /^([\d.]+)\s(GHz|MHz)$/.exec(cpuString);
              cpuArray = [
                {
                  cores: null,
                  frequency:
                    regexResult[2] === 'MHz'
                      ? parseFloat(regexResult[1]) / 1000
                      : parseFloat(regexResult[1]),
                  architecture: null,
                },
              ];
            } else if (/^([\d.]+)\s(MHz|GHz)\s([\w\s-]+)$/.exec(cpuString)) {
              //1.0 GHz Cortex-A5
              let regexResult = /^([\d.]+)\s(MHz|GHz)\s([\w\s-]+)$/.exec(
                cpuString,
              );
              cpuArray = [
                {
                  cores: null,
                  frequency:
                    regexResult[2] === 'MHz'
                      ? parseFloat(regexResult[1]) / 1000
                      : parseFloat(regexResult[1]),
                  architecture: regexResult[3],
                },
              ];
            } else if (/^(.+)\s(\d+)\sMHz$/.exec(cpuString)) {
              //Samsung S3C 6410 533 MHz
              //   {
              //     "cores": "Samsung S3C 6410",
              //     "frequency": 533,
              //     "architecture": null
              // }
              let regexResult = /^(.+)\s(\d+)\sMHz$/.exec(cpuString);
              cpuArray = [
                {
                  cores: regexResult[1],
                  frequency: parseFloat(regexResult[2]) / 1000,
                  architecture: null,
                },
              ];
            } else if (
              /(\w+)-core\s([\d.]+)\sGHz\s([\w\s]+)\s(\d+)/.exec(cpuString)
            ) {
              let regexResult =
                /(\w+)-core\s([\d.]+)\sGHz\s([\w\s]+)\s(\d+)/.exec(cpuString);
              cpuArray = [
                {
                  cores: regexResult[1],
                  frequency: parseFloat(regexResult[2]),
                  architecture: `${regexResult[3]} ${regexResult[4]}`,
                },
              ];
            } else if (/^(.+?)(?:,?\s)?(\d+)\s?(?:MHz)?$/.exec(cpuString)) {
              //ST Ericsson PNX6715, 416 MHz||ST Ericsson PNX6715 416MHz
              let regexResult = /^(.+?)(?:,?\s)?(\d+)\s?(?:MHz)?$/.exec(
                cpuString,
              );
              cpuArray = [
                {
                  cores: regexResult[1],
                  frequency: parseFloat(regexResult[2]) / 1000,
                  architecture: regexResult[3] || '',
                },
              ];
            } else if (/^(\d+)\s?MHz\s(.+)$/.exec(cpuString)) {
              let regexResult = /^(\d+)\s?MHz\s(.+)$/.exec(cpuString);
              cpuArray = [
                {
                  cores: regexResult[2]?.trim(),
                  frequency: parseFloat(regexResult[1]),
                  architecture: regexResult[3] || '',
                },
              ];
            } else if (/^([\d.]+)\s?(?:GHz|MHz)\s(\w+)\s?$/.exec(cpuString)) {
              //800 MHz Scorpion
              //1.0 GHz Scorpion
              let regexResult = /^([\d.]+)\s?(?:GHz|MHz)\s(\w+)\s?$/.exec(
                cpuString,
              );
              cpuArray = [
                {
                  cores: null,
                  frequency: cpuString?.includes('MHz')
                    ? parseFloat(regexResult[1]) / 1000
                    : parseFloat(regexResult[1]),
                  architecture: regexResult[2],
                },
              ];
            } else {
              cpuArray = [cpuString];
            }
            // console.log(cpuArray);
            deviceDetails[currentHeading][key] = cpuArray;
          } else if (currentHeading === 'platform' && key === 'gpu') {
            let gpuString = value?.trim();
            let gpuObject;
            // console.log("gpuString", gpuString);
            if (gpuString === 'No') {
              gpuObject = {};
            } else if (/^(\w+)-(\w+)(\d+)$/.exec(gpuString)) {
              //Mali-T720MP3
              let regexResult = /^(\w+)-(\w+)(\d+)$/.exec(gpuString);
              gpuObject = {
                series: regexResult[1],
                model: regexResult[2] + regexResult[3],
              };
            } else if (/^(\w+)\s(\d+)$/.exec(gpuString)) {
              //Adreno 304
              let regexResult = /^(\w+)\s(\d+)$/.exec(gpuString);
              gpuObject = {
                series: regexResult[1],
                model: regexResult[2],
              };
            } else if (/^(\w+)\s([\w\s\d()]+)$/.exec(gpuString)) {
              //Intel Gen 7 (Ivy Bridge)
              let regexResult = /^(\w+)\s([\w\s\d()]+)$/.exec(gpuString);
              gpuObject = {
                series: regexResult[1],
                model: regexResult[2],
              };
            } else if (/^(IMG)\s([\w-]+)$/.exec(gpuString)) {
              //IMG BXM-8-256
              let regexResult = /^(IMG)\s([\w-]+)$/.exec(gpuString);
              gpuObject = {
                series: regexResult[1],
                model: regexResult[2],
              };
            } else if (/^(\w+)(\d+u?)$/.exec(gpuString)) {
              //SGX531u
              let regexResult = /^(\w+)(\d+u?)$/.exec(gpuString);
              gpuObject = {
                series: null,
                model: regexResult[2] + regexResult[1],
              };
            } else if (/(\w+)-(\d+)\s(\w+)/.exec(gpuString)) {
              //Mali-T880 MP4
              let regexResult = /(\w+)-(\d+)\s(\w+)/.exec(gpuString);
              gpuObject = {
                series: regexResult[1],
                model: regexResult[2],
                core: parseInt(regexResult[3].replace('MP', '')),
              };
            }
            // console.log(gpuObject);
            deviceDetails[currentHeading][key] = gpuObject;
          } else if (currentHeading === 'memory' && key === 'card_slot') {
            let cardSlotString = value?.trim();
            deviceDetails[currentHeading][key] = cardSlotString
              .split(' ')[0]
              .trim();
          } else if (currentHeading === 'memory' && key === 'internal') {
            deviceDetails[currentHeading][key] = value
              ?.split(',')
              ?.map((res) => res.trim());
          } else if (
            (currentHeading === 'memory' && key === 'phonebook') ||
            (currentHeading === 'memory' && key === 'call_records')
          ) {
            if (value.trim() === 'No') {
              deviceDetails[currentHeading][key] = false;
            } else {
              deviceDetails[currentHeading][key] = true;
            }
          } else if (
            (currentHeading === 'main_camera' && key === 'single') ||
            (currentHeading === 'selfie_camera' && key === 'single') ||
            (currentHeading === 'main_camera' && key === 'dual') ||
            (currentHeading === 'selfie_camera' && key === 'dual') ||
            (currentHeading === 'main_camera' && key === 'triple') ||
            (currentHeading === 'selfie_camera' && key === 'triple') ||
            (currentHeading === 'main_camera' && key === 'quad')
          ) {
            let cameraString = value.trim();
            let cameraObj = {};
            cameraString.split('\n').map((res, i) => {
              if (i === 0) {
                cameraObj.resolution = !isNaN(
                  parseFloat(
                    res?.split(',')?.filter((res) => {
                      if (/^(\d+(\.\d+)?)\s?MP$/i.test(res.trim())) {
                        return res;
                      }
                    }),
                  ),
                )
                  ? parseFloat(
                      res?.split(',')?.filter((res) => {
                        if (/^(\d+(\.\d+)?)\s?MP$/i.test(res.trim())) {
                          return res;
                        }
                      }),
                    )
                  : cameraString === 'VGA'
                    ? 0.3
                    : null;
                cameraObj.aperture =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (/^f\/(\d+(?:\.\d+)?)$/.test(res.trim())) {
                        return res;
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (/^f\/(\d+(?:\.\d+)?)$/.test(res.trim())) {
                            return res;
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.autoFocus =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (res.includes('AF')) {
                        return res;
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (res.includes('AF')) {
                            return res;
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.lense =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (/^\(([\w\s.-]+)\)$/.test(res.trim())) {
                        return res;
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (/\((wide|depth|ultrawide)\)/.test(res.trim())) {
                            return res;
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.pixelSize = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('µm') ? res : null))
                  .join('');
                cameraObj.imageStabalization = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('OIS') ? res : null))
                  .join('');
                cameraObj.sensorSize = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('optical zoom') ? res : null))
                  .join('');
                // console.log('cameraObj', JSON.stringify(cameraObj));
              } else if (i === 1) {
                cameraObj.secondaryResolution = !isNaN(
                  parseFloat(
                    res?.split(',')?.filter((res) => {
                      if (/^(\d+(\.\d+)?)\s?MP$/i.test(res)) {
                        return res;
                      }
                    }),
                  ),
                )
                  ? parseFloat(
                      res?.split(',')?.filter((res) => {
                        if (/^(\d+(\.\d+)?)\s?MP$/i.test(res)) {
                          return res;
                        }
                      }),
                    )
                  : cameraString === 'VGA'
                    ? 0.3
                    : null;
                cameraObj.secondaryAperture =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (/^f\/(\d+(?:\.\d+)?)$/.test(res.trim())) {
                        return res;
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (/^f\/(\d+(?:\.\d+)?)$/.test(res.trim())) {
                            return res;
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.secondaryLense =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (/^\(([\w\s.-]+)\)$/.test(res.trim())) {
                        return res.trim();
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (/\((wide|depth|ultrawide)\)/.test(res.trim())) {
                            return res.trim();
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.secondaryAutoFocus =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (res.includes('AF')) {
                        return res;
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (res.includes('AF')) {
                            return res;
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.secondaryPixelSize = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('µm') ? res : null))
                  .join('');
                cameraObj.secondaryImageStabalization = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('OIS') ? res : null))
                  .join('');
                cameraObj.secondarySensorSize = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('optical zoom') ? res : null))
                  .join('');
              } else if (i === 2) {
                cameraObj.thirdResolution = !isNaN(
                  parseFloat(
                    res?.split(',')?.filter((res) => {
                      if (/^(\d+(\.\d+)?)\s?MP$/i.test(res)) {
                        return res;
                      }
                    }),
                  ),
                )
                  ? parseFloat(
                      res?.split(',')?.filter((res) => {
                        if (/^(\d+(\.\d+)?)\s?MP$/i.test(res)) {
                          return res;
                        }
                      }),
                    )
                  : cameraString === 'VGA'
                    ? 0.3
                    : null;
                cameraObj.thirdAperture =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (/^f\/(\d+(?:\.\d+)?)$/.test(res.trim())) {
                        return res;
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (/^f\/(\d+(?:\.\d+)?)$/.test(res.trim())) {
                            return res;
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.thirdLense =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (/^\(([\w\s.-]+)\)$/.test(res.trim())) {
                        return res.trim();
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (/\((wide|depth|ultrawide)\)/.test(res.trim())) {
                            return res.trim();
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.thirdAutoFocus =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (res.includes('AF')) {
                        return res;
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (res.includes('AF')) {
                            return res;
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.thirdPixelSize = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('µm') ? res : null))
                  .join('');
                cameraObj.thirdImageStabalization = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('OIS') ? res : null))
                  .join('');
                cameraObj.thirdSensorSize = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('optical zoom') ? res : null))
                  .join('');
              } else {
                cameraObj.quadResolution = !isNaN(
                  parseFloat(
                    res?.split(',')?.filter((res) => {
                      if (/^(\d+(\.\d+)?)\s?MP$/i.test(res)) {
                        return res;
                      }
                    }),
                  ),
                )
                  ? parseFloat(
                      res?.split(',')?.filter((res) => {
                        if (/^(\d+(\.\d+)?)\s?MP$/i.test(res)) {
                          return res;
                        }
                      }),
                    )
                  : cameraString === 'VGA'
                    ? 0.3
                    : null;
                cameraObj.quadAperture =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (/^f\/(\d+(?:\.\d+)?)$/.test(res.trim())) {
                        return res;
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (/^f\/(\d+(?:\.\d+)?)$/.test(res.trim())) {
                            return res;
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.quadLense =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (/^\(([\w\s.-]+)\)$/.test(res.trim())) {
                        return res.trim();
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (/\((wide|depth|ultrawide)\)/.test(res.trim())) {
                            return res.trim();
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.quadAutoFocus =
                  String(
                    res?.split(',')?.filter((res) => {
                      if (res.includes('AF')) {
                        return res;
                      }
                    }),
                  ).trim() !== ''
                    ? String(
                        res?.split(',')?.filter((res) => {
                          if (res.includes('AF')) {
                            return res;
                          }
                        }),
                      ).trim()
                    : null;
                cameraObj.quadPixelSize = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('µm') ? res : null))
                  .join('');
                cameraObj.quadImageStabalization = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('OIS') ? res : null))
                  .join('');
                cameraObj.quadSensorSize = res
                  ?.split(',')
                  ?.filter((res) => (res.includes('optical zoom') ? res : null))
                  .join('');
              }
            });
            // console.log("cameraObj",cameraObj)
            const keys = Object.keys(cameraObj);
            const result = [];
  
            for (let i = 0; i < keys.length; i += 7) {
              const obj = {};
              for (let j = i; j < i + 7 && j < keys.length; j++) {
                const key = keys[j];
                const newKey = key
                  .replace(/(primary|secondary|third)/, '')
                  .toLowerCase();
                obj[newKey] = cameraObj[key];
                // obj['camera_string'] = cameraString
              }
              result.push(obj);
            }
            // console.log(result);
            deviceDetails[currentHeading]['data'] = result;
          } else if (
            (currentHeading === 'main_camera' && key === 'video') ||
            (currentHeading === 'selfie_camera' && key === 'video')
          ) {
            let videoString = value?.trim();
            let videoArr;
            if (videoString === 'Yes') {
              videoArr = [];
            } else if (/^(\d+p)@(\d+fps)$/.exec(videoString)) {
              //1080p@30fps
              let regexResult = /^(\d+p)@(\d+fps)$/.exec(videoString);
              videoArr = [
                {
                  resolution: parseFloat(regexResult[1]),
                  frameRate: parseFloat(regexResult[2]),
                },
              ];
            } else if (/(\d+K|1080p)@(\d+fps)/g.exec(videoString)) {
              /(\d+K|1080p)@(\d+fps)/g;
              //4K@30fps, 1080p@30fps
              //   [
              //     {
              //         "resolution": "4K",
              //         "frameRate": 30
              //     },
              //     {
              //         "resolution": "1080p",
              //         "frameRate": 30
              //     }
              // ]
              const matches = videoString.match(/(\d+K|1080p)@(\d+fps)/g);
              videoArr = matches.map((match) => {
                let regexResult = /(\d+K|1080p)@(\d+fps)/.exec(match);
                return {
                  resolution: regexResult.includes('K')
                    ? parseFloat(regexResult) * 1000
                    : parseFloat(regexResult),
                  frameRate: parseFloat(regexResult[2]),
                };
              });
              // console.log(videoArr);
            }
            // else if (/^(\d+p)@(\d+fps)$/.exec(videoString)) {
            //   //720p@960fps
            //   let regexResult =  /^(\d+p)@(\d+fps)$/.exec(videoString);
            //   videoArr = [
            //     {
            //       resolution: parseFloat(regexResult[1]),
            //       frameRate: parseFloat(regexResult[2]),
            //     },
            //   ];
            // }
            else if (/(\d+)p/.exec(videoString)) {
              //720p
              let regexResult = /(\d+)p/.exec(videoString);
              videoArr = [
                {
                  resolution: parseFloat(regexResult[1]),
                  frameRate: null,
                },
              ];
            } else if (/^(.*),\s(.*)$/.exec(videoString)) {
              //Yes, dual shot
              let regexResult = /^(.*),\s(.*)$/.exec(videoString);
              videoArr = [
                {
                  resolution: null,
                  frameRate: null,
                  mode: regexResult[2].trim(),
                },
              ];
            } else if (videoString === '') {
              videoArr = [];
            } else {
              videoArr = [{ string: videoString }];
            }
            deviceDetails[currentHeading][key] = videoArr;
          } else if (currentHeading === 'main_camera' && key === 'features') {
            deviceDetails[currentHeading][key] = value
              .trim()
              .split(',')
              .map((res) => res.trim());
          } else if (currentHeading === 'sound' && key === 'loudspeaker') {
            let loudspeakerString = value.trim();
            let loudspeakerObj;
            if (loudspeakerString === 'Yes') {
              loudspeakerObj = { hasSpeakers: true, speakerType: null };
            } else if (/(\w+)(?:,\s*([\w\s]+))?/.exec(loudspeakerString)) {
              let regexResult = /(\w+)(?:,\s*([\w\s]+))?/.exec(loudspeakerString);
              loudspeakerObj = {
                hasSpeakers: regexResult[1] === 'Yes',
                speakerType: regexResult[2] || '',
              };
              //Yes, with stereo speakers
            } else {
              loudspeakerObj = {};
            }
            deviceDetails[currentHeading][key] = loudspeakerObj;
          } else if (currentHeading === 'sound' && key === '3_5mm_jack') {
            if (value.trim() === 'Yes') {
              deviceDetails[currentHeading][key] = {
                size: 3.5,
                present: true,
              };
            } else {
              deviceDetails[currentHeading][key] = {
                size: null,
                present: false,
              };
            }
          } else if (currentHeading === 'comms' && key === 'wlan') {
            let wlanString = value?.trim();
            // console.log(wlanString);
            let wlanObj = {};
            wlanObj.wifiType =
              String(
                wlanString?.split(',')?.filter((res) => {
                  if (/Wi-Fi \d+/i.test(res)) {
                    return res;
                  }
                }),
              ).trim() !== ''
                ? String(
                    wlanString?.split(',')?.filter((res) => {
                      if (/Wi-Fi \d+/i.test(res)) {
                        return res;
                      }
                    }),
                  ).trim()
                : null;
            wlanObj.dualBandEnabled = /dual-band/i.test(
              String(
                wlanString?.split(',')?.filter((res) => {
                  if (/dual-band/i.test(res)) {
                    return true;
                  }
                }),
              ).trim(),
            );
            wlanObj.triBandEnabled = /tri-band/i.test(
              String(
                wlanString?.split(',')?.filter((res) => {
                  if (/tri-band/i.test(res)) {
                    return true;
                  }
                }),
              ).trim(),
            );
            wlanObj.wifiDirectEnabled = /Wi-Fi Direct/i.test(
              String(
                wlanString?.split(',')?.filter((res) => {
                  if (/Wi-Fi Direct/i.test(res)) {
                    return true;
                  }
                }),
              ).trim(),
            );
            wlanObj.hotspotEnabled = /hotspot/i.test(
              String(
                wlanString?.split(',')?.filter((res) => {
                  if (/hotspot/i.test(res)) {
                    return true;
                  }
                }),
              ).trim(),
            );
            wlanObj.dlnaEnabled = /DLNA/i.test(
              String(
                wlanString?.split(',')?.filter((res) => {
                  if (/DLNA/i.test(res)) {
                    return true;
                  }
                }),
              ).trim(),
            );
            wlanObj.upnpEnabled = /UPnP/i.test(
              String(
                wlanString?.split(',')?.filter((res) => {
                  if (/UPnP/i.test(res)) {
                    return true;
                  }
                }),
              ).trim(),
            );
            // console.log(wlanObj);
            deviceDetails[currentHeading][key] = wlanObj;
          } else if (currentHeading === 'comms' && key === 'bluetooth') {
            let bluetoothString = value?.trim();
            let bluetoothObj;
            if (/^(\d+(\.\d+)?)$/.exec(bluetoothString)) {
              //"2.1"
              let regexResult = /^(\d+(\.\d+)?)$/.exec(bluetoothString);
              bluetoothObj = {
                version: regexResult[1],
                profile: null,
                LE: false,
                EDR: false,
              };
            } else if (
              /^(\d+\.\d+),\s?(\w+)(?:,\s?LE)?(?:,\s?EDR)?$/.exec(bluetoothString)
            ) {
              //"5.1, A2DP, LE
              let regexResult =
                /^(\d+\.\d+),\s?(\w+)(?:,\s?LE)?(?:,\s?EDR)?$/.exec(
                  bluetoothString,
                );
              bluetoothObj = {
                version: regexResult[1],
                profile: regexResult[2],
                LE: regexResult[3] === 'LE',
                EDR: regexResult[4] === 'EDR',
              };
            } else if (
              /^(\d+\.\d+),\s?(\w+)\s?\(([\w-]+)\)$/.exec(bluetoothString)
            ) {
              //2.0, A2DP (OT-361A)
              let regexResult = /^(\d+\.\d+),\s?(\w+)\s?\(([\w-]+)\)$/.exec(
                '2.0, A2DP (OT-361A)',
              );
              bluetoothObj = {
                version: regexResult[1],
                profile: regexResult[2],
                model: regexResult[3],
              };
            } else if (bluetoothString === 'Yes') {
              bluetoothObj = { support: true };
            } else if (bluetoothString === 'No') {
              bluetoothObj = { support: false };
            } else if (bluetoothString === 'TBD') {
              bluetoothObj = {};
            } else {
              bluetoothObj = { bluetoothString };
            }
            deviceDetails[currentHeading][key] = bluetoothObj;
          } else if (
            (currentHeading === 'comms' && key === 'nfc') ||
            (currentHeading === 'comms' && key === 'radio')
          ) {
            if (value.trim() === 'No') {
              deviceDetails[currentHeading][key] = false;
            } else {
              deviceDetails[currentHeading][key] = true;
            }
          } else if (currentHeading === 'misc' && key === 'colors') {
            deviceDetails[currentHeading][key] = value
              ?.replaceAll('/', ',')
              ?.split(',')
              .map((res) => res.trim());
          } else if (currentHeading === 'battery' && key === 'type') {
            // Battery;
            // ("Non-removable Li-Po 3260 mAh battery (24.1 Wh)");
            // ("Removable Li-Ion 1500 mAh battery");
            // ("Li-Po 2955 mAh, non-removable");
            // Battery = {
            //   type: "Li-Po",
            //   capacity: 3260,
            //   isRemovable: false,
            // };
            // ("Removable Li-Ion battery");
            // Battery = {
            //   type: "Li-Po",
            //   capacity: null,
            //   isRemovable: true,
            // };
            if (value.includes(',')) {
              let batteryObj = {
                type: value?.split(',')[0]?.split(' ')[0],
                capacity: !isNaN(parseFloat(value?.split(',')[0]?.split(' ')[1]))
                  ? parseFloat(value?.split(',')[0]?.split(' ')[1])
                  : null,
                isRemovable: value
                  ?.split(',')[1]
                  ?.trim()
                  ?.includes('non-removable')
                  ? false
                  : true,
              };
  
              deviceDetails[currentHeading] = batteryObj;
            } else {
              let batteryObj;
              if (value?.split(' ').length >= 5) {
                batteryObj = {
                  type: value?.split(' ')[1],
                  capacity: parseFloat(value?.split(' ')[2]),
                  isRemovable: value
                    ?.split(' ')[0]
                    ?.trim()
                    ?.includes('non-removable')
                    ? false
                    : true,
                };
              } else {
                batteryObj = {
                  type: value?.split(' ')[1] + value?.split(' ')[2],
                  capacity: null,
                  isRemovable: value?.split(' ')[0].includes('non-removable')
                    ? false
                    : true,
                };
              }
              deviceDetails[currentHeading][key] = batteryObj;
            }
          } else if (currentHeading === 'features' && key === 'sensors') {
            deviceDetails[currentHeading][key] = value
              ?.split(',')
              .map((res) => res.trim());
          } else if (currentHeading === 'display' && key === 'size') {
            // size = {
            //   screen_size: 5.5,
            //   screen_area: 83.4,
            //   screen_to_body_ratio: 68.8,
            // };
            if (value !== '' && value !== undefined) {
              let str = value?.split(',');
              let size = {
                size:
                  str[0] !== undefined
                    ? !isNaN(
                        parseFloat(
                          str[0]?.split(' ')[0]?.match(/[0-9]+(?:\.[0-9]+)?/),
                        ),
                      )
                      ? parseFloat(
                          str[0]?.split(' ')[0]?.match(/[0-9]+(?:\.[0-9]+)?/),
                        )
                      : null
                    : null,
                area:
                  str[1]?.split('(')[0] !== undefined
                    ? !isNaN(
                        parseFloat(
                          str[1]?.split('(')[0]?.match(/[0-9]+(?:\.[0-9]+)?/),
                        ),
                      )
                      ? parseFloat(
                          str[1]?.split('(')[0]?.match(/[0-9]+(?:\.[0-9]+)?/),
                        )
                      : null
                    : null,
                to_body_ratio:
                  str[1]?.split('(')[1] !== undefined
                    ? parseFloat(
                        str[1]?.split('(')[1]?.match(/[0-9]+(?:\.[0-9]+)?/),
                      )
                    : null,
              };
              deviceDetails[currentHeading]['screen'] = size;
            } else {
              deviceDetails[currentHeading]['screen'] = {};
            }
          } else if (currentHeading === 'display' && key === 'resolution') {
            if (value !== undefined && value !== '') {
              let string = value?.split(' x ');
              let resolutionObj = {
                width: parseInt(string[0]) ? parseInt(string[0]) : null,
                height:
                  string[1]?.split('pixels')[0] !== undefined
                    ? parseInt(string[1]?.split('pixels')[0])
                    : null,
                screen_ratio: {
                  numerator: string[1]
                    ?.split(',')[1]
                    ?.trim()
                    ?.split(' ')[0]
                    ?.split(':')[0]
                    ? parseInt(
                        string[1]
                          ?.split(',')[1]
                          ?.trim()
                          ?.split(' ')[0]
                          ?.split(':')[0],
                      )
                    : null,
                  denominator: string[1]
                    ?.split(',')[1]
                    ?.trim()
                    ?.split(' ')[0]
                    ?.split(':')[1]
                    ? parseInt(
                        string[1]
                          ?.split(',')[1]
                          ?.trim()
                          ?.split(' ')[0]
                          ?.split(':')[1],
                      )
                    : null,
                },
                pixel_density: !isNaN(
                  parseInt(
                    string[1]
                      ?.split('pixels')[1]
                      ?.replace(',', '')
                      ?.trim()
                      ?.split(' ')[2]
                      ?.match(/\d/g)
                      ?.join(''),
                  ),
                )
                  ? parseInt(
                      string[1]
                        ?.split('pixels')[1]
                        ?.replace(',', '')
                        ?.trim()
                        ?.split(' ')[2]
                        ?.match(/\d/g)
                        ?.join(''),
                    )
                  : null,
              };
              deviceDetails[currentHeading][key] = resolutionObj;
            } else {
              deviceDetails[currentHeading][key] = {};
            }
          } else if (currentHeading === 'display' && key == 'protection') {
            deviceDetails[currentHeading][key] = value
              ?.split(',')
              ?.map((res) => res.trim());
          } else if (
            (currentHeading === 'tests' && key === 'loudspeaker') ||
            (currentHeading === 'tests' && key === 'audio_quality') ||
            (currentHeading === 'tests' && key === 'camera')
          ) {
            deviceDetails[currentHeading][key] = value
              ?.trim()
              ?.split('/')
              ?.map((res) => res.trim());
          } else {
            deviceDetails[currentHeading][key] = value?.includes('<br>')
              ? value.split('<br>')
              : value;
          }
          previousKey = keyElement?.textContent
            ?.trim()
            ?.replaceAll(' ', '_')
            .replaceAll('.', '_')
            .toLowerCase();
        } else {
          if (
            valueElement?.getAttribute('data-spec') !== '' &&
            valueElement?.getAttribute('data-spec') !== undefined
          ) {
            if (
              currentHeading === 'Memory' &&
              valueElement?.getAttribute('data-spec') === 'memoryother'
            ) {
              deviceDetails[currentHeading]['version'] = value.trim();
            } else {
              deviceDetails[currentHeading][
                valueElement?.getAttribute('data-spec')
              ] = value?.includes('\n') ? value.split('\n') : value;
            }
          } else {
            let previousDataArr = [];
            previousDataArr.push(deviceDetails[currentHeading][previousKey]);
            deviceDetails[currentHeading][previousKey] = previousDataArr;
            if (deviceDetails[currentHeading][previousKey].length) {
              previousDataArr.push(value);
              deviceDetails[currentHeading][previousKey] = previousDataArr;
            }
            deviceDetails[currentHeading][previousKey] = [].concat(
              ...previousDataArr,
            );
          }
        }
      }
    }
    deviceDetails['pricingDetails'] = [];
    pricingTableRows?.forEach(function (row, index) {
      const columns = row.querySelectorAll('td');
      const storage =
        columns[0]?.textContent !== undefined ? columns[0]?.textContent : '';
      const amazonPrice =
        columns[1]?.querySelector('a')?.textContent !== undefined
          ? columns[1]?.querySelector('a')?.textContent
          : null;
      const amazonImage =
        columns[1]?.querySelector('img')?.getAttribute('src') !== undefined
          ? columns[1]?.querySelector('img')?.getAttribute('src')
          : null;
      const wirelessPlacePrice =
        columns[2]?.querySelector('a')?.textContent !== undefined
          ? columns[2]?.querySelector('a')?.textContent
          : null;
      const wirelessPlaceImage =
        columns[2]?.querySelector('img')?.getAttribute('src') !== undefined
          ? columns[2]?.querySelector('img')?.getAttribute('src')
          : null;
  
      const rowData = {
        storage: storage,
        amazonPrice: amazonPrice,
        amazonImage: amazonImage,
        wirelessPlacePrice: wirelessPlacePrice,
        wirelessPlaceImage: wirelessPlaceImage,
      };
      if (rowData.storage !== 'RENEWED') {
        deviceDetails['pricingDetails'].push(rowData);
      }
    });
  
    // let deviceType = null;
    // if (deviceDetails?.deviceName?.toLowerCase().includes("tab") || deviceDetails?.info?.map((e) => e?.toLowerCase().includes("tablet")).includes(true)) {
    //   deviceType = "Tab";
    // } else if (deviceDetails?.deviceName?.toLowerCase().includes("watch") || deviceDetails?.info?.map((e) => e?.toLowerCase().includes("watch")).includes(true)) {
    //   deviceType = "Watch";
    // } else if (deviceDetails?.deviceName?.toLowerCase().includes("pad") || deviceDetails?.info?.map((e) => e?.toLowerCase().includes("pad")).includes(true)) {
    //   deviceType = "Pad";
    // } else if (deviceDetails?.deviceName?.toLowerCase().includes("phone") || deviceDetails?.info?.map((e) => e?.toLowerCase().includes("phone")).includes(true)) {
    //   deviceType = "Phone";
    // } else {
    //   deviceType = "Phone";
    // }
  
    // console.log("🚀 ~ file: scrapping.ts:1633 ~ grabDevices ~ deviceDetails:", deviceDetails)
    let flattenedObject = flattenObject(deviceDetails);
    // console.log('flattenedObject', flattenedObject);
  
    function determineDeviceType(screenSize) {
      if (screenSize === undefined || screenSize === null) {
        return 'KeyPad-Phone'; // Handle cases where screenSize is not available
      }
      const isTablet = screenSize >= 7 && screenSize < 10;
      const isPhone = screenSize >= 3 && screenSize < 7;
      const isWatch = screenSize < 2.0;
  
      if (isTablet) {
        return 'Tablet';
      } else if (isPhone) {
        return 'Phone';
      } else if (isWatch) {
        return 'Watch';
      } else {
        return 'KeyPad-Phone';
      }
    }
  
    const deviceType = determineDeviceType(
      flattenedObject['display_screen_size'],
    );

    flattenedObject['deviceType'] = deviceType;
    const phoneData = { brandName: flattenedObject['deviceName'].split(' ')[0] };
  
    // ------------------------------------------------------------------------------------------------------------------------------------


    if (!isStructure) {
        return flattenedObject;
    }

    return await structureDevice(flattenedObject, phoneData);
  }

  export function flattenObject(obj, parentKey = '') {
    const result = {};
  
    for (let key in obj) {
      if (Array.isArray(obj[key])) {
        result[parentKey ? `${parentKey}_${key}` : key] = obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const flattened = flattenObject(
          obj[key],
          parentKey ? `${parentKey}_${key}` : key,
        );
        Object.assign(result, flattened);
      } else {
        result[parentKey ? `${parentKey}_${key}` : key] = obj[key];
      }
    }
    return result;
  }
  function parse2gNetworkBand(input) {
    // const parts = input.split(/ (.+) - /);
  
    // if (parts.length !== 3) {
    //   throw new Error("Invalid input string format");
    // }
  
    // const [type, bandwidthsStr, bandModel] = parts;
  
    // const bandWidths = bandwidthsStr.split(" / ").map((bw) => ({ bandWidth: bw }));
  
    // const output = {
    //   type,
    //   bandWidth: bandWidths,
    //   band_model: bandModel,
    // };
  
    const parts = input.split(/\s+/);
  
    let bands = '';
    let bandwidth = [];
    let band_model = '';
  
    for (const part of parts) {
      const numbersOnly = part.replace(/\D/g, '');
      if (part === '-') {
        band_model = parts.slice(parts.indexOf(part) + 1).join(' ');
        break;
      } else if (part !== '/' && numbersOnly && !isNaN(Number(numbersOnly))) {
        bandwidth.push({ bandwidth: part });
      } else {
        bands += part + ' ';
      }
    }
  
    bands = bands.replaceAll('/', '').trim();
  
    const bandArray = [
      'GSM',
      'CDMA',
      'HSPA',
      'HSDPA',
      'GE2AE',
      'GP4BC',
      'TD-SCDMA',
      'LTE',
      'LTE (unspecified)',
    ];
  
    const output = {
      bands: bandArray.includes(bands) ? bands : 'GSM',
      bandwidth: bandwidth ? bandwidth : [],
      band_model: band_model ? band_model : '',
    };
  
    return output;
  }
  
  function parse4gNetworkBand(input) {
    const parts = input.split(/\s+/);
  
    let bands = '';
    let bandwidth = [];
    let band_model = '';
  
    for (const part of parts) {
      const numbersOnly = part.replace(/\D/g, '');
      if (part === '-') {
        band_model = parts.slice(parts.indexOf(part) + 1).join(' ');
        break;
      } else if (
        (part !== '/' || part.includes(',')) &&
        numbersOnly &&
        !isNaN(Number(numbersOnly))
      ) {
        bandwidth.push({ bandwidth: part.replaceAll(',', '').trim() });
      } else {
        bands += part + ' ';
      }
    }
    bands = bands.replaceAll('/', '').trim();
  
    const bandArray = [
      'GSM',
      'CDMA',
      'HSPA',
      'HSDPA',
      'GE2AE',
      'GP4BC',
      'TD-SCDMA',
      'LTE',
      'LTE (unspecified)',
    ];
  
    const output = {
      bands: bandArray.includes(bands) ? bands : 'GSM',
      bandwidth: bandwidth || [],
      band_model: band_model || '',
    };
  
    return output;
  }
  
  export const structureDevice = async (deviceObject, phoneData) => {
    const deviceData = {};
    deviceData['device_name'] = null;
    deviceData['device_type'] = null;
    if ('deviceName' in deviceObject) {
      deviceData['device_name'] = deviceObject['deviceName'];
    }
  
    if ('deviceType' in deviceObject) {
      deviceData['device_type'] = deviceObject['deviceType'];
    }
  
    deviceData['brand_name'] = null;
    if (phoneData.brandName) {
      deviceData['brand_name'] = phoneData.brandName;
    }
  
    //------------------------------------------------------------------------------------------//
    deviceData['device_information'] = null;
    if ('info' in deviceObject) {
      let infoString = '';
      for (const info of deviceObject['info']) {
        infoString += info + ' ,';
      }
      deviceData['device_information'] = infoString;
    }
  
    //------------------------------------------------------------------------------------------//
    // technology name
    deviceData['technology_name'] = [];
    if (deviceObject['network_technology']) {
      deviceObject['network_technology'].forEach((element) => {
        deviceData['technology_name'].push({ name: element });
      });
    }
  
    //------------------------------------------------------------------------------------------//
    //network_2g_bands
    deviceData['network_2g_bands'] = [];
    if (
      deviceObject['network_2g_bands'] &&
      deviceObject['network_2g_bands'] != 'N/A' &&
      !Array.isArray(deviceObject['network_2g_bands'])
    ) {
      //deviceObject['network_2g_bands'] is string format
  
      deviceData['network_2g_bands'].push(
        parse2gNetworkBand(deviceObject['network_2g_bands']),
      );
    } else if (
      deviceObject['network_2g_bands'] &&
      deviceObject['network_2g_bands'] != 'N/A' &&
      Array.isArray(deviceObject['network_2g_bands'])
    ) {
      deviceObject['network_2g_bands'].forEach((element) => {
        deviceData['network_2g_bands'].push(parse2gNetworkBand(element));
      });
    }
    //------------------------------------------------------------------------------------------//
    //network_3g_bands
  
    deviceData['network_3g_bands'] = [];
    if (
      deviceObject['network_3g_bands'] &&
      deviceObject['network_3g_bands'] != 'N/A' &&
      !Array.isArray(deviceObject['network_3g_bands'])
    ) {
      deviceData['network_3g_bands'].push(
        parse2gNetworkBand(deviceObject['network_3g_bands']),
      );
    } else if (
      deviceObject['network_3g_bands'] &&
      deviceObject['network_3g_bands'] != 'N/A' &&
      Array.isArray(deviceObject['network_3g_bands'])
    ) {
      deviceObject['network_3g_bands'].forEach((element) => {
        deviceData['network_3g_bands'].push(parse2gNetworkBand(element));
      });
    }
  
    //------------------------------------------------------------------------------------------//
    //network_4g_bands
  
    deviceData['network_4g_bands'] = [];
    if (
      deviceObject['network_4g_bands'] &&
      deviceObject['network_4g_bands'] != 'N/A' &&
      !Array.isArray(deviceObject['network_4g_bands'])
    ) {
      deviceData['network_4g_bands'].push(
        parse4gNetworkBand(deviceObject['network_4g_bands']),
      );
    } else if (
      deviceObject['network_4g_bands'] &&
      deviceObject['network_4g_bands'] != 'N/A' &&
      Array.isArray(deviceObject['network_4g_bands'])
    ) {
      deviceObject['network_4g_bands'].forEach((element) => {
        deviceData['network_4g_bands'].push(parse4gNetworkBand(element));
      });
    }
  
    //------------------------------------------------------------------------------------------//
    //network_5g_bands
  
    deviceData['network_5g_bands'] = [];
    if (
      deviceObject['network_5g_bands'] &&
      deviceObject['network_5g_bands'] != 'N/A' &&
      !Array.isArray(deviceObject['network_5g_bands'])
    ) {
      deviceData['network_5g_bands'].push(
        parse4gNetworkBand(deviceObject['network_5g_bands']),
      );
    } else if (
      deviceObject['network_5g_bands'] &&
      deviceObject['network_5g_bands'] != 'N/A' &&
      Array.isArray(deviceObject['network_5g_bands'])
    ) {
      deviceObject['network_5g_bands'].forEach((element) => {
        deviceData['network_5g_bands'].push(parse4gNetworkBand(element));
      });
    }
    //------------------------------------------------------------------------------------------//
    // speed
    deviceData['network_speed'] = [];
    if ('network_speed' in deviceObject) {
      if (Array.isArray(deviceObject['network_speed'])) {
        for (const networkSpeed of deviceObject['network_speed']) {
          if ('type' in networkSpeed) {
            deviceData['network_speed'].push({
              type: networkSpeed.type,
              download_speed: networkSpeed.download_speed
                ? `${networkSpeed.download_speed}`
                : null,
              upload_speed: networkSpeed.upload_speed
                ? `${networkSpeed.upload_speed}`
                : null,
            });
          }
        }
      }
    }
    deviceData['network_gprs'] = null;
    if ('network_gprs' in deviceObject) {
      deviceData['network_gprs'] = deviceObject['network_gprs'];
    }
  
    deviceData['network_edge'] = null;
    if ('network_edge' in deviceObject) {
      deviceData['network_edge'] = deviceObject['network_edge'];
    }
  
    deviceData['launch_announced_year'] = 0;
    if ('launch_announced_year' in deviceObject) {
      deviceData['launch_announced_year'] = deviceObject['launch_announced_year'];
    }
  
    deviceData['launch_announced_month'] = 0;
    if ('launch_announced_month' in deviceObject) {
      if (deviceObject['launch_announced_month']) {
        const monthIndex =
          new Date(
            deviceObject['launch_announced_month'] + ' 1, 2012',
          ).getMonth() + 1;
        if (monthIndex != 'NaN') {
          deviceData['launch_announced_month'] =
            monthIndex != -1 ? monthIndex : 0;
          // console.log('deviceObject', deviceObject['launch_announced_month']);
          // console.log('monthIndex', monthIndex);
        } else {
          deviceData['launch_announced_month'] = 0;
        }
      }
    }
    if (
      deviceData['launch_announced_month'] == null ||
      isNaN(deviceData['launch_announced_month'])
    ) {
      deviceData['launch_announced_month'] = 0;
    }
  
    deviceData['launch_announced_day'] = 0;
    if ('launch_announced_day' in deviceObject) {
      deviceData['launch_announced_day'] = deviceObject['launch_announced_day'];
    }
  
    //-----------------------------------------------------------------------------------
    deviceData['launch_status'] = null;
    deviceData['launch_released_year'] = 0;
    deviceData['launch_released_month'] = 0;
    deviceData['launch_released_day'] = 0;
    if ('launch_status' in deviceObject) {
      const launchStatusRegex = /Available\.|Coming soon\.|Discontinued/;
      const releasedDateRegex = /(\d{4}), (\w+) (\d+)/;
  
      const launchStatusMatch =
        deviceObject['launch_status'].match(launchStatusRegex);
      const releasedDateMatch =
        deviceObject['launch_status'].match(releasedDateRegex);
      // console.log('releasedDateMatch', releasedDateMatch);
      const launchStatus = launchStatusMatch
        ? launchStatusMatch[0].replace('.', '')
        : '';
      const launchReleasedYear = releasedDateMatch ? releasedDateMatch[1] : 0;
      const launchReleasedMonth = releasedDateMatch ? releasedDateMatch[2] : 0;
      const launchReleasedDay = releasedDateMatch ? releasedDateMatch[3] : 0;
  
      deviceData['launch_status'] = launchStatus;
      deviceData['launch_released_year'] = launchReleasedYear
        ? launchReleasedYear
        : 0;
      const releaseMonthIndex = launchReleasedMonth
        ? new Date(launchReleasedMonth + ' 1, 2012').getMonth() + 1
        : 0;
      if (!isNaN(releaseMonthIndex)) {
        deviceData['launch_released_month'] =
          releaseMonthIndex != -1 ? releaseMonthIndex : 0;
      } else {
        deviceData['launch_released_month'] = 0;
      }
      deviceData['launch_released_day'] = launchReleasedDay
        ? launchReleasedDay
        : 0;
    }
  
    deviceData['body_weight'] = 0;
    if ('body_weight' in deviceObject) {
      deviceData['body_weight'] = deviceObject['body_weight'];
    }
  
    deviceData['body_sim'] = null;
    if ('body_sim' in deviceObject) {
      deviceData['body_sim'] = deviceObject['body_sim'];
    }
  
    //-----------------------------------------------------------------------
    deviceData['body_build_glass_front_folded'] = '';
    deviceData['body_build_glass_front_unfolded'] = '';
    deviceData['body_build_glass_back'] = '';
    deviceData['body_build_frame'] = '';
    if ('body_build' in deviceObject) {
      const parts = deviceObject['body_build'].split(',');
      for (const part of parts) {
        if (part.includes('front')) {
          if (part.includes('folded')) {
            deviceData['body_build_glass_front_folded'] = part || '';
          } else if (part.includes('unfolded')) {
            deviceData['body_build_glass_front_unfolded'] = part || '';
          } else {
            deviceData['body_build_glass_front_unfolded'] = part || '';
          }
        }
  
        if (part.includes('back')) {
          deviceData['body_build_glass_back'] = part || '';
        }
  
        if (part.includes('frame')) {
          deviceData['body_build_frame'] = part || '';
        }
      }
    }
  
    // --------------------------------------------------------------------------------
    deviceData['body_other'] = '';
    deviceData['body_notification_lights'] = '';
    deviceData['body_blinking_indicator'] = '';
    deviceData['body_ip_rating'] = '';
    deviceData['body_resistant'] = '';
    function parseBodyOther(inputString) {
      const parts = inputString.split(',');
      for (const part of parts) {
        if (part.includes('notifications')) {
          deviceData['body_notification_lights'] += part + ',';
        } else if (part.includes('charging progress')) {
          deviceData['body_notification_lights'] += part + ',';
        } else if (part.includes('camera fill light')) {
          deviceData['body_notification_lights'] += part + ',';
        } else if (part.includes('indicator')) {
          deviceData['body_blinking_indicator'] = part || '';
        } else if (part.includes('IP')) {
          deviceData['body_ip_rating'] = part || '';
        } else if (part.includes('resistant')) {
          deviceData['body_resistant'] = part || '';
        } else {
          deviceData['body_other'] += part + ',';
        }
      }
    }
  
    if (
      deviceObject['body_bodyother'] &&
      deviceObject['body_bodyother'] != 'N/A' &&
      !Array.isArray(deviceObject['body_bodyother'])
    ) {
      parseBodyOther(deviceObject['body_bodyother']);
    } else if (
      deviceObject['body_bodyother'] &&
      deviceObject['body_bodyother'] != 'N/A' &&
      Array.isArray(deviceObject['body_bodyother'])
    ) {
      deviceObject['body_bodyother'].forEach((inputString) => {
        parseBodyOther(inputString);
      });
    }
    // --------------------------------------------------------------------------------
    deviceData['body_keyboard'] = null;
    if ('body_keyboard' in deviceObject) {
      deviceData['body_keyboard'] = deviceObject['body_keyboard'];
    }
    // --------------------------------------------------------------------------------
  
    deviceData['body_dimensions'] = [];
    if ('body_dimensions' in deviceObject) {
      let dimensionsString = deviceObject['body_dimensions'];
      if (dimensionsString.includes('Unfolded:')) {
        const parts = dimensionsString.split(/\s*mm\s*/);
        for (const part of parts) {
          if (part.length > 0) {
            const dimensions = {
              type: '',
              body_dimensions_height: 0,
              body_dimensions_width: 0,
              body_dimensions_depth: 0,
              body_dimensions_height_inches: 0,
              body_dimensions_width_inches: 0,
              body_dimensions_depth_inches: 0,
            };
            dimensions.type = part.includes('Folded:') ? 'Folded' : 'Unfolded';
            const unfoldedDimensions = part.split(/\s*x\s*/);
            dimensions.body_dimensions_height = parseFloat(
              unfoldedDimensions[0].split(':')[1],
            );
            dimensions.body_dimensions_width = parseFloat(unfoldedDimensions[1]);
            dimensions.body_dimensions_depth = parseFloat(unfoldedDimensions[2]);
            deviceData['body_dimensions'].push(dimensions);
          }
        }
      } else if (dimensionsString.includes('in)')) {
        const parts = dimensionsString.split(/\s*mm\s*/);
        const dimensions = {
          type: '',
          body_dimensions_height: 0,
          body_dimensions_width: 0,
          body_dimensions_depth: 0,
          body_dimensions_height_inches: 0,
          body_dimensions_width_inches: 0,
          body_dimensions_depth_inches: 0,
        };
        for (const part of parts) {
          if (!part.includes('in)')) {
            dimensions.type = 'Unfolded';
            const unfoldedDimensions = part.split(/\s*x\s*/);
            dimensions.body_dimensions_height = parseFloat(unfoldedDimensions[0]);
            dimensions.body_dimensions_width = parseFloat(unfoldedDimensions[1]);
            dimensions.body_dimensions_depth = parseFloat(unfoldedDimensions[2]);
          } else {
            const inchesDimensions = part.match(/\d+(\.\d+)?/g);
            dimensions.body_dimensions_height_inches = parseFloat(
              inchesDimensions[0],
            );
            dimensions.body_dimensions_width_inches = parseFloat(
              inchesDimensions[1],
            );
            dimensions.body_dimensions_depth_inches = parseFloat(
              inchesDimensions[2],
            );
          }
        }
        deviceData['body_dimensions'].push(dimensions);
      }
    }
    // --------------------------------------------------------------------------------
    deviceData['display_type'] = '';
    deviceData['display_colors'] = [];
    deviceData['display_refresh_rate'] = 0;
    deviceData['hdr_support'] = null;
    deviceData['brightness'] = null;
    deviceData['peak_brightness'] = null;
    if ('display_type' in deviceObject) {
      const displayTypes = deviceObject['display_type'].split(',');
      for (const displayType of displayTypes) {
        if (
          displayType.includes('OLED') ||
          displayType.includes('LCD') ||
          displayType.includes('TFT') ||
          displayType.includes('AMOLED') ||
          displayType.includes('IPS-LCD') ||
          displayType.includes('Dolby Vision') ||
          displayType.includes('dolby vision')
        ) {
          deviceData['display_type'] += displayType + ', ';
        }
        if (displayType.includes('colors') || displayType.includes('1B colors')) {
          deviceData['display_colors'].push({ name: displayType });
        }
        if (displayType.includes('HZ') || displayType.includes('Hz')) {
          deviceData['display_refresh_rate'] = !isNaN(parseInt(displayType))
            ? parseInt(displayType)
            : 0;
        }
        if (displayType.includes('HDR')) {
          deviceData['hdr_support'] = displayType;
        }
        if (displayType.includes('typ') || displayType.includes('HBM')) {
          deviceData['brightness'] = displayType;
        }
        if (displayType.includes('peak')) {
          deviceData['peak_brightness'] = displayType;
        }
      }
      // Remove trailing comma and space
      deviceData['display_type'] = deviceData['display_type'].replace(
        /,\s*$/,
        '',
      );
    }
    // --------------------------------------------------------------------------------
  
    deviceData['display_screen_size'] = 0;
    if ('display_screen_size' in deviceObject) {
      deviceData['display_screen_size'] = parseFloat(
        deviceObject['display_screen_size'],
      );
    }
  
    deviceData['display_screen_area'] = 0;
    if ('display_screen_area' in deviceObject) {
      deviceData['display_screen_area'] = deviceObject['display_screen_area'];
    }
  
    deviceData['display_screen_to_body_ratio'] = 0;
    if ('display_screen_to_body_ratio' in deviceObject) {
      deviceData['display_screen_to_body_ratio'] =
        deviceObject['display_screen_to_body_ratio'];
    }
  
    deviceData['display_resolution_width'] = 0;
    if ('display_resolution_width' in deviceObject) {
      deviceData['display_resolution_width'] =
        deviceObject['display_resolution_width'];
    }
  
    deviceData['display_resolution_height'] = 0;
    if ('display_resolution_height' in deviceObject) {
      deviceData['display_resolution_height'] =
        deviceObject['display_resolution_height'];
    }
  
    // Function to determine resolution type based on pixel dimensions
    function getResolutionType(width, height) {
      const totalPixels = width * height;
  
      if (totalPixels >= 3840 * 2160) {
        return '8K';
      } else if (totalPixels >= 2560 * 1440) {
        return 'UHD';
      } else if (totalPixels >= 2560 * 1440) {
        return 'QHD';
      } else if (totalPixels >= 1920 * 1080) {
        return 'FHD';
      } else if (totalPixels >= 1280 * 720) {
        return 'HD';
      } else {
        return 'Lower than HD';
      }
    }
  
    deviceData['resolution_type'] = getResolutionType(
      deviceData['display_resolution_width'],
      deviceData['display_resolution_height'],
    );
  
    deviceData['display_resolution_screen_ratio_numerator'] = 0;
    if ('display_resolution_screen_ratio_numerator' in deviceObject) {
      deviceData['display_resolution_screen_ratio_numerator'] =
        deviceObject['display_resolution_screen_ratio_numerator'];
    }
  
    deviceData['display_resolution_screen_ratio_denominator'] = 0;
    if ('display_resolution_screen_ratio_denominator' in deviceObject) {
      deviceData['display_resolution_screen_ratio_denominator'] =
        deviceObject['display_resolution_screen_ratio_denominator'];
    }
  
    deviceData['display_resolution_pixel_density'] = 0;
    if ('display_resolution_pixel_density' in deviceObject) {
      deviceData['display_resolution_pixel_density'] =
        deviceObject['display_resolution_pixel_density'];
    }
  
    // --------------------------------------------------------------------------------
    deviceData['front_display_protection'] = '';
    deviceData['back_display_protection'] = null;
    if ('display_protection' in deviceObject) {
      if (Array.isArray(deviceObject['display_protection'])) {
        for (const protection of deviceObject['display_protection']) {
          // if (protection.include(',')) {
          //   const parts = protection.split(',')
          //   for (const part of parts) {
          //     if (part.includes('glass')) {
          //       deviceData['front_display_protection'] = part;
          //     }
          //   }
          // } else {
          deviceData['front_display_protection'] += protection;
          // }
        }
      } else {
        deviceData['front_display_protection'] =
          deviceObject['display_protection'];
      }
  
      // if (deviceObject['display_protection'].length > 1) {
      //   if (deviceObject['display_protection'].include(',')) {
      //     const parts = deviceObject['display_protection'].split(',')
      //     for (const part of parts) {
      //       if (part.includes('glass')) {
      //         deviceData['front_display_protection'] = part;
      //       }
      //     }
      //   }
      // } else {
      //   deviceData['front_display_protection'] = deviceObject['display_protection'][0]
      // }
    }
    // --------------------------------------------------------------------------------
    deviceData['display_AOD'] = null;
    deviceData['cover_display_type'] = '';
    deviceData['cover_display_glass'] = '';
    if ('display_displayother' in deviceObject) {
      for (const displayOther of deviceObject['display_displayother']) {
        if (displayOther.includes('Always On Display')) {
          deviceData['display_AOD'] = displayOther;
        }
  
        for (const coverDisplay of displayOther.split(',')) {
          // Add cover display fields
          if (
            coverDisplay.includes('OLED') ||
            coverDisplay.includes('LCD') ||
            coverDisplay.includes('TFT') ||
            coverDisplay.includes('AMOLED') ||
            coverDisplay.includes('IPS-LCD') ||
            coverDisplay.includes('Dolby Vision') ||
            coverDisplay.includes('dolby vision') ||
            coverDisplay.includes('colors') ||
            coverDisplay.includes('1B colors')
          ) {
            // Concatenate cover_display_type
            deviceData['cover_display_type'] += coverDisplay + ', ';
          }
          if (
            coverDisplay.includes('HZ') ||
            coverDisplay.includes('Hz') ||
            coverDisplay.includes('HDR') ||
            coverDisplay.includes('typ') ||
            coverDisplay.includes('HBM') ||
            coverDisplay.includes('peak')
          ) {
            // Concatenate cover_display_glass
            deviceData['cover_display_glass'] += coverDisplay.trim() + ', ';
          }
        }
  
        // Remove trailing comma and space from the concatenated strings
        deviceData['cover_display_type'] = deviceData[
          'cover_display_type'
        ].replace(/,\s*$/, '');
        deviceData['cover_display_glass'] = deviceData[
          'cover_display_glass'
        ].replace(/,\s*$/, '');
  
        // Extract inches
        const inchesRegex = /([\d.]+) inches/;
        const inchesMatch = displayOther.match(inchesRegex);
        const inches = inchesMatch ? parseFloat(inchesMatch[1]) : 0;
        deviceData['cover_display_screen_size'] = inches;
  
        // Extract resolution width and height
        const resolutionRegex = /(\d+) x (\d+) pixels/;
        const resolutionMatch = displayOther.match(resolutionRegex);
        const width = resolutionMatch ? parseInt(resolutionMatch[1]) : 0;
        const height = resolutionMatch ? parseInt(resolutionMatch[2]) : 0;
        deviceData['cover_display_resolution_width'] = width;
        deviceData['cover_display_resolution_height'] = height;
  
        const ppiRegex = /(\d+) ppi/;
        const ppiMatch = displayOther.match(ppiRegex);
        const ppi = ppiMatch ? parseInt(ppiMatch[1]) : 0;
        deviceData['cover_display_ppi'] = ppi;
      }
    }
    // --------------------------------------------------------------------------------
    deviceData['chipset_processor'] = null;
    deviceData['chipset_model'] = null;
    deviceData['chipset_manufacturing_technology'] = null;
    if ('platform_chipset' in deviceObject) {
      for (const platformChipset of deviceObject['platform_chipset']) {
        deviceData['chipset_processor'] = platformChipset['processor'];
        deviceData['chipset_model'] = platformChipset['model'];
        deviceData['chipset_manufacturing_technology'] =
          platformChipset['manufacturing_technology'];
      }
    }
  
    deviceData['platform_gpu_series'] = null;
    if ('platform_gpu_series' in deviceObject) {
      deviceData['platform_gpu_series'] = deviceObject['platform_gpu_series'];
    }
  
    deviceData['platform_gpu_model'] = null;
    if ('platform_gpu_model' in deviceObject) {
      deviceData['platform_gpu_model'] = deviceObject['platform_gpu_model'];
    }
  
    deviceData['platform_gpu_core'] = null;
    if ('platform_gpu_core' in deviceObject) {
      deviceData['platform_gpu_core'] = deviceObject['platform_gpu_core'];
    }
    // --------------------------------------------------------------------------------
    deviceData['platform_os_type'] = null;
    deviceData['platform_os_ui'] = null;
    if ('platform_os_type' in deviceObject) {
      // deviceData['platform_os_type'] = deviceObject['platform_os_type'];
      if (deviceObject['platform_os_type'].includes(',')) {
        const osTypes = deviceObject['platform_os_type'].split(',');
        for (const osType of osTypes) {
          if (
            (osType.includes('Android') ||
              osType.includes('Windows') ||
              osType.includes('iOS')) &&
            !osType.includes('upgrade') &&
            !osType.includes('upgradable') &&
            !osType.includes('UI')
          ) {
            const platform = osType.split(' ');
            deviceData['platform_os_type'] = platform[0] ? platform[0] : null;
            // if (osType.includes('iOS')) {
            //   deviceData['platform_os_type'] = 'IOS';
            // }
            deviceData['platform_os_version'] = platform[1] ? platform[1] : null;
          }
          if (osType.includes('upgradable')) {
            deviceData['platform_os_upgradable_version'] = osType;
          }
          if (
            osType.includes('MIUI') ||
            osType.includes('UI') ||
            osType.includes('XOS') ||
            osType.includes('OxygenOS')
          ) {
            deviceData['platform_os_ui'] = osType;
          }
        }
      } else if (!deviceObject['platform_os_type'].includes(',')) {
        const osTypes = deviceObject['platform_os_type'].split(' ');
        for (const osType of osTypes) {
          if (
            (osType.includes('Android') ||
              osType.includes('Windows') ||
              osType.includes('iOS') ||
              osType.includes('OS')) &&
            !osType.includes('upgradable') &&
            !osType.includes('UI')
          ) {
            deviceData['platform_os_type'] = osType ? osType : null;
            deviceData['platform_os_version'] = osType ? osType : null;
          }
          if (Number(osType) || osType == 'Phone') {
            deviceData['platform_os_version'] = osType ? osType : null;
          }
          if (osType.includes('upgradable')) {
            deviceData['platform_os_upgradable_version'] = osType;
          }
          if (
            osType.includes('MIUI') ||
            osType.includes('UI') ||
            osType.includes('XOS') ||
            osType.includes('OxygenOS')
          ) {
            deviceData['platform_os_ui'] = osType;
          }
        }
      }
    }
  
    deviceData['platform_os_version'] = null;
    if ('platform_os_version' in deviceObject) {
      deviceData['platform_os_version'] = deviceObject['platform_os_version'];
    }
  
    deviceData['platform_os_upgradable_version'] = null;
    if ('platform_os_upgradableVersion' in deviceObject) {
      deviceData['platform_os_upgradable_version'] = deviceObject['platform_os_upgradable_version'];
    }
  
    // --------------------------------------------------------------------------------
    deviceData['platform_cpu'] = [];
    deviceData['cpu_core'] = 0;
    if ('platform_cpu' in deviceObject) {
      const devisePlatformCPU = deviceObject['platform_cpu'];
      if (Array.isArray(devisePlatformCPU)) {
        if (
          devisePlatformCPU.length > 0 &&
          typeof devisePlatformCPU[0] === 'object' &&
          devisePlatformCPU[0] !== null
        ) {
          for (const cpu of deviceObject['platform_cpu']) {
            deviceData['platform_cpu'].push({
              cores: cpu.cores,
              frequency: `${cpu.frequency}`,
              architecture: cpu.architecture,
            });
          }
        } else if (
          devisePlatformCPU.length > 0 &&
          typeof devisePlatformCPU[0] === 'string'
        ) {
          deviceData['platform_cpu'] = [];
          const platform_cpu = {
            cores: '',
            frequency: '',
            architecture: '',
          };
          const coreRegex = /(\w+-core)/i;
          const frequencyRegex = /(\d+x\d+(\.\d+)? GHz)/g;
          const architectureRegex = /\((.*?)\)/;
  
          const coreMatch = devisePlatformCPU[0].match(coreRegex);
          const frequencyMatches = devisePlatformCPU[0].match(frequencyRegex);
          const architectureMatch = devisePlatformCPU[0].match(architectureRegex);
          const core = coreMatch ? coreMatch[1] : '';
          const frequency = frequencyMatches ? frequencyMatches.join(', ') : '';
          let architecture;
          if (architectureMatch) {
            if (architectureMatch[1].includes('+')) {
              architecture = architectureMatch
                ? architectureMatch[1]
                    .split('+')
                    .map((s) => {
                      const arc = s.split('GHz')[1];
                      return arc;
                    })
                    .join(', ')
                : '';
            } else {
              architecture = architectureMatch
                ? architectureMatch[1]
                    .split('&')
                    .map((s) => {
                      const arc = s.split('GHz')[1];
                      return arc;
                    })
                    .join(', ')
                : '';
            }
          }
  
          platform_cpu.cores = core;
          platform_cpu.frequency = `${frequency}`;
          platform_cpu.architecture = architecture;
  
          const platformCpuString = devisePlatformCPU[0].replaceAll('\n', '');
  
          if (platformCpuString.toLowerCase().includes('10-core')) {
            deviceData['cpu_core'] = 10;
          } else if (
            platformCpuString.toLowerCase().includes('octa-core') ||
            platformCpuString.toLowerCase().includes('8-core')
          ) {
            deviceData['cpu_core'] = 8;
          } else if (
            platformCpuString.toLowerCase().includes('hexa-core') ||
            platformCpuString.toLowerCase().includes('6-core')
          ) {
            deviceData['cpu_core'] = 6;
          } else if (platformCpuString.toLowerCase().includes('quad-core')) {
            deviceData['cpu_core'] = 4;
          } else if (platformCpuString.toLowerCase().includes('dual-core')) {
            deviceData['cpu_core'] = 2;
          }
  
          deviceData['platform_cpu'].push(platform_cpu);
        }
      }
    }
  
    // --------------------------------------------------------------------------------
    deviceData['memory_card_slot'] = null;
    if ('memory_card_slot' in deviceObject) {
      deviceData['memory_card_slot'] = deviceObject['memory_card_slot'];
    }
  
    deviceData['memory_phonebook'] = null;
    if ('memory_phonebook' in deviceObject) {
      deviceData['memory_phonebook'] = deviceObject['memory_phonebook'];
    }
  
    deviceData['memory_call_records'] = null;
    if ('memory_call_records' in deviceObject) {
      deviceData['memory_call_records'] = deviceObject['memory_call_records'];
    }
  
    deviceData['memory_storage_type'] = null;
    if ('memory_memoryother' in deviceObject) {
      if (Array.isArray(deviceObject['memory_memoryother'])) {
        deviceData['memory_storage_type'] =
          deviceObject['memory_memoryother'].join(', ');
      } else {
        deviceData['memory_storage_type'] = deviceObject['memory_memoryother'];
      }
    }
  
    deviceData['ram'] = 0;
    deviceData['internal_storage'] = 0;
    deviceData['price'] = 0;
  
    deviceData['memory_internal'] = [];
    if ('memory_internal' in deviceObject) {
      let memoryInernal = [];
      deviceObject['memory_internal'].forEach((element) => {
        const storageRegex = /(\d+(?:GB|TB|MB))/;
        const ramRegex = /(\d+(?:GB|TB|MB)\s+RAM|\d+(?:GB|TB|MB)\s+RAM)/;
  
        const storageMatch = element.match(storageRegex);
        const ramMatch = element.match(ramRegex);
        const storage = storageMatch ? storageMatch[1] : '';
        const ram = ramMatch ? ramMatch[1] : '';
  
        // const storage = storageMatch ? storageMatch[1] : '0';
        // const ram = ramMatch ? ramMatch[1] : '0';
  
        let storageGB = 0;
        let ramGB = 0;
        if (storage) {
          storageGB = convertToGB(storage); // Implement the conversion function
        }
  
        if (ram) {
          ramGB = convertToGB(ram); // Implement the conversion function
        }
  
        function convertToGB(value) {
          const conversionMap = {
            MB: 1 / 1024,
            GB: 1,
            TB: 1024,
          };
  
          const match = value.match(/(\d+)\s*(\w+)/);
          if (match) {
            const numericValue = parseInt(match[1]);
            const unit = match[2].toUpperCase();
  
            if (!isNaN(numericValue) && unit in conversionMap) {
              const convertedValue = numericValue * conversionMap[unit];
              return convertedValue ? parseInt(convertedValue) : 0;
            }
          }
          return 0;
        }
  
        // if (storageMatch) {
        //   storage = storageMatch[1];
        // } else if (ramMatch) {
        //   ram = ramMatch[1];
        // }
  
        // const storageGB = convertToGB(storage); // Implement the conversion function
        // const ramGB = convertToGB(ram); // Implement the conversion function
  
        memoryInernal.push({
          memory_internal_storage: storageGB,
          memory_internal_ram: ramGB,
          price: 0,
        });
      });
  
      const minStorage = Math.min(
        ...memoryInernal.map((element) => element.memory_internal_storage),
      );
      const minRam = Math.min(
        ...memoryInernal.map((element) => element.memory_internal_ram),
      );
      const minPrice = Math.min(...memoryInernal.map((element) => element.price));
  
      deviceData['ram'] = minRam ? minRam : 0;
      deviceData['internal_storage'] = minStorage ? parseInt(minStorage) : 0;
      deviceData['price'] = minPrice;
  
      deviceData['memory_internal'] = memoryInernal;
    }
    // --------------------------------------------------------------------------------
    deviceData['primary_camera'] = 0;
    deviceData['main_camera_data'] = [];
    if ('main_camera_data' in deviceObject) {
      const mainCameraData = [];
      for (const cameraData of deviceObject['main_camera_data']) {
        const mainCameraDataObj = {};
        mainCameraDataObj['aperture'] = cameraData.aperture
          ? cameraData.aperture
          : null;
        mainCameraDataObj['autofocus'] = cameraData.autofocus
          ? cameraData.autofocus
          : null;
        mainCameraDataObj['lense'] = cameraData.lense ? cameraData.lense : null;
        mainCameraDataObj['resolution'] = cameraData.resolution
          ? cameraData.resolution
          : 0;
        mainCameraDataObj['pixel_size'] = cameraData.pixelsize
          ? cameraData.pixelsize
          : null;
        mainCameraDataObj['sensor_size'] = cameraData.sensorsize
          ? cameraData.sensorsize
          : null;
        mainCameraDataObj['image_stabalization'] = cameraData.imagestabalization
          ? cameraData.imagestabalization
          : null;
  
        mainCameraData.push(mainCameraDataObj);
      }
      const maxResolution = Math.max(
        ...mainCameraData.map((element) => element.resolution),
      );
      deviceData['primary_camera'] = maxResolution;
      deviceData['main_camera_data'] = mainCameraData;
    }
  
    // --------------------------------------------------------------------------------
    deviceData['main_camera_video'] = [];
    if ('main_camera_video' in deviceObject) {
      const mainCameraVideo = [];
      for (const cameraVideoData of deviceObject['main_camera_video']) {
        const mainCameraVideoObj = {};
        // console.log('cameraData', cameraVideoData);
        mainCameraVideoObj['frame_rate'] = cameraVideoData.frameRate
          ? `${cameraVideoData.frameRate}`
          : null;
        mainCameraVideoObj['mode'] = cameraVideoData.mode
          ? cameraVideoData.mode
          : null;
        mainCameraVideoObj['resolution'] = cameraVideoData.resolution
          ? cameraVideoData.resolution
          : 0;
        mainCameraVideo.push(mainCameraVideoObj);
      }
      deviceData['main_camera_video'] = mainCameraVideo;
    }
    // --------------------------------------------------------------------------------
    deviceData['main_camera_features'] = [];
    if ('main_camera_features' in deviceObject) {
      const cameraFeatures = [];
      for (const feature of deviceObject['main_camera_features']) {
        cameraFeatures.push({ name: feature });
      }
      deviceData['main_camera_features'] = cameraFeatures;
    }
  
    // --------------------------------------------------------------------------------
    deviceData['selfie_camera_data'] = [];
    deviceData['secondary_camera'] = 0;
    if ('selfie_camera_data' in deviceObject) {
      const mainCameraData = [];
      for (const cameraData of deviceObject['selfie_camera_data']) {
        const mainCameraDataObj = {};
        mainCameraDataObj['aperture'] = cameraData.aperture
          ? cameraData.aperture
          : null;
        mainCameraDataObj['autofocus'] = cameraData.autofocus
          ? cameraData.autofocus
          : null;
        mainCameraDataObj['lense'] = cameraData.lense ? cameraData.lense : null;
        mainCameraDataObj['resolution'] = cameraData.resolution
          ? cameraData.resolution
          : 0;
        mainCameraDataObj['pixel_size'] = cameraData.pixelsize
          ? cameraData.pixelsize
          : null;
        mainCameraDataObj['sensor_size'] = cameraData.sensorsize
          ? cameraData.sensorsize
          : null;
        mainCameraDataObj['image_stabalization'] = cameraData.imagestabalization
          ? cameraData.imagestabalization
          : null;
  
        mainCameraData.push(mainCameraDataObj);
      }
      const maxResolution = Math.max(
        ...mainCameraData.map((element) => element.resolution),
      );
      deviceData['secondary_camera'] = maxResolution;
      deviceData['selfie_camera_data'] = mainCameraData;
    }
    // --------------------------------------------------------------------------------
    deviceData['selfie_camera_video'] = [];
    if ('selfie_camera_video' in deviceObject) {
      const selfieCameraVideo = [];
      for (const cameraVideoData of deviceObject['selfie_camera_video']) {
        const selfieCameraVideoObj = {};
        selfieCameraVideoObj['frame_rate'] = cameraVideoData.frameRate
          ? `${cameraVideoData.frameRate}`
          : null;
        selfieCameraVideoObj['mode'] = cameraVideoData.mode
          ? cameraVideoData.mode
          : null;
        selfieCameraVideoObj['resolution'] = cameraVideoData.resolution
          ? cameraVideoData.resolution
          : 0;
  
        selfieCameraVideo.push(selfieCameraVideoObj);
      }
      deviceData['selfie_camera_video'] = selfieCameraVideo;
    }
    // --------------------------------------------------------------------------------
    deviceData['selfie_camera_features'] = [];
    if ('selfie_camera_features' in deviceObject) {
      const selfieCameraFeatures = [];
      if (deviceObject['selfie_camera_features'].includes(',')) {
        const selfieFeatures = deviceObject['selfie_camera_features'].split(',');
        for (const feature of selfieFeatures) {
          selfieCameraFeatures.push({ name: feature });
        }
      } else {
        selfieCameraFeatures.push({
          name: deviceObject['selfie_camera_features'],
        });
      }
      deviceData['selfie_camera_features'] = selfieCameraFeatures;
    }
    // --------------------------------------------------------------------------------
    deviceData['sound_loudspeaker_has_speakers'] = false;
    if ('sound_loudspeaker_hasSpeakers' in deviceObject) {
      deviceData['sound_loudspeaker_has_speakers'] = deviceObject[
        'sound_loudspeaker_hasSpeakers'
      ]
        ? deviceObject['sound_loudspeaker_hasSpeakers']
        : false;
    }
  
    deviceData['sound_loudspeaker_speaker_type'] = null;
    if ('sound_loudspeaker_speakerType' in deviceObject) {
      deviceData['sound_loudspeaker_speaker_type'] = deviceObject[
        'sound_loudspeaker_speakerType'
      ]
        ? deviceObject['sound_loudspeaker_speakerType']
        : null;
    }
  
    deviceData['sound_jack_size'] = null;
    if ('sound_3_5mm_jack_size' in deviceObject) {
      deviceData['sound_jack_size'] = deviceObject['sound_3_5mm_jack_size']
        ? deviceObject['sound_3_5mm_jack_size']
        : null;
    }
  
    deviceData['sound_jack_present'] = false;
    if ('sound_3_5mm_jack_present' in deviceObject) {
      deviceData['sound_jack_present'] = deviceObject['sound_3_5mm_jack_present']
        ? deviceObject['sound_3_5mm_jack_present']
        : false;
    }
    // --------------------------------------------------------------------------------
    deviceData['comms_wlan_wifiType'] = null;
    if ('comms_wlan_wifiType' in deviceObject) {
      deviceData['comms_wlan_wifiType'] = deviceObject['comms_wlan_wifiType']
        ? deviceObject['comms_wlan_wifiType']
        : null;
    }
  
    deviceData['comms_wlan_dualBandEnabled'] = false;
    if ('comms_wlan_dualBandEnabled' in deviceObject) {
      deviceData['comms_wlan_dualBandEnabled'] = deviceObject[
        'comms_wlan_dualBandEnabled'
      ]
        ? deviceObject['comms_wlan_dualBandEnabled']
        : false;
    }
  
    deviceData['comms_wlan_triBandEnabled'] = false;
    if ('comms_wlan_triBandEnabled' in deviceObject) {
      deviceData['comms_wlan_triBandEnabled'] = deviceObject[
        'comms_wlan_triBandEnabled'
      ]
        ? deviceObject['comms_wlan_triBandEnabled']
        : false;
    }
  
    deviceData['comms_wlan_wifiDirectEnabled'] = false;
    if ('comms_wlan_wifiDirectEnabled' in deviceObject) {
      deviceData['comms_wlan_wifiDirectEnabled'] = deviceObject[
        'comms_wlan_wifiDirectEnabled'
      ]
        ? deviceObject['comms_wlan_wifiDirectEnabled']
        : null;
    }
  
    deviceData['comms_wlan_hotspotEnabled'] = false;
    if ('comms_wlan_hotspotEnabled' in deviceObject) {
      deviceData['comms_wlan_hotspotEnabled'] = deviceObject[
        'comms_wlan_hotspotEnabled'
      ]
        ? deviceObject['comms_wlan_hotspotEnabled']
        : null;
    }
  
    deviceData['comms_wlan_dlnaEnabled'] = false;
    if ('comms_wlan_dlnaEnabled' in deviceObject) {
      deviceData['comms_wlan_dlnaEnabled'] = deviceObject[
        'comms_wlan_dlnaEnabled'
      ]
        ? deviceObject['comms_wlan_dlnaEnabled']
        : null;
    }
  
    deviceData['comms_wlan_upnpEnabled'] = false;
    if ('comms_wlan_upnpEnabled' in deviceObject) {
      deviceData['comms_wlan_upnpEnabled'] = deviceObject[
        'comms_wlan_upnpEnabled'
      ]
        ? deviceObject['comms_wlan_upnpEnabled']
        : null;
    }
    // --------------------------------------------------------------------------------
  
    deviceData['comms_positioning'] = [];
    if ('comms_positioning' in deviceObject) {
      const commsPositioningSplit = deviceObject['comms_positioning'].split(',');
      for (const position of commsPositioningSplit) {
        const commsPositioning = {
          satellite_navigation_system: '',
          frequency_bands: '',
        };
        const regex = /(\w+)\s*\((.*?)\)/;
        const match = position.match(regex);
        if (match) {
          const [, name, value] = match;
          commsPositioning.satellite_navigation_system = name;
          commsPositioning.frequency_bands = `(${value})`;
        } else {
          commsPositioning.satellite_navigation_system = position;
        }
        deviceData['comms_positioning'].push(commsPositioning);
      }
    }
    // --------------------------------------------------------------------------------
    deviceData['comms_nfc'] = false;
    if ('comms_nfc' in deviceObject) {
      deviceData['comms_nfc'] = deviceObject['comms_nfc']
        ? deviceObject['comms_nfc']
        : null;
    }
  
    deviceData['comms_radio'] = false;
    if ('comms_radio' in deviceObject) {
      deviceData['comms_radio'] = deviceObject['comms_radio']
        ? deviceObject['comms_radio']
        : false;
    }
  
    deviceData['comms_usb_otg'] = false;
    deviceData['comms_usb_lighting'] = false;
    deviceData['comms_usb_type'] = null;
    if ('comms_usb' in deviceObject) {
      if (deviceObject['comms_usb'].includes(',')) {
        for (const usbType of deviceObject['comms_usb'].split(',')) {
          if (usbType.includes('OTG')) {
            deviceData['comms_usb_otg'] = true;
          }
          if (usbType.includes('Lightning')) {
            deviceData['comms_usb_lighting'] = true;
          }
          if (usbType.includes('USB')) {
            deviceData['comms_usb_type'] = usbType;
          }
        }
      } else {
        deviceData['comms_usb_type'] = deviceObject['comms_usb']
          ? deviceObject['comms_usb']
          : null;
      }
    }
  
    deviceData['comms_infrared_port'] = false;
    if ('comms_infrared_port' in deviceObject) {
      deviceData['comms_infrared_port'] = deviceObject['comms_infrared_port']
        ? true
        : false;
    }
  
    deviceData['features_sensors'] = [];
    if ('features_sensors' in deviceObject) {
      for (const sensor of deviceObject['features_sensors']) {
        deviceData['features_sensors'].push({ name: sensor });
      }
    }
  
    deviceData['device_features'] = [];
    if ('features_featuresother' in deviceObject) {
      if (Array.isArray(deviceObject['features_featuresother'])) {
        for (const feature of deviceObject['features_featuresother']) {
          deviceData['device_features'].push({ name: feature });
        }
      } else if (typeof deviceObject['features_featuresother'] === 'string') {
        deviceData['device_features'].push({
          name: deviceObject['features_featuresother'],
        });
      }
  
      // if (deviceObject['features_featuresother'].includes(',')) {
      //   const sensors = deviceObject['features_featuresother'].split(',');
      //   for (const sensor of sensors) {
      //     deviceData['device_features'].push({ name: sensor });
      //   }
      // } else {
      //   deviceData['device_features'].push({ name: deviceObject['features_featuresother'] });
      // }
    }
    // --------------------------------------------------------------------------------
    deviceData['comms_bluetooth_version'] = null;
    if ('comms_bluetooth_version' in deviceObject) {
      deviceData['comms_bluetooth_version'] = deviceObject[
        'comms_bluetooth_version'
      ]
        ? `${deviceObject['comms_bluetooth_version']}`
        : null;
    } else if ('comms_bluetooth_bluetoothString' in deviceObject) {
      const bluetoothString =
        deviceObject['comms_bluetooth_bluetoothString'].split(',');
      deviceData['comms_bluetooth_version'] = bluetoothString[0]
        ? bluetoothString[0]
        : null;
    }
  
    deviceData['comms_bluetooth_profile'] = null;
    if ('comms_bluetooth_profile' in deviceObject) {
      deviceData['comms_bluetooth_profile'] = deviceObject[
        'comms_bluetooth_profile'
      ]
        ? deviceObject['comms_bluetooth_profile']
        : null;
    }
  
    deviceData['comms_bluetooth_LE'] = false;
    if ('comms_bluetooth_LE' in deviceObject) {
      deviceData['comms_bluetooth_LE'] = deviceObject['comms_bluetooth_LE']
        ? deviceObject['comms_bluetooth_LE']
        : null;
    } else if ('comms_bluetooth_bluetoothString' in deviceObject) {
      if (deviceObject['comms_bluetooth_bluetoothString'].includes('LE')) {
        deviceData['comms_bluetooth_LE'] = true;
      }
    }
  
    deviceData['comms_bluetooth_EDR'] = null;
    if ('comms_bluetooth_EDR' in deviceObject) {
      deviceData['comms_bluetooth_EDR'] = deviceObject['comms_bluetooth_EDR']
        ? deviceObject['comms_bluetooth_EDR']
        : null;
    }
  
    deviceData['comms_bluetooth_support'] = null;
    if ('comms_bluetooth_support' in deviceObject) {
      deviceData['comms_bluetooth_support'] = deviceObject[
        'comms_bluetooth_support'
      ]
        ? /*deviceObject['comms_bluetooth_support']*/ 'yes'
        : null;
    }
  
    deviceData['comms_bluetooth_A2DP'] = false;
    deviceData['comms_bluetooth_APTX'] = false;
    if ('comms_bluetooth_bluetoothString' in deviceObject) {
      if (deviceObject['comms_bluetooth_bluetoothString'].includes('A2DP')) {
        deviceData['comms_bluetooth_A2DP'] = true;
      }
      if (deviceObject['comms_bluetooth_bluetoothString'].includes('aptX')) {
        deviceData['comms_bluetooth_APTX'] = true;
      }
    }
    // --------------------------------------------------------------------------------
  
    deviceData['battery_type'] = null;
    if ('battery_type' in deviceObject) {
      deviceData['battery_type'] = deviceObject['battery_type']
        ? deviceObject['battery_type']
        : null;
    }
  
    deviceData['battery_capacity'] = 0;
    if ('battery_capacity' in deviceObject) {
      deviceData['battery_capacity'] = deviceObject['battery_capacity']
        ? deviceObject['battery_capacity']
        : 0;
    }
  
    deviceData['battery_is_removable'] = false;
    if ('battery_isRemovable' in deviceObject) {
      deviceData['battery_is_removable'] = deviceObject['battery_isRemovable']
        ? true
        : false;
    }
  
    deviceData['battery_stand_by'] = null;
    if ('battery_stand-by' in deviceObject) {
      deviceData['battery_stand_by'] = deviceObject['battery_stand-by']
        ? deviceObject['battery_stand-by']
        : null;
    }
  
    deviceData['battery_talk_time'] = null;
    if ('battery_talk_time' in deviceObject) {
      deviceData['battery_talk_time'] = deviceObject['battery_talk_time']
        ? deviceObject['battery_talk_time']
        : null;
    }
  
    deviceData['battery_music_play'] = null;
    if ('battery_music_play' in deviceObject) {
      deviceData['battery_music_play'] = deviceObject['battery_music_play']
        ? deviceObject['battery_music_play']
        : null;
    }
  
    deviceData['charging_specifications'] = [];
    if ('battery_charging' in deviceObject) {
      if (deviceObject['battery_charging'].includes('\n')) {
        for (const battery of deviceObject['battery_charging'].split('\n')) {
          const batteryObj = {};
          if (battery.includes(',')) {
            for (const item of battery.split(',')) {
              if (
                item.includes('W') &&
                (item.includes('wired') || item.includes('wireless'))
              ) {
                //15W wireless (MagSafe)
                const separator = 'W';
                const parts = item.split(new RegExp(`\\${separator}`));
                const power = parts[0].trim();
                const description = parts.slice(1).join(separator).trim();
                batteryObj.charging_specifications = description; // wired, wireless
                batteryObj.power_output = power; // 25W, 65W, ect
              }
              if (
                !item.includes('W') &&
                (item.includes('wired') || item.includes('wireless'))
              ) {
                batteryObj.charging_specifications = item; // wired, wireless
              }
              if (item.includes('PD')) {
                batteryObj.power_delivery = item; // PD3.0,
              }
              if (item.includes('min')) {
                batteryObj.advertised_charging_time = item; // 50% in 30 min (advertised)
              }
              if (item.includes('QC')) {
                batteryObj.quick_charge = item; // QC4,
              }
              if (item.includes('PPS')) {
                batteryObj.power_supply = item; // PPS,
              }
            }
          } else {
            if (
              battery.includes('W') &&
              (battery.includes('wired') || battery.includes('wireless'))
            ) {
              //15W wireless (MagSafe)
              const separator = 'W';
              const parts = battery.split(new RegExp(`\\${separator}`));
              const power = parts[0].trim();
              const description = parts.slice(1).join(separator).trim();
              batteryObj.charging_specifications = description; // wired, wireless
              batteryObj.power_output = power; // 25W, 65W, ect
            }
            if (
              !battery.includes('W') &&
              (battery.includes('wired') || battery.includes('wireless'))
            ) {
              batteryObj.charging_specifications = battery; // wired, wireless
            }
            if (battery.includes('PD')) {
              batteryObj.power_delivery = battery; // PD3.0,
            }
            if (battery.includes('min')) {
              batteryObj.advertised_charging_time = battery; // 50% in 30 min (advertised)
            }
            if (battery.includes('QC')) {
              batteryObj.quick_charge = battery; // QC4,
            }
            if (battery.includes('PPS')) {
              batteryObj.power_supply = battery; // PPS,
            }
          }
          deviceData['charging_specifications'].push(batteryObj);
        }
      } else if (
        !deviceObject['battery_charging'].includes('\n') &&
        deviceObject['battery_charging'].includes(',')
      ) {
        //67W wired, PD2.0
        for (const item of deviceObject['battery_charging'].split(',')) {
          const batteryObj = {};
          if (
            item.includes('W') &&
            (item.includes('wired') || item.includes('wireless'))
          ) {
            //15W wireless (MagSafe)
            const separator = 'W';
            const parts = item.split(new RegExp(`\\${separator}`));
            const power = parts[0].trim();
            const description = parts.slice(1).join(separator).trim();
            batteryObj.charging_specifications = description; // wired, wireless
            batteryObj.power_output = power; // 25W, 65W, ect
          }
          if (
            !item.includes('W') &&
            item.includes('wired') &&
            item.includes('wireless')
          ) {
            batteryObj.charging_specifications = item; // wired, wireless
          }
          if (item.includes('PD')) {
            batteryObj.power_delivery = item; // PD3.0,
          }
          if (item.includes('min')) {
            batteryObj.advertised_charging_time = item; // 50% in 30 min (advertised)
          }
          if (item.includes('QC')) {
            batteryObj.quick_charge = item; // QC4,
          }
          if (item.includes('PPS')) {
            batteryObj.power_supply = item; // PPS,
          }
          deviceData['charging_specifications'].push(batteryObj);
        }
      } else if (
        !deviceObject['battery_charging'].includes('\n') &&
        !deviceObject['battery_charging'].includes(',')
      ) {
        if (
          deviceObject['battery_charging'].includes('W') &&
          (deviceObject['battery_charging'].includes('wired') ||
            deviceObject['battery_charging'].includes('wireless'))
        ) {
          //15W wireless (MagSafe)
          const batteryObj = {};
          const separator = 'W';
          const parts = deviceObject['battery_charging'].split(
            new RegExp(`\\${separator}`),
          );
          const power = parts[0].trim();
          const description = parts.slice(1).join(separator).trim();
          batteryObj.charging_specifications = description; // wired, wireless
          batteryObj.power_output = power; // 25W, 65W, ect
  
          deviceData['charging_specifications'].push(batteryObj);
        }
      }
    }
  
    // --------------------------------------------------------------------------------
    deviceData['misc_colors'] = [];
    if ('misc_colors' in deviceObject) {
      for (const color of deviceObject['misc_colors']) {
        deviceData['misc_colors'].push({ name: color });
      }
    }
  
    deviceData['misc_models'] = [];
    if ('misc_models' in deviceObject) {
      if (deviceObject['misc_models'].includes(',')) {
        for (const model of deviceObject['misc_models'].split(',')) {
          deviceData['misc_models'].push({ name: model });
        }
      } else {
        deviceData['misc_models'].push({ name: deviceObject['misc_models'] });
      }
    }
  
    deviceData['price'] = {};
    deviceData['misc_price'] = 0;
    if ('misc_price' in deviceObject) {
      if (deviceObject['misc_price'].includes('EUR')) {
        const pricePattern = /(\d+(?:\.\d+)?)\s*EUR/;
        const matches = deviceObject['misc_price'].match(pricePattern);
        if (matches && matches[1]) {
          deviceData['misc_price'] = parseFloat(matches[1].replace(',', ''));
        }
      } else if (deviceObject['misc_price'].includes('€')) {
        // EUR symbol
        const regex = /€\s*([\d.,]+)/;
        const match = deviceObject['misc_price'].match(regex);
        deviceData['misc_price'] = match
          ? parseFloat(match[1].replace(',', ''))
          : 0;
      }
      //else if (deviceObject["misc_price"].includes("₹")) {
      //   // ₹ symbol
      //   const regex = /₹\s*([\d.,]+)/;
      //   const match = deviceObject["misc_price"].match(regex);
      //   const rupeePrice = match ? parseFloat(match[1].replace(",", "")) : 0;
      //   // Convert rupees to euros
      //   const euroPrice = rupeePrice * 0.011;
      //   // Store the price in euros in deviceData
      //   deviceData["misc_price"] = parseFloat(euroPrice.toFixed(2));
      // } else if (deviceObject["misc_price"].includes("$")) {
      //   // $ symbol
      //   const regex = /$\s*([\d.,]+)/;
      //   const match = deviceObject["misc_price"].match(regex);
      //   const dollarPrice = match ? parseFloat(match[1].replace(",", "")) : 0;
      //   // Convert dollar to euros
      //   const euroPrice = dollarPrice * 0.92;
      //   deviceData["misc_price"] = parseFloat(euroPrice.toFixed(2));
      // }
      if (deviceObject['misc_price'].includes('/')) {
        for (const price of deviceObject['misc_price'].split('/')) {
          if (deviceObject['misc_price'].includes('EUR')) {
            const pricePattern = /(\d+(?:\.\d+)?)\s*EUR/;
            const matches = price.match(pricePattern);
            if (matches && matches[1]) {
              deviceData['price']['EUR'] = parseFloat(
                matches[1].replace(',', ''),
              );
            }
          } else if (price.includes('€')) {
            // EUR symbol
            const regex = /€\s*([\d.,]+)/;
            const match = price.match(regex);
            deviceData['price']['EUR'] = match
              ? parseFloat(match[1].replace(',', ''))
              : 0;
          } else if (price.includes('₹')) {
            // ₹ symbol
            const regex = /₹\s*([\d.,]+)/;
            const match = price.match(regex);
            const rupeePrice = match ? parseFloat(match[1].replace(',', '')) : 0;
            // Store the price in euros in deviceData
            deviceData['price']['INR'] = rupeePrice;
          } else if (price.includes('$')) {
            // $ symbol
            const regex = /\$\s*([\d.,]+)/;
            const match = price.match(regex);
            const dollarPrice = match ? parseFloat(match[1].replace(',', '')) : 0;
            deviceData['price']['USD'] = dollarPrice;
          } else if (price.includes('£')) {
            // £ symbol
            const regex = /£\s*([\d.,]+)/;
            const match = price.match(regex);
            const GBPPrice = match ? parseFloat(match[1].replace(',', '')) : 0;
            deviceData['price']['GBP'] = GBPPrice;
          }
        }
      } else if (deviceObject['misc_price'].includes('EUR')) {
        // About 260 EUR
        const pricePattern = /(\d+(?:\.\d+)?)\s*EUR/;
        const matches = deviceObject['misc_price'].match(pricePattern);
        if (matches && matches[1]) {
          deviceData['price']['EUR'] = parseFloat(matches[1].replace(',', ''));
        }
      }
    }
  
    deviceData['misc_sar_head'] = null;
    deviceData['misc_sar_body'] = null;
    if ('misc_sar' in deviceObject) {
      const regex = /(\d+\.\d+\s*W\/kg\s*\(\w+\))/g;
      const matches = deviceObject['misc_sar'].match(regex); //'1.29 W/kg (head)', '1.09 W/kg (body)'
      if (matches) {
        deviceData['misc_sar_head'] = matches[0];
        deviceData['misc_sar_body'] = matches[1];
      }
    }
  
    deviceData['misc_sar_eu_head'] = null;
    deviceData['misc_sar_eu_body'] = null;
    if ('misc_sar_eu' in deviceObject) {
      const regex = /(\d+\.\d+\s*W\/kg\s*\(\w+\))/g;
      const matches = deviceObject['misc_sar_eu'].match(regex); //'1.29 W/kg (head)', '1.09 W/kg (body)'
      if (matches) {
        deviceData['misc_sar_eu_head'] = matches[0];
        deviceData['misc_sar_eu_body'] = matches[1];
      }
    }
    // --------------------------------------------------------------------------------
    deviceData['tests_display'] = null;
    if ('tests_display' in deviceObject) {
      deviceData['tests_display'] = deviceObject['tests_display'];
    }
  
    deviceData['tests_camera'] = null;
    if ('tests_camera' in deviceObject) {
      deviceData['tests_camera'] = deviceObject['tests_camera'].join(', ');
    }
  
    deviceData['tests_loud_speaker'] = null;
    if ('tests_loud_speaker' in deviceObject) {
      deviceData['tests_loud_speaker'] =
        deviceObject['tests_loud_speaker'].join(', ');
    }
  
    deviceData['tests_audio_quality'] = null;
    if ('tests_audio_quality' in deviceObject) {
      deviceData['tests_audio_quality'] =
        deviceObject['tests_audio_quality'].join(', ');
    }
  
    deviceData['test_battery_life'] = null;
    deviceData['body_weight_oz'] = null;
    if ('test_battery_life' in deviceObject) {
      deviceData['test_battery_life'] =
        deviceObject['test_battery_life'].join(', ');
    }
    deviceData['tests_performance'] = [];
    // deviceData["spec_score"] = 0;
    if ('tests_performance' in deviceObject) {
      try {
        if (deviceObject['tests_performance'].includes('\n')) {
          for (const test of deviceObject['tests_performance'].split('\n')) {
            test.replaceAll('\n', '');
            if (test.trim() === '') {
              // Skip empty lines
              continue;
            }
            const testObj = {
              tester_name: null,
              test_score: null,
              test_version: null,
            };
            if (test.includes('fps')) {
              const regex = /^(\w+):\s*(\d+(?:fps))\s*(\(.*\))?$/;
              const matches = test.match(regex);
              if (matches) {
                testObj.tester_name = matches[1];
                testObj.test_score = matches[2];
                testObj.test_version = matches[3];
              }
            }
            if (!test.includes('fps')) {
              const regex = /^(\w+):\s*(\d+)\s*(\(.*\))?$/;
              const matches = test.match(regex);
              if (matches) {
                testObj.tester_name = matches[1];
                testObj.test_score = matches[2];
                testObj.test_version = matches[3];
              }
            }
            deviceData['tests_performance'].push(testObj);
          }
        } else {
          const testObj = {
            tester_name: null,
            test_score: null,
            test_version: null,
          };
          if (deviceObject['tests_performance'].includes('fps')) {
            const regex = /^(\w+):\s*(\d+(?:fps))\s*(\(.*\))?$/;
            const matches = deviceObject['tests_performance'].match(regex);
            if (matches) {
              testObj.tester_name = matches[1];
              testObj.test_score = matches[2];
              testObj.test_version = matches[3];
            }
          }
          if (!deviceObject['tests_performance'].includes('fps')) {
            const regex = /^(\w+):\s*(\d+)\s*(\(.*\))?$/;
            const matches = deviceObject['tests_performance'].match(regex);
            if (matches) {
              testObj.tester_name = matches[1];
              testObj.test_score = matches[2];
              testObj.test_version = matches[3];
            }
          }
          deviceData['tests_performance'].push(testObj);
        }
      } catch (error) {
        console.log(' Error:', error);
      }
    }
  
    // -------------------------------------------------------------------------------
  
    // const specScore = deviceData["tests_performance"].find((element) =>
    //   element.tester_name === "AnTuTu" ? element : null
    // );
    // if (specScore) {
    //   deviceData["spec_score"] = parseInt(specScore["test_score"]);
    // }
  
    // --------------------------------------------------------------------------------
    deviceData['pricing_details'] = [];
    if ('pricingDetails' in deviceObject) {
      if (deviceObject['pricingDetails'].length != 0) {
        for (const pricingDetail of deviceObject['pricingDetails']) {
          const storageRegex = /(\d+(?:GB|TB|MB))/;
          const ramRegex = /(\d+(?:GB|TB|MB)\s+RAM|\d+(?:GB|TB|MB)\s+RAM)/;
  
          const storageMatch = pricingDetail.storage.match(storageRegex);
          const ramMatch = pricingDetail.storage.match(ramRegex);
  
          const storage = storageMatch ? storageMatch[1] : '';
          const ram = ramMatch ? ramMatch[1] : '';
  
          const amazonPricingDetailObj = {
            storage: storage ? storage : null,
            price: pricingDetail.amazonPrice ? pricingDetail.amazonPrice : null,
            platform: 'amazon',
            ram: ram ? ram : null,
          };
          const wirelessPlacePricingDetailObj = {
            storage: storage ? storage : null,
            price: pricingDetail.wirelessPlacePrice
              ? pricingDetail.wirelessPlacePrice
              : null,
            platform: 'wireless Place',
            ram: ram ? ram : null,
          };
          deviceData['pricing_details'].push(amazonPricingDetailObj);
          deviceData['pricing_details'].push(wirelessPlacePricingDetailObj);
        }
      }
    }
  
    deviceData['slug'] = null;
    deviceData['page_title'] = null;
    deviceData['page_description'] = null;
    deviceData['meta_description'] = null;
    deviceData['meta_keywords'] = null;
    deviceData['series'] = null;
  
    deviceData['publishedAt'] = null;
    // --------------------------------------------------------------------------------------------------
  
    // Define the iPhone model object
    const mainCameraFeature = deviceData['main_camera_features']
      .map((e) => e.name)
      .slice(0, 2)
      .join(', ');
    // console.log('mainCameraFeature', mainCameraFeature);
    // const selfieCameraFeature = deviceData['selfie_camera_features'] ? deviceData['selfie_camera_features'].map(feature => feature.name).join(', ') : '';
    const generateDeviceMetaDataObj = {
      title: `${deviceData['device_name']} - Full Phone Specs, Price and Comparison`,
      specifications: {
        display: `Display: ${deviceData['display_screen_size']} inches ${deviceData['display_type']};`,
        camera:
          deviceData['primary_camera'] > 0
            ? `Camera: ${deviceData['primary_camera']} MP;`
            : ``,
        processor: deviceData['chipset_processor']
          ? `Processor: ${deviceData['chipset_processor']} ${deviceData['chipset_model']};`
          : ``,
        ram: deviceData['ram'] > 0 ? `Ram: ${deviceData['ram']}GB;` : ``,
        battery:
          deviceData['battery_capacity'] > 0
            ? `Battery: ${deviceData['battery_capacity']} mAh;`
            : ``,
      },
      keywords: [
        `${deviceData['device_name']}`,
        `${deviceData['device_name']} Price`,
        `${deviceData['device_name']} in India`,
        `${deviceData['device_name']} specifications`,
        `${deviceData['device_name']} specs`,
        `${deviceData['device_name']} release date`,
        `${deviceData['device_name']} launch`,
        `${deviceData['device_name']} features`,
        `${deviceData['device_name']} price in India ${new Date().getFullYear()}`,
        `${deviceData['device_name']} review`,
      ],
    };
  
    const generateSlug = deviceData['device_name']
      ?.toLowerCase()
      .replace(/\s+/g, '-');
  
    // Remove special characters using the provided pattern
    const validSlug = generateSlug?.replace(/[^a-z0-9-_.~]/g, '');
    if (validSlug) {
      deviceData['slug'] = validSlug;
    }

    const socialEnum = {
      FACEBOOK: 'Facebook',
      TWITTER: 'Twitter',
    };
    let metaSocialArray = [];
  
    for (const key in socialEnum) {
      let socialNetworkObj = {};
      if (socialEnum.hasOwnProperty(key)) {
        const value = socialEnum[key]; // Facebook || Twitter
        (socialNetworkObj.socialNetwork = value),
          (socialNetworkObj.title = generateDeviceMetaDataObj['title']),
          (socialNetworkObj.description = `${deviceData['device_name']} specifications - ${generateDeviceMetaDataObj['specifications']['display']}`)
      }
      metaSocialArray.push(socialNetworkObj);
    }
  
    let seoObject = {
      metaTitle: generateDeviceMetaDataObj['title'],
      metaDescription: `${deviceData['device_name']} specifications - ${generateDeviceMetaDataObj['specifications']['display']} ${generateDeviceMetaDataObj['specifications']['camera']} ${generateDeviceMetaDataObj['specifications']['ram']} ${generateDeviceMetaDataObj['specifications']['battery']} ${generateDeviceMetaDataObj['specifications']['processor']}`,
      metaSocial: metaSocialArray,
      keywords: `${generateDeviceMetaDataObj['keywords'].join(', ')}`,
      metaRobots: 'index, follow',
      structuredData: null,
      metaViewport: 'width=device-width, initial-scale=1.0',
      canonicalURL: null,
    };
  
    deviceData['seo'] = seoObject;
  
    // ----------------------------------------------------------------------------------------------
    return deviceData;
  };
  