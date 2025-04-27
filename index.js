import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());

app.get('/api', async (req, res) => {
  const { queryAirportTemp, queryStockPrice, queryEval } = req.query;

  try {
    if (queryAirportTemp) {
      const temperature = await getAirportTemperature(queryAirportTemp);
      return res.json(temperature);
    }

    if (queryStockPrice) {
      const price = await getStockPrice(queryStockPrice);
      return res.json(price);
    }

    if (queryEval) {
        console.log(queryEval);
      const result = eval(queryEval);
      return res.json(result);
    }

    res.status(400).json({ error: 'No valid query parameter provided' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});


async function getAirportTemperature(iata) {
  const airportUrl = `https://airport-data.com/api/ap_info.json?iata=${iata}`;
  const airportRes = await fetch(airportUrl);
  if (!airportRes.ok) throw new Error('Invalid airport code or API error');

  const { latitude, longitude } = await airportRes.json();
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) throw new Error('Weather API error');

  const weatherData = await weatherRes.json();
  return weatherData.current_weather.temperature;
}

let options = {
  method: 'GET',
  url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes',
  params: {
    region: 'US',
  },
  headers: {
    'x-rapidapi-key': '9a9f3e7fd9mshe2baea35e74d886p1d1fe2jsnaf039bafcf52',
    'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
  }
};

async function getStockPrice(symbol) {
  try {
    const finalOptions = { ...options, params: { symbols: symbol } };
    const response = await axios.request(finalOptions);
    
    const price = response.data.quoteResponse.result[0].regularMarketPrice;
    console.log(price);
    return price;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch stock price.');
  }
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
