import axios from 'axios';
import { parse } from 'node-html-parser';

export async function scrapeGSMArenaBrands() {
  try {
    // Using your existing Axios configuration
    const response = await axios.get('https://www.gsmarena.com/makers.php3', {
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

    // Parse the HTML using node-html-parser
    const root = parse(response.data);
    
    // Find all brand links in the table structure
    // Fixed selector for GSMArena's current structure
    const brandLinks = root.querySelectorAll('.makers a');
    console.log('Found brand links:', brandLinks.length);
    
    const brands = [];
    
    // Extract each brand name and device count
    brandLinks.forEach(link => {
      try {
        let brandName = '';
        let deviceCount = 0;
        
        // Check if link has span for device count
        const span = link.querySelector('span');
        
        if (span) {
          // Extract the brand name (text before the span)
          const fullText = link.text;
          const spanText = span.text;
          brandName = fullText.replace(spanText, '').trim();
          
          // Extract device count from span
          const countMatch = spanText.match(/(\d+)/);
          if (countMatch) {
            deviceCount = parseInt(countMatch[1]);
          }
        } else {
          // If no span, just use the link text as brand name
          brandName = link.text.trim();
        }
        
        // Extract the URL for each brand
        const brandUrl = link.getAttribute('href');
        
        // Add to our brands array
        if (brandName && brandUrl) {
          brands.push({
            name: brandName,
            deviceCount: deviceCount,
            url: brandUrl
          });
        }
      } catch (err) {
        console.error('Error processing link:', err);
      }
    });
    
    // If we didn't find any brands with the first selector, try alternative selectors
    if (brands.length === 0) {
      console.log('Trying alternative selectors...');
      const alternativeSelectors = [
        'table td a', 
        '.brandmenu-v2 a',
        '#brands a',
        '.st-text a'
      ];
      
      for (const selector of alternativeSelectors) {
        const links = root.querySelectorAll(selector);
        console.log(`Found ${links.length} links with selector "${selector}"`);
        
        if (links.length > 0) {
          // Process these links - showing just a sample approach
          links.forEach(link => {
            try {
              const brandName = link.text.trim();
              const brandUrl = link.getAttribute('href');
              
              if (brandName && brandUrl && brandUrl.includes('phones')) {
                brands.push({
                  name: brandName,
                  deviceCount: 0, // We might not have this info with alternative selectors
                  url: brandUrl
                });
              }
            } catch (err) {
              console.error('Error processing alternative link:', err);
            }
          });
          
          if (brands.length > 0) {
            console.log(`Found ${brands.length} brands using selector "${selector}"`);
            break;
          }
        }
      }
    }
    
    return brands;
    
  } catch (error) {
    console.error('Error scraping GSMArena brands:', error);
    throw error;
  }
}