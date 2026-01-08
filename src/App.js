import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm, WiFog } from 'react-icons/wi';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import './App.css';

const API_KEY = 'bc8cedf165e37757c1006f35f4d8322f';
const API_URL = 'https://api.openweathermap.org/data/2.5';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forecast, setForecast] = useState([]);

  const getWeatherIcon = (condition, className = "text-5xl") => {
    const baseClass = `${className} mx-auto`;
    switch (condition) {
      case 'Clear':
        return <WiDaySunny className={`${baseClass} text-yellow-400`} />;
      case 'Rain':
      case 'Drizzle':
        return <WiRain className={`${baseClass} text-blue-400`} />;
      case 'Clouds':
        return <WiCloudy className={`${baseClass} text-gray-400`} />;
      case 'Snow':
        return <WiSnow className={`${baseClass} text-blue-200`} />;
      case 'Thunderstorm':
        return <WiThunderstorm className={`${baseClass} text-purple-500`} />;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return <WiFog className={`${baseClass} text-gray-300`} />;
      default:
        return <WiDaySunny className={`${baseClass} text-yellow-400`} />;
    }
  };

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch current weather
      const weatherResponse = await axios.get(
        `${API_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      // Fetch forecast
      const forecastResponse = await axios.get(
        `${API_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric&cnt=5`
      );
      
      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data.list);
    } catch (err) {
      setError('City not found. Please try again.');
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  // Initial load with default city
  useEffect(() => {
    fetchWeather('London');
  }, []);

    // UI rendering
  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 bg-gradient-to-br from-blue-400 to-purple-600 text-white">
      <h1 className="text-3xl font-semibold mb-6">Weather Forecast</h1>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex w-full max-w-md mb-8">
        <input
          className="flex-1 px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" className="bg-blue-700 px-4 rounded-r-lg flex items-center justify-center">
          <FiSearch className="text-xl" />
        </button>
      </form>

      {/* States */}
      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-300">{error}</p>}

      {weather && !loading && (
        <div className="bg-white/20 backdrop-blur-lg p-6 rounded-xl w-full max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-1">
              <FiMapPin /> {weather.name}, {weather.sys.country}
            </h2>
            <span className="text-5xl font-bold">{Math.round(weather.main.temp)}°C</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-6xl">
              {getWeatherIcon(weather.weather[0].main)}
            </div>
            <ul className="space-y-1 text-sm text-right">
              <li>Feels like: {Math.round(weather.main.feels_like)}°C</li>
              <li>Humidity: {weather.main.humidity}%</li>
              <li>Wind: {Math.round(weather.wind.speed * 3.6)} km/h</li>
              <li>Pressure: {weather.main.pressure} hPa</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;