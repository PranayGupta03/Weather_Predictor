import requests
import time
import pandas as pd
from config import Config

class WeatherService:
    def __init__(self):
        self.cache = {}
        self.cache_duration = 600  # 10 minutes

    def _calculate_aqi_from_pm25(self, pm25):
        """Calculate AQI from PM2.5 concentration using EPA breakpoints"""
        # EPA AQI breakpoints for PM2.5 (μg/m³)
        breakpoints = [
            (0, 12.0, 0, 50),       # Good
            (12.1, 35.4, 51, 100),  # Moderate
            (35.5, 55.4, 101, 150), # Unhealthy for Sensitive Groups
            (55.5, 150.4, 151, 200),# Unhealthy
            (150.5, 250.4, 201, 300),# Very Unhealthy
            (250.5, 500.4, 301, 500) # Hazardous
        ]
        
        for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
            if bp_lo <= pm25 <= bp_hi:
                aqi = ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (pm25 - bp_lo) + aqi_lo
                return round(aqi)
        
        # If PM2.5 exceeds 500.4, cap at 500
        if pm25 > 500.4:
            return 500
        return 0

    def fetch_weather_data(self, city):
        # Check cache
        current_time = time.time()
        if city in self.cache:
            data, timestamp = self.cache[city]
            if current_time - timestamp < self.cache_duration:
                return data

        # Fetch from API
        params = {'q': city, 'appid': Config.API_KEY, 'units': 'metric'}
        try:
            response = requests.get(Config.BASE_URL, params=params)
            if response.status_code == 200:
                data = response.json()
                # Fetch AQI - Calculate actual AQI from PM2.5
                lat = data['coord']['lat']
                lon = data['coord']['lon']
                aqi = 0
                try:
                    aqi_params = {'lat': lat, 'lon': lon, 'appid': Config.API_KEY}
                    aqi_response = requests.get(Config.AQI_URL, params=aqi_params)
                    if aqi_response.status_code == 200:
                        aqi_data = aqi_response.json()
                        # Get PM2.5 concentration
                        pm25 = aqi_data['list'][0]['components'].get('pm2_5', 0)
                        # Calculate AQI from PM2.5 using EPA breakpoints
                        aqi = self._calculate_aqi_from_pm25(pm25)
                except Exception as e:
                    print(f"Error fetching AQI: {e}")

                weather_info = {
                    'city': city,
                    'temp': data['main']['temp'],
                    'humidity': data['main']['humidity'],
                    'pressure': data['main']['pressure'],
                    'wind_speed': data['wind']['speed'],
                    'feels_like': data['main']['feels_like'],
                    'description': data['weather'][0]['description'],
                    'icon': data['weather'][0]['icon'],
                    'clouds': data.get('clouds', {}).get('all', 0),
                    'visibility': data.get('visibility', 10000),
                    'aqi': aqi
                }
                # Update cache
                self.cache[city] = (weather_info, current_time)
                return weather_info
            else:
                print(f"Error fetching data for {city}: {response.status_code}")
                return None
        except Exception as e:
            print(f"Exception fetching data for {city}: {e}")
            return None

    def fetch_forecast_data(self, city):
        # Check cache (could use separate cache key)
        cache_key = f"{city}_forecast"
        current_time = time.time()
        if cache_key in self.cache:
            data, timestamp = self.cache[cache_key]
            if current_time - timestamp < self.cache_duration:
                return data

        params = {'q': city, 'appid': Config.API_KEY, 'units': 'metric'}
        try:
            response = requests.get(Config.FORECAST_URL, params=params)
            if response.status_code == 200:
                data = response.json()
                # Process forecast to get daily data (approximate by taking noon values)
                daily_forecast = []
                # OpenWeatherMap returns 3-hour intervals (8 per day)
                # We'll pick one entry per day (e.g., around 12:00 PM)
                seen_dates = set()
                
                for item in data['list']:
                    dt_txt = item['dt_txt']
                    date = dt_txt.split(' ')[0]
                    time_part = dt_txt.split(' ')[1]
                    
                    if date not in seen_dates and "12:00:00" in time_part:
                        daily_forecast.append({
                            'date': date,
                            'day_name': pd.to_datetime(date).strftime('%a'),
                            'temp': item['main']['temp'],
                            'description': item['weather'][0]['description'],
                            'icon': item['weather'][0]['icon']
                        })
                        seen_dates.add(date)
                        
                        if len(daily_forecast) >= 5:
                            break
                
                # If we didn't get 5 days (e.g. late night request), fill with next available
                if len(daily_forecast) < 5:
                    for item in data['list']:
                        dt_txt = item['dt_txt']
                        date = dt_txt.split(' ')[0]
                        if date not in seen_dates:
                             daily_forecast.append({
                                'date': date,
                                'day_name': pd.to_datetime(date).strftime('%a'),
                                'temp': item['main']['temp'],
                                'description': item['weather'][0]['description'],
                                'icon': item['weather'][0]['icon']
                            })
                             seen_dates.add(date)
                             if len(daily_forecast) >= 5:
                                break

                self.cache[cache_key] = (daily_forecast, current_time)
                return daily_forecast
            else:
                print(f"Error fetching forecast for {city}: {response.status_code}")
                return []
        except Exception as e:
            print(f"Exception fetching forecast for {city}: {e}")
            return []
