import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from config import Config
from services.weather_service import WeatherService

class WeatherPredictor:
    def __init__(self):
        self.lr_model = None
        self.rf_model = None
        self.gb_model = None  # Gradient Boosting
        self.scaler = StandardScaler()
        self.metrics = {
            'lr': {'r2': None, 'mse': None},
            'rf': {'r2': None, 'mse': None},
            'gb': {'r2': None, 'mse': None}
        }
        self.weather_service = WeatherService()
        self.is_trained = False
        self.best_model = 'gb'  # Track best performing model

    def train(self):
        weather_data = []
        for city in Config.TRAIN_CITIES:
            data = self.weather_service.fetch_weather_data(city)
            if data:
                weather_data.append(data)
        
        if len(weather_data) < 5:
            return False

        df = pd.DataFrame(weather_data)
        X = df[['humidity', 'pressure', 'wind_speed', 'feels_like', 'clouds', 'visibility']]
        y = df['temp']

        # Scale features for better performance
        X_scaled = self.scaler.fit_transform(X)

        # Train Linear Regression
        self.lr_model = LinearRegression()
        self.lr_model.fit(X_scaled, y)
        lr_pred = self.lr_model.predict(X_scaled)
        self.metrics['lr']['r2'] = r2_score(y, lr_pred)
        self.metrics['lr']['mse'] = mean_squared_error(y, lr_pred)

        # Train Random Forest with tuned hyperparameters
        self.rf_model = RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            min_samples_split=3,
            min_samples_leaf=2,
            random_state=42
        )
        self.rf_model.fit(X_scaled, y)
        rf_pred = self.rf_model.predict(X_scaled)
        self.metrics['rf']['r2'] = r2_score(y, rf_pred)
        self.metrics['rf']['mse'] = mean_squared_error(y, rf_pred)

        # Train Gradient Boosting (often best for regression)
        self.gb_model = GradientBoostingRegressor(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            min_samples_split=3,
            random_state=42
        )
        self.gb_model.fit(X_scaled, y)
        gb_pred = self.gb_model.predict(X_scaled)
        self.metrics['gb']['r2'] = r2_score(y, gb_pred)
        self.metrics['gb']['mse'] = mean_squared_error(y, gb_pred)

        # Determine best model based on R2 score
        best_r2 = max(self.metrics['lr']['r2'], self.metrics['rf']['r2'], self.metrics['gb']['r2'])
        if self.metrics['gb']['r2'] == best_r2:
            self.best_model = 'gb'
        elif self.metrics['rf']['r2'] == best_r2:
            self.best_model = 'rf'
        else:
            self.best_model = 'lr'

        self.is_trained = True
        return True

    def predict(self, city):
        if not self.is_trained:
            self.train()

        user_data = self.weather_service.fetch_weather_data(city)
        if not user_data:
            return None

        features = [[
            user_data['humidity'],
            user_data['pressure'],
            user_data['wind_speed'],
            user_data['feels_like'],
            user_data['clouds'],
            user_data['visibility']
        ]]

        # Scale features using trained scaler
        features_scaled = self.scaler.transform(features)

        lr_pred = self.lr_model.predict(features_scaled)[0]
        rf_pred = self.rf_model.predict(features_scaled)[0]
        gb_pred = self.gb_model.predict(features_scaled)[0]
        
        # Use best performing model for main prediction
        best_pred = {'lr': lr_pred, 'rf': rf_pred, 'gb': gb_pred}[self.best_model]
        
        forecast_data = self.weather_service.fetch_forecast_data(city)

        return {
            'predicted_temp': best_pred,
            'predictions': {
                'lr': lr_pred,
                'rf': rf_pred,
                'gb': gb_pred
            },
            'actual_temp': user_data['temp'],
            'city_data': user_data,
            'forecast': forecast_data,
            'metrics': self.metrics,
            'best_model': self.best_model
        }

    def get_comparison_data(self):
        if not self.is_trained:
            self.train()

        comparison_results = []
        for city in Config.TRAIN_CITIES:
            city_data = self.weather_service.fetch_weather_data(city)
            if city_data:
                features = [[
                    city_data['humidity'], 
                    city_data['pressure'], 
                    city_data['wind_speed'],
                    city_data['feels_like'],
                    city_data['clouds'],
                    city_data['visibility']
                ]]
                
                # Scale features
                features_scaled = self.scaler.transform(features)
                
                lr_pred = self.lr_model.predict(features_scaled)[0]
                rf_pred = self.rf_model.predict(features_scaled)[0]
                gb_pred = self.gb_model.predict(features_scaled)[0]
                
                best_pred = {'lr': lr_pred, 'rf': rf_pred, 'gb': gb_pred}[self.best_model]
                
                comparison_results.append({
                    'city': city,
                    'actual_temp': city_data['temp'],
                    'predicted_temp': best_pred,
                    'predictions': {
                        'lr': lr_pred,
                        'rf': rf_pred,
                        'gb': gb_pred
                    },
                    'error': abs(city_data['temp'] - best_pred)
                })
        return comparison_results
