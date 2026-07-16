require('dotenv').config();
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not defined.');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

https.get(url, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (data.error) {
        console.error('API Error:', data.error.message);
      } else if (data.models) {
        console.log('Available models for your API key:');
        data.models.forEach(m => console.log(`- ${m.name}`));
      } else {
        console.log('Unexpected response:', data);
      }
    } catch (e) {
      console.error('Failed to parse response:', e);
      console.log('Raw response:', body);
    }
  });
}).on('error', (e) => {
  console.error('Network Error:', e.message);
});
