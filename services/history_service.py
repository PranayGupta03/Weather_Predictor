import sqlite3
import os
from datetime import datetime

class HistoryService:
    def __init__(self, db_path='data/predictions.db'):
        self.db_path = db_path
        self._ensure_db_exists()
    
    def _ensure_db_exists(self):
        """Create database and table if they don't exist"""
        # Ensure data directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT NOT NULL,
                actual_temp REAL NOT NULL,
                predicted_temp REAL NOT NULL,
                error REAL NOT NULL,
                model_used TEXT NOT NULL,
                humidity REAL,
                pressure REAL,
                wind_speed REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_prediction(self, city, actual_temp, predicted_temp, model_used, weather_data=None):
        """Save a prediction to the database"""
        error = abs(actual_temp - predicted_temp)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO predictions (city, actual_temp, predicted_temp, error, model_used, humidity, pressure, wind_speed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            city,
            actual_temp,
            predicted_temp,
            error,
            model_used,
            weather_data.get('humidity') if weather_data else None,
            weather_data.get('pressure') if weather_data else None,
            weather_data.get('wind_speed') if weather_data else None
        ))
        
        conn.commit()
        conn.close()
    
    def get_history(self, limit=50, city=None):
        """Get prediction history, optionally filtered by city"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if city:
            cursor.execute('''
                SELECT * FROM predictions 
                WHERE city = ?
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (city, limit))
        else:
            cursor.execute('''
                SELECT * FROM predictions 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def get_stats(self):
        """Get overall prediction statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                COUNT(*) as total_predictions,
                AVG(error) as avg_error,
                MIN(error) as min_error,
                MAX(error) as max_error,
                COUNT(DISTINCT city) as cities_predicted
            FROM predictions
        ''')
        
        row = cursor.fetchone()
        conn.close()
        
        if row[0] == 0:
            return {
                'total_predictions': 0,
                'avg_error': 0,
                'min_error': 0,
                'max_error': 0,
                'cities_predicted': 0
            }
        
        return {
            'total_predictions': row[0],
            'avg_error': round(row[1], 2) if row[1] else 0,
            'min_error': round(row[2], 2) if row[2] else 0,
            'max_error': round(row[3], 2) if row[3] else 0,
            'cities_predicted': row[4]
        }
