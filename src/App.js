// App.js - Updated with weekly forecast and animations
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm, WiFog, WiHumidity, WiBarometer } from 'react-icons/wi';
import { FiSearch, FiMapPin, FiThermometer, FiWind } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_KEY = 'bc8cedf165e37757c1006f35f4d8322f';
const API_URL = 'https://api.openweathermap.org/data/2.5';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forecast, setForecast] = useState([]);

  // Group forecast by day for the weekly view
  const weeklyForecast = React.useMemo(() => {
    if (!forecast.length) return [];
    const days = {};
    forecast.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!days[date]) {
        days[date] = {
          date,
          items: [],
          temp_max: -Infinity,
          temp_min: Infinity,
          icon: item.weather[0].main
        };
      }
      days[date].items.push(item);
      days[date].temp_max = Math.max(days[date].temp_max, item.main.temp_max);
      days[date].temp_min = Math.min(days[date].temp_min, item.main.temp_min);
    });
    return Object.values(days).slice(0, 7); // Get next 7 days
  }, [forecast]);

  const getWeatherIcon = (condition, className = 'text-5xl') => {
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
        `${API_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric&cnt=40`
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

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-2 tracking-tight">Weather Forecast</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-8"
        >
          <form onSubmit={handleSubmit} className="flex shadow-lg rounded-full overflow-hidden">
            <input
              className="flex-1 px-6 py-3 text-gray-800 focus:outline-none"
              placeholder="Search city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 text-white font-medium transition-colors"
            >
              <FiSearch className="text-xl" />
            </button>
          </form>
        </motion.div>

        {/* Loading & Error States */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Loading weather data...</p>
            </motion.div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/90 text-white p-4 rounded-lg max-w-md mx-auto text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Current Weather */}
        {weather && !loading && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="weather-card"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <FiMapPin className="text-blue-300" />
                      {weather.name}, {weather.sys.country}
                    </h2>
                    <p className="text-gray-200">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-5xl font-bold mt-2 md:mt-0">
                    {Math.round(weather.main.temp)}°C
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-8xl">
                    {getWeatherIcon(weather.weather[0].main)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <WeatherDetail
                      icon={<FiThermometer className="text-blue-300 text-xl" />}
                      label="Feels Like"
                      value={`${Math.round(weather.main.feels_like)}°C`}
                    />
                    <WeatherDetail
                      icon={<WiHumidity className="text-blue-300 text-2xl" />}
                      label="Humidity"
                      value={`${weather.main.humidity}%`}
                    />
                    <WeatherDetail
                      icon={<FiWind className="text-blue-300 text-xl" />}
                      label="Wind"
                      value={`${Math.round(weather.wind.speed * 3.6)} km/h`}
                    />
                    <WeatherDetail
                      icon={<WiBarometer className="text-blue-300 text-2xl" />}
                      label="Pressure"
                      value={`${weather.main.pressure} hPa`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Weekly Forecast */}
            {weeklyForecast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12"
              >
                <h3 className="text-2xl font-bold mb-6">7-Day Forecast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
                  {weeklyForecast.map((day, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className="forecast-day bg-black/20 backdrop-blur-md rounded-xl p-4 text-center border border-white/10 hover:bg-white/20 transition-colors"
                    >
                      <p className="font-medium mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <div className="text-4xl my-3">
                        {getWeatherIcon(day.icon, 'text-4xl')}
                      </div>
                      <div className="flex justify-center gap-2">
                        <span className="font-bold">{Math.round(day.temp_max)}°</span>
                        <span className="text-gray-300">{Math.round(day.temp_min)}°</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Enhanced WeatherDetail component
function WeatherDetail({ icon, label, value }) {
  return (
    <motion.div 
      className="bg-black/20 backdrop-blur-md p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
        <div className="text-left">
          <div className="text-xs font-medium text-blue-100 tracking-wide">{label}</div>
          <div className="text-lg font-semibold tracking-tight">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default App;