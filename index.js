import express from 'express';
import yahooFinance from 'yahoo-finance2';

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


async function getAirportTemperature(icao) {
  const airportUrl = `https://airport-data.com/api/ap_info.json?icao=${icao}`;
  const airportRes = await fetch(airportUrl);
  if (!airportRes.ok) throw new Error('Invalid airport code or API error');

  const { latitude, longitude } = await airportRes.json();
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) throw new Error('Weather API error');

  const weatherData = await weatherRes.json();
  return weatherData.current_weather.temperature;
}


async function getStockPrice(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);
    if (!quote || !quote.regularMarketPrice) {
      throw new Error('No price data for symbol');
    }
    return quote.regularMarketPrice;
  } catch (err) {
    throw new Error('Invalid stock symbol or API error');
  }
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
