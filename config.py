import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    API_KEY = os.getenv('OPENWEATHER_API_KEY')
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'default_secret')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
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
