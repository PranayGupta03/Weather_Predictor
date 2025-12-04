# 🌦️ Weather Predictor — AI-Powered Forecasting Web App  

A **modern, fully-featured weather prediction platform** built with **Flask, Machine Learning, and real-time weather APIs**. This project combines **data science, software engineering, and UI/UX** to deliver an intelligent, fast, and visually appealing weather dashboard.

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)
![ML](https://img.shields.io/badge/Machine%20Learning-Scikit--Learn-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

</div>

---

## ⭐ Overview

Weather Predictor is designed as a **production-ready**, ML-driven application that provides:

- **Accurate temperature predictions** using multiple ML models  
- **Live weather updates** and multi-city comparison  
- **Interactive charts**, dark mode UI, and complete prediction history  

Ideal for **portfolio showcases**, **academic submissions**, and **ML learners**.

---

## ✨ Features

### 🔮 Machine Learning
- Built-in models:
  - **Linear Regression**
  - **Random Forest Regressor**
  - **Gradient Boosting Regressor**
- Automated feature preprocessing  
- Real-time predictions using live API data  

### 🌦️ Weather & Forecasting
- Live temperature, humidity, wind speed, pressure, cloud %, and visibility  
- **5-Day Weather Forecast**  
- **Air Quality Index (AQI)** with pollutant categorization  

### 🏙️ Multi-City & User Tools
- Compare weather across **25+ Indian cities**
- Save **favorite cities**
- **Prediction History** with analytics and timestamps

### 🎨 UI/UX
- Fully **responsive** (mobile + desktop)
- **Dark/Light mode**
- Smooth animations + glassmorphism styling
- Chart.js interactive graphs

---

## 🛠️ Tech Stack

### Backend
- Python 3.9+
- Flask  
- SQLite  

### Machine Learning
- scikit-learn  
- NumPy, Pandas  

### Frontend
- HTML5, CSS3, JavaScript  
- Chart.js  

### APIs
- **OpenWeatherMap** (Live weather + forecast)

---

## 📁 Project Structure

```
weatherpredictor/
│
├── app.py                   # Flask app entry point
├── config.py                # Environment variables, API keys
├── requirements.txt         # Dependencies
│
├── ml/
│   └── model.py             # ML models and prediction pipeline
│
├── services/
│   ├── weather_service.py   # OpenWeather API service
│   └── history_service.py   # SQLite operations
│
├── static/
│   ├── css/
│   │   └── style.css        # UI styling
│   └── js/
│       └── main.js          # Frontend logic
│
└── templates/
    └── index.html           # UI dashboard
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- OpenWeatherMap API Key

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/weatherpredictor.git
cd weatherpredictor
```

### 2️⃣ Create virtual environment
```bash
python -m venv venv
source venv/bin/activate     # Mac/Linux
venv\Scripts\activate        # Windows
```

### 3️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 4️⃣ Configure `.env`
```bash
cp .env.example .env
```

Edit:
```env
OPENWEATHER_API_KEY=your_api_key_here
FLASK_SECRET_KEY=your_secret_key
DEBUG=True
```

### 5️⃣ Run the server
```bash
python app.py
```

### 6️⃣ Open browser
```
http://127.0.0.1:5000
```

---

## 🔐 Environment Variables

| Variable | Description |
|---------|-------------|
| `OPENWEATHER_API_KEY` | API key for weather data |
| `FLASK_SECRET_KEY` | Security key for sessions |
| `DEBUG` | Enable/disable debug mode |

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main dashboard |
| `/predict` | POST | Predict temperature |
| `/compare` | GET | Compare multiple cities |
| `/history` | GET | Fetch prediction history |

---

## 🖥️ Quick Run

```bash
git clone https://github.com/PranayGupta03/Weather_Predictor.git
cd Weather_Predictor
pip install -r requirements.txt
python app.py
```

---

## 📸 Screenshots

### 🌞 Light Mode
![Light Mode Dashboard](screenshots/light-mode.png)

### 🌙 Dark Mode
![Dark Mode Dashboard](screenshots/dark-mode.png)

---

## 🤝 Contributing

1. Fork the repository  
2. Create a branch  
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes  
4. Push to the branch  
5. Submit a Pull Request  

---

## 📄 License

Distributed under the **MIT License**.

---

## 🙏 Acknowledgments

- **OpenWeatherMap**
- **Scikit-learn**
- **Chart.js**
- **FontAwesome**

---

## 🎯 Final Notes

This project highlights:
- Clean architecture  
- ML + API integration  
- Professional UI  
- Scalable backend
