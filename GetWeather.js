const axios = require("axios");
const fs = require("fs");

class GetWeather {
    constructor(apiKey, stationId) {
        this.apiKey = apiKey;
        this.stationId = stationId;
        this.apiUrl = `https://swd.weatherflow.com/swd/rest/better_forecast?station_id=${this.stationId}&units_temp=f&units_wind=mph&units_pressure=mb&units_precip=in&units_distance=mi&api_key=${this.apiKey}`;
        this.headers = { "Accept": "application/json" };
    }

    async fetchData() {
        try {
            const tempest = await axios.get(this.apiUrl, { headers: this.headers }); 
            const tempestData = tempest.data;

            const weatherData = {
                time: tempestData.current_conditions.time,
                chance_rain: tempestData.current_conditions.precip_probability,
                humidity: tempestData.current_conditions.relative_humidity,
                wind: {
                    speed: tempestData.current_conditions.wind_avg,
                    direction: tempestData.current_conditions.wind_direction,
                    cardinal_direction: tempestData.current_conditions.wind_direction_cardinal,
                    gust: tempestData.current_conditions.wind_gust
                }
            };

            try {
                fs.writeFileSync("weatherData.json", JSON.stringify(weatherData, null, 2));
                console.log("Data successfully saved to weatherData.json");
            } catch (error) {
                console.error("Error saving data:", error.message);
            }
        } catch (error) {
            console.error("Error fetching API data:", error.message);
        }
    }

    displayData() {
        fs.readFile('weatherData.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return;
            }

            try {
                const weatherData = JSON.parse(data);
                const timeStamp = weatherData.time;
                const date = new Date(timeStamp * 1000);
                const time = date.toLocaleString('en-US', { timeZone: 'America/New_York' });

                console.log(`Current Weather (${time}):`);
                console.log(`Chance Rain: ${weatherData.chance_rain}%`);
                console.log(`Humidity: ${weatherData.humidity}%`);
                console.log(`Wind Speed: ${weatherData.wind.speed} mph`);
                console.log(`Wind Direction: ${weatherData.wind.direction}° (${weatherData.wind.cardinal_direction})`);
                console.log(`Wind Gust: ${weatherData.wind.gust} mph`);
                console.log(`Wind Gust: ${weatherData.wind.gust} mph`);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
            }
        });
    }
}

module.exports = GetWeather;