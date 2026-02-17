import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    API_KEY = os.getenv('OPENWEATHER_API_KEY')
    # Check if running on Render (production environment)
    IS_PRODUCTION = os.getenv('RENDER') == 'true'

    if IS_PRODUCTION:
        # Reduce training data for production to ensure fast startup (Render free tier acts as a cold start sometimes)
        TRAIN_CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata"]
    else:
        TRAIN_CITIES = [
            # Metros
            "Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru", "Hyderabad",
            # Major Cities
            "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
            "Indore", "Bhopal", "Patna", "Vadodara", "Surat", "Ludhiana",
            # Diverse Climate Regions
            "Thiruvananthapuram", "Coimbatore", "Visakhapatnam", "Chandigarh",
            "Guwahati", "Ranchi", "Dehradun"
        ]
    BASE_URL = "http://api.openweathermap.org/data/2.5/weather"
    FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast"
    AQI_URL = "http://api.openweathermap.org/data/2.5/air_pollution"
