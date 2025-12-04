document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('predict-form');
    const resultSection = document.getElementById('result-section');
    const welcomeMessage = document.getElementById('welcome-message');
    const weatherIconContainer = document.getElementById('weather-icon-container');
    const themeToggle = document.getElementById('theme-toggle');
    let weatherChart = null;

    // Theme Toggle Logic
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        updateChartTheme(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const spinner = btn.querySelector('.spinner');
        const btnText = btn.querySelector('.btn-text');

        // Loading State
        btn.disabled = true;
        spinner.style.display = 'block';
        btnText.style.opacity = '0.7';

        const formData = new FormData(form);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                renderResults(data);
            } else {
                alert(data.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch prediction');
        } finally {
            // Reset Button
            btn.disabled = false;
            spinner.style.display = 'none';
            btnText.style.opacity = '1';
        }
    });

    function renderResults(data) {
        welcomeMessage.style.display = 'none';
        resultSection.style.display = 'flex';

        // Update Text Elements
        const cityNameEl = document.getElementById('city-name');
        cityNameEl.innerHTML = `${data.city_data.city}<i id="favorite-toggle" class="far fa-star favorite-star" title="Add to favorites"></i>`;
        document.getElementById('favorite-toggle').addEventListener('click', toggleFavorite);
        updateFavoriteStar(data.city_data.city);
        document.getElementById('date').innerHTML = `<i class="far fa-calendar-alt"></i> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        document.getElementById('weather-desc').textContent = data.city_data.description;
        
        // Check and display weather alerts
        const alerts = checkWeatherAlerts(data);
        renderAlerts(alerts);
        document.getElementById('temp-display').textContent = `${Math.round(data.city_data.temp)}°C`;

        document.getElementById('feels-like').textContent = `${Math.round(data.city_data.feels_like)}°C`;
        document.getElementById('humidity').textContent = `${data.city_data.humidity}%`;
        document.getElementById('wind-speed').textContent = `${data.city_data.wind_speed} m/s`;
        document.getElementById('pressure').textContent = `${data.city_data.pressure} hPa`;

        // AQI and Visibility
        const aqiValue = data.city_data.aqi;
        let aqiText = '--';
        let aqiColor = 'var(--text-color)';

        if (aqiValue !== undefined && aqiValue !== null && aqiValue > 0) {
            // AQI categories based on 0-500 scale
            let category = 'Good';
            if (aqiValue <= 50) {
                category = 'Good';
                aqiColor = '#00e676';
            } else if (aqiValue <= 100) {
                category = 'Moderate';
                aqiColor = '#ffeb3b';
            } else if (aqiValue <= 150) {
                category = 'Unhealthy (SG)';
                aqiColor = '#ff9800';
            } else if (aqiValue <= 200) {
                category = 'Unhealthy';
                aqiColor = '#ff5722';
            } else if (aqiValue <= 300) {
                category = 'Very Unhealthy';
                aqiColor = '#9c27b0';
            } else {
                category = 'Hazardous';
                aqiColor = '#7b1fa2';
            }
            aqiText = `${aqiValue} (${category})`;
        }

        const aqiElement = document.getElementById('aqi');
        aqiElement.textContent = aqiText;
        aqiElement.style.color = aqiColor;
        aqiElement.style.fontWeight = '600';

        const visibilityKm = data.city_data.visibility ? (data.city_data.visibility / 1000).toFixed(1) : '--';
        document.getElementById('visibility').textContent = `${visibilityKm} km`;

        // Update Model Metrics
        if (data.metrics) {
            document.getElementById('lr-r2').textContent = data.metrics.lr.r2 ? data.metrics.lr.r2.toFixed(4) : 'N/A';
            document.getElementById('lr-mse').textContent = data.metrics.lr.mse ? data.metrics.lr.mse.toFixed(4) : 'N/A';
            document.getElementById('rf-r2').textContent = data.metrics.rf.r2 ? data.metrics.rf.r2.toFixed(4) : 'N/A';
            document.getElementById('rf-mse').textContent = data.metrics.rf.mse ? data.metrics.rf.mse.toFixed(4) : 'N/A';
        }

        document.getElementById('predicted-val').textContent = `${data.predicted_temp.toFixed(2)}°C`;
        document.getElementById('actual-val').textContent = `${data.actual_temp.toFixed(2)}°C`;

        // Update Icon
        updateWeatherIcon(data.city_data.icon, data.city_data.description);

        // Render Forecast
        if (data.forecast) {
            renderForecast(data.forecast);
        }

        // Render Chart
        renderChart(data);
    }

    function renderForecast(forecastData) {
        const forecastGrid = document.getElementById('forecast-grid');
        forecastGrid.innerHTML = '';

        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-showers-heavy',
            '09n': 'fas fa-cloud-showers-heavy',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };

        forecastData.forEach(day => {
            const iconClass = iconMap[day.icon] || 'fas fa-cloud';
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="forecast-day">${day.day_name}</div>
                <div class="forecast-icon"><i class="${iconClass}"></i></div>
                <div class="forecast-temp">${Math.round(day.temp)}°C</div>
                <div class="forecast-desc">${day.description}</div>
            `;
            forecastGrid.appendChild(card);
        });
    }

    function updateWeatherIcon(iconCode, description) {
        // Map OpenWeatherMap icon codes to FontAwesome classes
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-showers-heavy',
            '09n': 'fas fa-cloud-showers-heavy',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };

        const iconClass = iconMap[iconCode] || 'fas fa-cloud';
        weatherIconContainer.innerHTML = `<i class="${iconClass}"></i>`;

        // Add specific animation classes based on weather type
        const iconElement = weatherIconContainer.querySelector('i');
        if (description.includes('clear')) {
            iconElement.style.color = '#ffd700';
            iconElement.style.animation = 'spin-slow 10s linear infinite';
        } else if (description.includes('rain')) {
            iconElement.style.color = '#a0c4ff';
            iconElement.style.animation = 'float 2s ease-in-out infinite';
        } else if (description.includes('cloud')) {
            iconElement.style.color = '#e0e0e0';
            iconElement.style.animation = 'float 3s ease-in-out infinite';
        } else if (description.includes('thunder')) {
            iconElement.style.color = '#ffd700';
            iconElement.style.animation = 'pulse 1s infinite';
        }
    }

    function renderChart(data) {
        const ctx = document.getElementById('predictionChart').getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#e0e0e0' : '#2b2d42';

        if (weatherChart) {
            weatherChart.destroy();
        }

        const gradientPredicted = ctx.createLinearGradient(0, 0, 0, 400);
        gradientPredicted.addColorStop(0, 'rgba(67, 97, 238, 0.8)');
        gradientPredicted.addColorStop(1, 'rgba(67, 97, 238, 0.2)');

        const gradientActual = ctx.createLinearGradient(0, 0, 0, 400);
        gradientActual.addColorStop(0, 'rgba(63, 55, 201, 0.8)');
        gradientActual.addColorStop(1, 'rgba(63, 55, 201, 0.2)');

        weatherChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Predicted', 'Actual'],
                datasets: [{
                    label: 'Temperature (°C)',
                    data: [data.predicted_temp, data.actual_temp],
                    backgroundColor: [
                        gradientPredicted,
                        gradientActual
                    ],
                    borderColor: [
                        'rgba(67, 97, 238, 1)',
                        'rgba(63, 55, 201, 1)'
                    ],
                    borderWidth: 0,
                    borderRadius: 8,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: 'rgba(0,0,0,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                family: "'Inter', sans-serif",
                                weight: '600'
                            }
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    function updateChartTheme(theme) {
        if (!weatherChart) return;

        const isDark = theme === 'dark';
        const textColor = isDark ? '#e0e0e0' : '#2b2d42';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

        weatherChart.options.plugins.tooltip.backgroundColor = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        weatherChart.options.plugins.tooltip.titleColor = textColor;
        weatherChart.options.plugins.tooltip.bodyColor = textColor;
        weatherChart.options.scales.y.grid.color = gridColor;
        weatherChart.options.scales.y.ticks.color = textColor;
        weatherChart.options.scales.x.ticks.color = textColor;
        weatherChart.update();

        if (comparisonChart) {
            updateComparisonChartTheme(theme);
        }
    }

    // Comparison Logic
    const compareBtn = document.getElementById('compare-btn');
    const compareModal = document.getElementById('compare-modal');
    const closeModal = document.querySelector('.close-modal');
    let comparisonChart = null;

    compareBtn.addEventListener('click', async () => {
        compareModal.style.display = 'flex';

        try {
            const response = await fetch('/compare');
            const data = await response.json();
            renderComparison(data);
        } catch (error) {
            console.error('Error fetching comparison data:', error);
        }
    });

    closeModal.addEventListener('click', () => {
        compareModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === compareModal) {
            compareModal.style.display = 'none';
        }
    });

    function renderComparison(data) {
        const tableBody = document.getElementById('comparison-table-body');
        tableBody.innerHTML = '';

        data.forEach(city => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--border-color)';
            row.innerHTML = `
                <td style="padding: 1rem; font-weight: 600;">${city.city}</td>
                <td style="padding: 1rem; text-align: right;">${city.actual_temp.toFixed(1)}°C</td>
                <td style="padding: 1rem; text-align: right; color: var(--primary-color);">${city.predicted_temp.toFixed(1)}°C</td>
                <td style="padding: 1rem; text-align: right; color: ${city.error < 2 ? 'var(--success-color)' : '#ff6b6b'};">${city.error.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });

        renderComparisonChart(data);
    }

    function renderComparisonChart(data) {
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#e0e0e0' : '#2b2d42';

        if (comparisonChart) {
            comparisonChart.destroy();
        }

        comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.city),
                datasets: [{
                    label: 'Prediction Error (Abs Diff)',
                    data: data.map(d => d.error),
                    backgroundColor: 'rgba(67, 97, 238, 0.6)',
                    borderColor: 'rgba(67, 97, 238, 1)',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Prediction Error by City',
                        color: textColor
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }

    function updateComparisonChartTheme(theme) {
        if (!comparisonChart) return;
        const isDark = theme === 'dark';
        const textColor = isDark ? '#e0e0e0' : '#2b2d42';

        comparisonChart.options.plugins.title.color = textColor;
        comparisonChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        comparisonChart.options.scales.y.ticks.color = textColor;
        comparisonChart.options.scales.x.ticks.color = textColor;
        comparisonChart.update();
    }

// ========== FAVORITES SYSTEM ==========

// Load favorites from localStorage
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// Initialize favorites on page load
function initFavorites() {
    renderFavoritesList();

    // Set up star toggle click handler
    const favoriteToggle = document.getElementById('favorite-toggle');
    if (favoriteToggle) {
        favoriteToggle.addEventListener('click', toggleFavorite);
    }
}

// Toggle favorite for current city
function toggleFavorite(e) {
    e.stopPropagation();
    const cityName = document.getElementById('city-name').textContent.replace(/[\s\u2605\u2606]/g, '').trim();
    const star = document.getElementById('favorite-toggle');

    if (!cityName || cityName === 'City Name') return;

    const index = favorites.indexOf(cityName);
    if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        star.classList.remove('fas', 'active');
        star.classList.add('far');
    } else {
        // Add to favorites
        favorites.push(cityName);
        star.classList.remove('far');
        star.classList.add('fas', 'active');
    }

    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    renderFavoritesList();
}

// Update star icon based on current city
function updateFavoriteStar(cityName) {
    const star = document.getElementById('favorite-toggle');
    if (!star) return;

    if (favorites.includes(cityName)) {
        star.classList.remove('far');
        star.classList.add('fas', 'active');
    } else {
        star.classList.remove('fas', 'active');
        star.classList.add('far');
    }
}

// Render favorites list in sidebar
function renderFavoritesList() {
    const favoritesList = document.getElementById('favorites-list');
    const noFavorites = document.getElementById('no-favorites');

    if (!favoritesList) return;

    // Clear existing buttons (keep the no-favorites message)
    favoritesList.querySelectorAll('.favorite-btn').forEach(btn => btn.remove());

    if (favorites.length === 0) {
        noFavorites.style.display = 'block';
    } else {
        noFavorites.style.display = 'none';

        favorites.forEach(city => {
            const btn = document.createElement('button');
            btn.className = 'favorite-btn';
            btn.innerHTML = `<i class="fas fa-star"></i> ${city} <span class="remove-fav"><i class="fas fa-times"></i></span>`;

            // Click to predict
            btn.addEventListener('click', (e) => {
                if (e.target.closest('.remove-fav')) {
                    // Remove from favorites
                    favorites = favorites.filter(f => f !== city);
                    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
                    renderFavoritesList();
                    updateFavoriteStar(document.getElementById('city-name').textContent.replace(/[\s\u2605\u2606]/g, '').trim());
                } else {
                    // Select city and trigger prediction
                    const citySelect = document.getElementById('city');
                    if (citySelect) {
                        citySelect.value = city;
                        document.getElementById('predict-form').dispatchEvent(new Event('submit'));
                    }
                }
            });

            favoritesList.appendChild(btn);
        });
    }
}

// Initialize on DOM load
initFavorites();



    // ========== HISTORY SYSTEM ==========
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeHistory = document.getElementById('close-history');

    if (historyBtn) {
        historyBtn.addEventListener('click', async () => {
            historyModal.style.display = 'flex';
            await loadHistory();
        });
    }

    if (closeHistory) {
        closeHistory.addEventListener('click', () => {
            historyModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });

    async function loadHistory() {
        try {
            const response = await fetch('/history');
            const data = await response.json();
            renderHistoryStats(data.stats);
            renderHistoryTable(data.history);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    function renderHistoryStats(stats) {
        const statsContainer = document.getElementById('history-stats');
        statsContainer.innerHTML = `
            <div class="stat-box">
                <div class="stat-value">${stats.total_predictions}</div>
                <div class="stat-label">Total Predictions</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.avg_error}°</div>
                <div class="stat-label">Avg Error</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.min_error}°</div>
                <div class="stat-label">Best Accuracy</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.cities_predicted}</div>
                <div class="stat-label">Cities</div>
            </div>
        `;
    }

    function renderHistoryTable(history) {
        const tableBody = document.getElementById('history-table-body');
        
        if (history.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No predictions yet. Start predicting to see history!</td></tr>';
            return;
        }
        
        tableBody.innerHTML = history.map(item => {
            const date = new Date(item.timestamp);
            const timeStr = date.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const errorColor = item.error < 1 ? 'var(--success-color)' : item.error < 2 ? '#ffd700' : '#ff6b6b';
            
            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.75rem; font-weight: 600;">${item.city}</td>
                    <td style="padding: 0.75rem; text-align: right;">${item.actual_temp.toFixed(1)}°C</td>
                    <td style="padding: 0.75rem; text-align: right; color: var(--primary-color);">${item.predicted_temp.toFixed(1)}°C</td>
                    <td style="padding: 0.75rem; text-align: right; color: ${errorColor};">${item.error.toFixed(2)}°</td>
                    <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">${timeStr}</td>
                </tr>
            `;
        }).join('');
    }



    // ========== WEATHER ALERTS SYSTEM ==========
    function checkWeatherAlerts(data) {
        const alerts = [];
        const cityData = data.city_data;
        
        // Heat Alert (>40°C)
        if (cityData.temp > 40) {
            alerts.push({
                type: 'heat',
                icon: 'fa-temperature-high',
                message: `Heat Warning: Temperature is ${cityData.temp.toFixed(1)}°C - Stay hydrated!`
            });
        }
        
        // Cold Alert (<10°C)
        if (cityData.temp < 10) {
            alerts.push({
                type: 'cold',
                icon: 'fa-snowflake',
                message: `Cold Alert: Temperature is ${cityData.temp.toFixed(1)}°C - Dress warmly!`
            });
        }
        
        // Wind Alert (>15 m/s)
        if (cityData.wind_speed > 15) {
            alerts.push({
                type: 'wind',
                icon: 'fa-wind',
                message: `Strong Wind Warning: ${cityData.wind_speed} m/s - Avoid outdoor activities!`
            });
        }
        
        // Visibility Alert (<1000m)
        if (cityData.visibility < 1000) {
            alerts.push({
                type: 'visibility',
                icon: 'fa-eye-slash',
                message: `Low Visibility: ${cityData.visibility}m - Drive carefully!`
            });
        }
        
        // AQI Alert (>150)
        if (cityData.aqi > 150) {
            alerts.push({
                type: 'aqi',
                icon: 'fa-lungs',
                message: `Poor Air Quality (AQI: ${cityData.aqi}) - Avoid outdoor exposure!`
            });
        }
        
        return alerts;
    }
    
    function renderAlerts(alerts) {
        let alertsContainer = document.getElementById('weather-alerts');
        
        // Create container if it doesn't exist
        if (!alertsContainer) {
            alertsContainer = document.createElement('div');
            alertsContainer.id = 'weather-alerts';
            alertsContainer.className = 'weather-alerts';
            const resultSection = document.getElementById('result-section');
            resultSection.insertBefore(alertsContainer, resultSection.firstChild);
        }
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = '';
            return;
        }
        
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-banner alert-${alert.type}">
                <i class="fas ${alert.icon}"></i>
                <span>${alert.message}</span>
            </div>
        `).join('');
    }



    // ========== CUSTOM CITY SEARCH ==========
    const citySelect = document.getElementById('city');
    const customCityInput = document.getElementById('custom-city-input');
    
    if (citySelect && customCityInput) {
        citySelect.addEventListener('change', () => {
            if (citySelect.value === 'custom') {
                customCityInput.style.display = 'block';
                customCityInput.focus();
                customCityInput.required = true;
            } else {
                customCityInput.style.display = 'none';
                customCityInput.value = '';
                customCityInput.required = false;
            }
        });
    }

    // ========== EXPORT TO CSV ==========
    function exportHistoryToCSV() {
        fetch('/history')
            .then(res => res.json())
            .then(data => {
                if (data.history.length === 0) {
                    alert('No prediction history to export!');
                    return;
                }
                
                const headers = ['City', 'Actual Temp (°C)', 'Predicted Temp (°C)', 'Error (°C)', 'Model', 'Timestamp'];
                const rows = data.history.map(item => [
                    item.city,
                    item.actual_temp.toFixed(1),
                    item.predicted_temp.toFixed(1),
                    item.error.toFixed(2),
                    item.model_used.toUpperCase(),
                    item.timestamp
                ]);
                
                let csv = headers.join(',') + '\n';
                rows.forEach(row => {
                    csv += row.join(',') + '\n';
                });
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'weather_predictions.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            })
            .catch(err => {
                console.error('Error exporting:', err);
                alert('Failed to export history');
            });
    }

});