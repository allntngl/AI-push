const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Enable CORS for all origins (adjust in production)
app.use(cors());
app.use(express.json());

// Serve the dashboard HTML file
app.use(express.static(__dirname));

// Base Yotpo API URL
const YOTPO_BASE_URL = 'https://api.yotpo.com/core/v3';

// Proxy endpoint for all Yotpo API requests
app.all('/api/yotpo/*', async (req, res) => {
  try {
    const yotpoPath = req.params[0];
    const yotpoUrl = `${YOTPO_BASE_URL}/${yotpoPath}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

    console.log(`[${req.method}] Proxying request to: ${yotpoUrl}`);

    const headers = {
      'Content-Type': 'application/json',
    };

    // Forward X-Yotpo-Token if present
    if (req.headers['x-yotpo-token']) {
      headers['X-Yotpo-Token'] = req.headers['x-yotpo-token'];
    }

    const options = {
      method: req.method,
      headers: headers,
    };

    // Add body for POST, PATCH, PUT requests
    if (['POST', 'PATCH', 'PUT'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(yotpoUrl, options);

    // Try to parse as JSON, fallback to text if it fails
    let data;
    const contentType = response.headers.get('content-type');

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Try to parse as JSON anyway
        try {
          data = JSON.parse(text);
        } catch {
          // Return text wrapped in object
          data = { message: text, status: response.status };
        }
      }
    } catch (err) {
      console.error('Parse error:', err.message);
      data = { error: 'Failed to parse response', status: response.status };
    }

    console.log(`[${response.status}] Response received`);

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({
      error: 'Proxy server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Yotpo Proxy Server is running' });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Yotpo Proxy Server Running                         ║
║                                                          ║
║   Local:   http://localhost:${PORT}                        ║
║   Status:  http://localhost:${PORT}/health                 ║
║                                                          ║
║   📂 Open: http://localhost:${PORT}/yotpo-dashboard.html   ║
║                                                          ║
║   Press Ctrl+C to stop                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});
