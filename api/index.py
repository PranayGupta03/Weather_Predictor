from flask import Flask, render_template, request, jsonify
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config
from ml.model import WeatherPredictor
from services.history_service import HistoryService

app = Flask(__name__, 
            template_folder='../templates',
            static_folder='../static')
app.config.from_object(Config)

predictor = WeatherPredictor()
history_service = HistoryService(db_path='/tmp/predictions.db')

# Train model on first request
model_trained = False

@app.before_request
def ensure_model_trained():
    global model_trained
    if not model_trained:
        predictor.train()
        model_trained = True

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    city = request.form.get('city')
    if not city:
        return jsonify({'error': 'City is required'}), 400

    result = predictor.predict(city)
    
    if not result:
        return jsonify({'error': 'Could not fetch weather data'}), 500

    # Save prediction to history
    try:
        history_service.save_prediction(
            city=city,
            actual_temp=result['actual_temp'],
            predicted_temp=result['predicted_temp'],
            model_used=result.get('best_model', 'gb'),
            weather_data=result['city_data']
        )
    except:
        pass  # Don't fail if history save fails on serverless

    return jsonify(result)

@app.route('/compare', methods=['GET'])
def compare():
    try:
        data = predictor.get_comparison_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """Get prediction history"""
    try:
        city = request.args.get('city')
        limit = int(request.args.get('limit', 50))
        history = history_service.get_history(limit=limit, city=city)
        stats = history_service.get_stats()
        return jsonify({'history': history, 'stats': stats})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Vercel handler
app = app
