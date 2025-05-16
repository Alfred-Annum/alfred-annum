 
  // Weather Dashboard Configuration
const config = {
    openWeatherMapKey: '667612781ee846fb68ccf9369f556995', // Get from https://openweathermap.org/api
    mapboxAccessToken: 'pk.eyJ1IjoiYWxmcmVkLWFubnVtIiwiYSI6ImNtYW84c3pkeDA0Y2kya3NsY2I0dm92bmkifQ.qKc8coIpGkabZm7Od3zOgg',    // Get from https://account.mapbox.com/
    defaultLocation: { lat: 40.7128, lng: -74.0060 }  // Default to New York
};

// DOM Elements
const elements = {
    cityName: document.getElementById('city-name'),
    currentDate: document.getElementById('current-date'),
    weatherIcon: document.getElementById('weather-icon'),
    currentTemp: document.getElementById('current-temp'),
    weatherDesc: document.getElementById('weather-desc'),
    feelsLike: document.getElementById('feels-like'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    pressure: document.getElementById('pressure'),
    forecastDays: document.getElementById('forecast-days'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    unitBtns: document.querySelectorAll('.unit-btn')
};

// Global Variables
let map;
let currentUnit = 'metric';
let markers = [];

// Initialize the Dashboard
function initDashboard() {
    initMap();
    setupEventListeners();
    getWeatherByCoords(config.defaultLocation.lat, config.defaultLocation.lng);
}

// Initialize Leaflet Map
function initMap() {
    map = L.map('map').setView([config.defaultLocation.lat, config.defaultLocation.lng], 10);
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        // attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 20,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: config.mapboxAccessToken
    }).addTo(map);

    // Add click event to map
    map.on('click', function(e) {
        getWeatherByCoords(e.latlng.lat, e.latlng.lng);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    elements.searchBtn.addEventListener('click', searchWeather);
    elements.searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchWeather();
    });

    elements.unitBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            elements.unitBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentUnit = this.dataset.unit;
            // Re-fetch weather with new units
            const activeMarker = markers.find(m => m.active);
            if (activeMarker) {
                getWeatherByCoords(activeMarker.lat, activeMarker.lng);
            }
        });
    });
}

// Search Weather by City Name
function searchWeather() {
    const city = elements.searchInput.value.trim();
    if (!city) return;

    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${config.openWeatherMapKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                getWeatherByCoords(data[0].lat, data[0].lon);
            } else {
                alert('City not found');
            }
        })
        .catch(error => {
            console.error('Error fetching location:', error);
            alert('Error searching for city');
        });
}

// Get Weather Data by Coordinates
function getWeatherByCoords(lat, lng) {
    // Clear previous markers
    clearMarkers();
    
    // Add new marker
    const marker = L.marker([lat, lng]).addTo(map)
        .bindPopup('Loading weather...')
        .openPopup();
    
    markers.push({ marker, lat, lng, active: true });
    map.setView([lat, lng], 10);

    // Fetch current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=${currentUnit}&appid=${config.openWeatherMapKey}`)
        .then(response => response.json())
        .then(data => {
            updateCurrentWeather(data);
            marker.setPopupContent(`<b>${data.name}</b><br>${Math.round(data.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}<br>${data.weather[0].description}`);
        })
        .catch(error => console.error('Error fetching current weather:', error));

    // Fetch forecast
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=${currentUnit}&appid=${config.openWeatherMapKey}`)
        .then(response => response.json())
        .then(data => updateForecast(data))
        .catch(error => console.error('Error fetching forecast:', error));
}

// Update Current Weather Display
function updateCurrentWeather(data) {
    elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
    elements.currentDate.textContent = moment().format('dddd, MMMM Do YYYY');
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    elements.weatherIcon.alt = data.weather[0].description;
    elements.currentTemp.textContent = `${Math.round(data.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
    elements.weatherDesc.textContent = data.weather[0].description;
    elements.feelsLike.textContent = `Feels like: ${Math.round(data.main.feels_like)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
    elements.humidity.textContent = `Humidity: ${data.main.humidity}%`;
    elements.windSpeed.textContent = `Wind: ${currentUnit === 'metric' ? `${Math.round(data.wind.speed * 3.6)} km/h` : `${Math.round(data.wind.speed)} mph`}`;
    elements.pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
}

// Update Forecast Display
function updateForecast(data) {
    elements.forecastDays.innerHTML = '';
    
    // Group by day (API returns data every 3 hours)
    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = moment(item.dt_txt).format('YYYY-MM-DD');
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });

    // Display next 5 days
    Object.values(dailyForecasts).slice(0, 5).forEach(day => {
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="forecast-date">${moment(day.dt_txt).format('ddd')}</div>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" class="weather-icon">
            <div class="forecast-temp">
                <span class="max-temp">${Math.round(day.main.temp_max)}°</span>
                <span class="min-temp">${Math.round(day.main.temp_min)}°</span>
            </div>
            <div class="forecast-desc">${day.weather[0].main}</div>
        `;
        elements.forecastDays.appendChild(forecastDay);
    });
}

// Clear all markers from map
function clearMarkers() {
    markers.forEach(m => {
        map.removeLayer(m.marker);
    });
    markers = [];
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);