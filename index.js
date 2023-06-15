const corsAnywhere = require('cors-anywhere');

// Set the CORS-Anywhere options
const corsOptions = {
  originWhitelist: [], // Allow all origins
  requireHeader: ['origin', 'x-requested-with'], // Require the specified headers
  removeHeaders: ['cookie', 'cookie2'], // Remove the specified headers
};

// Create the CORS-Anywhere server
const server = corsAnywhere.createServer(corsOptions);

// Start the server on port 8080
server.listen(8080, 'localhost', () => {
  console.log('CORS Anywhere server started on http://localhost:8080');
});
