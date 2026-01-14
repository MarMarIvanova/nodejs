const http = require('http');
const { URL } = require('url');
const config = require('../config');

process.env.BASE_URL ||= config.BASE_URL;
process.env.CURRENT_PATH ||= config.CURRENT_PATH;
process.env.API_KEY ||= config.API_KEY;
process.env.UNITS ||= config.UNITS;
process.env.DEFAULT_CITY ||= config.DEFAULT_CITY;

const city = process.argv.slice(2).join(' ').trim() || process.env.DEFAULT_CITY;

const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.log('Error: API key does not exist in environment');
  process.exit(1);
}

const baseUrl = process.env.BASE_URL;
const currentPath = process.env.CURRENT_PATH;

const url = new URL(baseUrl + currentPath);
url.searchParams.set('access_key', apiKey);
url.searchParams.set('query', city);
url.searchParams.set('units', process.env.UNITS);

http
  .get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      if (res.statusCode && res.statusCode >= 400) {
        console.log(`HTTP error: ${res.statusCode}`);
        console.log(data);
        return;
      }

      let json;
      try {
        json = JSON.parse(data);
      } catch {
        console.log('Can not parse API response:');
        console.log(data);
        return;
      }

      if (json.success === false || json.error) {
        console.log('API Error:', json.error?.info || JSON.stringify(json.error));
        return;
      }

      const location = json.location;
      const current = json.current;

      const desc = Array.isArray(current.weather_descriptions)
        ? current.weather_descriptions.join(', ')
        : current.weather_descriptions;

      console.log(`The weather in ${location.name}, ${location.country}`);
      console.log(`Temperature: ${current.temperature}°`);
      console.log(`Wet: ${current.humidity}%`);
      console.log(`Wind: ${current.wind_speed} kmph`);
    });
  })
  .on('error', (err) => {
    console.log('Request error:', err.message);
  });