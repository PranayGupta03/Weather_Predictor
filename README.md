# Weather Predictor 🌦️

A modern, AI-powered weather prediction application built with Flask and Machine Learning.

![Weather Predictor](https://img.shields.io/badge/Python-3.9+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features ✨

- **ML-Powered Predictions** - Uses Linear Regression, Random Forest, and Gradient Boosting
- **Real-time Weather Data** - Fetches live data from OpenWeatherMap API
- **5-Day Forecast** - View upcoming weather conditions
- **Air Quality Index (AQI)** - Real-time air quality monitoring
- **Multi-City Comparison** - Compare weather across 25+ Indian cities
- **Favorites System** - Save and quickly access favorite cities
- **Prediction History** - Track all past predictions with analytics
- **Dark Mode** - Beautiful dark/light theme toggle
- **Responsive Design** - Works on desktop and mobile

## Tech Stack 🛠️

- **Backend:** Python, Flask
- **ML:** Scikit-learn (LinearRegression, RandomForest, GradientBoosting)
- **Database:** SQLite
- **Frontend:** HTML5, CSS3, JavaScript, Chart.js
- **API:** OpenWeatherMap

## Project Structure 📁

```
weatherpredictor/
├── app.py                 # Flask application entry point
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── ml/
│   └── model.py           # ML models (LR, RF, GB)
├── services/
│   ├── weather_service.py # Weather API integration
│   └── history_service.py # SQLite history management
├── static/
│   ├── css/
│   │   └── style.css      # Glassmorphism styling
│   └── js/
│       └── main.js        # Frontend logic
└── templates/
    └── index.html         # Main dashboard
```

## Installation 🚀

### Prerequisites
- Python 3.9+
- OpenWeatherMap API Key (free tier works)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weatherpredictor.git
   cd weatherpredictor
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenWeatherMap API key
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open in browser**
   ```
   http://127.0.0.1:5000
   ```

## Environment Variables 🔐

Create a `.env` file with:

```env
OPENWEATHER_API_KEY=your_api_key_here
FLASK_SECRET_KEY=your_secret_key
DEBUG=True
```

## API Endpoints 📡

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main dashboard |
| `/predict` | POST | Get weather prediction |
| `/compare` | GET | Multi-city comparison |
| `/history` | GET | Prediction history |

## Deployment 🌐

### Vercel
This project is configured for Vercel deployment. See `vercel.json` for configuration.

### Heroku
```bash
heroku create your-app-name
heroku config:set OPENWEATHER_API_KEY=your_key
git push heroku main
```

## Screenshots 📸

### Light Mode
![Light Mode Dashboard](screenshots/light-mode.png)

### Dark Mode
![Dark Mode Dashboard](screenshots/dark-mode.png)

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [OpenWeatherMap](https://openweathermap.org/) for the weather API
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [FontAwesome](https://fontawesome.com/) for icons
