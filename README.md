# 📱 GSM Arena Scraper with Express.js

A lightweight 🌐 web scraping application built with **Express.js** to extract both structured and unstructured mobile device data from **GSM Arena** — including specifications, images, and more.

---

## ✨ Features

- 🔍 Scrapes device specifications and details  
- 📂 Extracts both structured and unstructured data  
- 🖼️ Dynamically fetches device images  
- ⚡ Built with modern JavaScript (ES6+)  
- 🛠️ Utilizes `axios` and `node-html-parser` for efficiency  

---

## 🚀 Installation

Follow these steps to get up and running:

```bash
# 1. Clone the repository
git clone https://github.com/riteshporiya/gsmarena-device-scraper.git

# 2. Navigate to the project directory
cd gsmarena-device-scraper

# 3. Install dependencies
npm install
```

---

## 📡 API Endpoints

| Method | Endpoint                                  | Description |
|--------|-------------------------------------------|-------------|
| POST   | `/api/scrapping-device-structure-data`    | Scrapes structured device specifications from GSM Arena. 
| POST   | `/api/scrapping-device-unstructure-data`  | Scrapes unstructured device data like meta info, raw HTML blocks, etc. 
| POST   | `/api/scrapping-all-brands`  | Scrapes All Brands<br><br>

<details><summary>Get Structure Device (curl)</summary>

```bash
curl --location 'http://localhost:3000/api/scrapping-device-structure-data' \
--header 'Content-Type: application/json' \
--data '{
    "data": {
        "deviceUrl": "https://www.gsmarena.com/samsung_galaxy_s25_ultra-13322.php"
    }
}'
```
</details>


 <details><summary>Get UnStructure Device (curl)</summary>

```bash
curl --location 'http://localhost:3000/api/scrapping-device-unstructure-data' \
--header 'Content-Type: application/json' \
--data '{
    "data": {
        "deviceUrl": "https://www.gsmarena.com/samsung_galaxy_s25_ultra-13322.php"
    }
}'
```
</details>


 <details><summary>All Brands (curl)</summary>

```bash
curl --location 'http://localhost:3000/api/scrapping-all-brands' \
--header 'Cookie: connect.sid=s%3AQjXLvy2H6mbDNhWUOGEviZlaD7plZg8W.vqUz8yLGfFpwtGGyb0UY6htApQH2NdgSAHClF7cKp9Q'
```
</details>

---

## 📂 Project Structure

```bash
src/
├── controller/         # API Controllers
├── routes/             # Route Definitions
├── services/           # Scraping Logic & Utilities
└── index.js            # Application Entry Point
```

---

## 🛠️ Tech Stack

- **Node.js** – JavaScript runtime  
- **Express.js** – Web framework  
- **Axios** – Promise-based HTTP client  
- **Node-HTML-Parser** – Lightweight HTML parsing  

---

## 🤝 Contributing

Contributions are welcome! 🎉  
If you'd like to improve this project:

1. Fork the repo  
2. Create your feature branch  
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes  
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch  
   ```bash
   git push origin feature/your-feature
   ```
5. Create a new Pull Request ✅

---

## 📜 License

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for more information.
