let app;

try {
  app = require('./handler.cjs');
  app = app.default ?? app;
} catch (error) {
  console.error('[api] Failed to load handler:', error);

  const express = require('express');
  app = express();

  app.use((req, res) => {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start API server',
      hint: 'Check Vercel environment variables and function logs',
    });
  });
}

module.exports = app;
