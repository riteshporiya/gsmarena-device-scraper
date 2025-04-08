// index.js

import express from 'express';
import scrappingRoutes from './routes/scrapping.route.js';

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', scrappingRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});