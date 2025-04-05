require('dotenv').config(); // Make sure this is at the top
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Enable CORS to allow your frontend (running on port 3000) to access the server (on port 5000)
app.use(cors({origin : "numetry-project-weather.vercel.app"}));

app.get('/weather', async (req, res) => {
  const city = req.query.city; // Get city from query parameter

  if (!city) {
    return res.status(400).json({ message: 'City name is required' });
  }

  try {
    // Mock response for testing purposes (remove after testing)
    // If you want to simulate a working server without calling the external API
    const mockResponse = {
      current_condition: {
        temp_C: 25,
        humidity: 60,
        windspeed_km_h: 15,
      },
      weather: [
        { date: '2023-04-01', temp_C: 24, humidity: 55, windspeed_km_h: 10 },
        { date: '2023-04-02', temp_C: 26, humidity: 58, windspeed_km_h: 12 },
        { date: '2023-04-03', temp_C: 27, humidity: 59, windspeed_km_h: 11 }, 
        { date: '2023-04-04', temp_C: 28, humidity: 60, windspeed_km_h: 14 }, // 4 days of data
      ],
    };

    return res.json(mockResponse); // Comment out the above lines if you're testing with mock data

    // External API request (uncomment for actual use)
    const options = {
      method: 'GET',
      url: `https://world-weather-online-api1.p.rapidapi.com/premium/v1/weather.ashx`,
      params: {
        key: process.env.RAPIDAPI_KEY,
        q: city,
        format: 'json',
        num_of_days: '4', // Fetch weather data for 4 upcoming days
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
      },
    };

    const response = await axios.request(options);

    // Log the API response to verify the format
    console.log('API Response:', response.data);

    const weatherData = response.data.data;

    if (!weatherData || !weatherData.current_condition) {
      return res.status(500).json({ message: 'Error fetching weather data: Invalid format' });
    }

    const currentCondition = weatherData.current_condition[0];
    const upcomingWeather = weatherData.weather.slice(1, 5); // Get next 4 days of weather data (1st index to 5th)

    const formattedData = {
      current_condition: currentCondition,
      weather: upcomingWeather,
    };

    return res.json(formattedData);
  } catch (err) {
    // Enhanced error logging
    console.error('Error fetching weather data:', err.message || err);
    return res.status(500).json({ message: 'Internal Server Error: ' + (err.message || err) });
  }
});

// Make sure to replace this with your desired port (5000 or other)
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
