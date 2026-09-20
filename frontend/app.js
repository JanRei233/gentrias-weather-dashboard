// Initialize the map, centered on General Trias, Cavite
const map = L.map('map').setView([14.3853, 120.8805], 13);

// Add OpenStreetMap base tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Paths relative to index.html (Works both on localhost and S3 Static Website Hosting)
const WEATHER_DATA_URL = './weather.json';
const FLOOD_GEOJSON_URL = './data/flood-zones.geojson';

// 1. Fetch and Display Daily Weather Data
async function fetchWeather() {
    const weatherDiv = document.getElementById('weather-data');
    const updateDiv = document.getElementById('last-updated');

    try {
        const response = await fetch(WEATHER_DATA_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // Handle Open-Meteo / Lambda data structure
        const temp = data.current_weather?.temperature ?? 'N/A';
        const wind = data.current_weather?.windspeed ?? 'N/A';
        
        weatherDiv.innerHTML = `
            <div class="weather-row"><span>Temp:</span> <strong>${temp}°C</strong></div>
            <div class="weather-row"><span>Wind:</span> <strong>${wind} km/h</strong></div>
        `;
        
        if (data.last_updated) {
            const date = new Date(data.last_updated);
            updateDiv.innerText = `Updated: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            updateDiv.innerText = 'Updated: Recently';
        }
        
    } catch (error) {
        console.error("Error fetching weather:", error);
        weatherDiv.innerHTML = "<p>Data unavailable.</p>";
        updateDiv.innerText = "Check connection";
    }
}

// 2. Fetch and Render the Flood Hazard GeoJSON
async function loadFloodMap() {
    try {
        const response = await fetch(FLOOD_GEOJSON_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const geojsonData = await response.json();
        
        L.geoJSON(geojsonData, {
            style: function () {
                return {
                    color: '#d32f2f',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.35,
                    fillColor: '#ef5350'
                };
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.hazard_level) {
                    layer.bindPopup(`<strong>Hazard Level:</strong> ${feature.properties.hazard_level}<br><strong>Area:</strong> Cañas River Basin`);
                }
            }
        }).addTo(map);
    } catch (error) {
        console.error("Error loading flood map:", error);
    }
}

// Initialize application
fetchWeather();
loadFloodMap();