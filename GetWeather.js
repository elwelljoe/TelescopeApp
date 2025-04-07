//This class is used to get Weather Information from a Tempest station and save the needed information
//and sort out the unnecessary information

const axios = require("axios");
const fs = require("fs");

class GetWeather {
    constructor(apiKey, stationId) {
        this.apiKey = apiKey; //API key of tempest unit
        this.stationId = stationId; //Station ID of tempest unit
        this.apiUrl = `https://swd.weatherflow.com/swd/rest/better_forecast?station_id=${this.stationId}&units_temp=f&units_wind=mph&units_pressure=mb&units_precip=in&units_distance=mi&api_key=${this.apiKey}`;
        this.headers = { "Accept": "application/json" };
        this.weatherData;
    }

    async fetchData() {
        try {
            const tempest = await axios.get(this.apiUrl, { headers: this.headers }); 
            const tempestData = tempest.data;

            //Sorts out unneccessary data from Tempest Station and saves needed information
            this.weatherData = {
                time: tempestData.current_conditions.time,
                temperature: tempestData.current_conditions.air_temperature,
                dew_point: tempestData.current_conditions.dew_point,
                chance_rain: tempestData.current_conditions.precip_probability,
                humidity: tempestData.current_conditions.relative_humidity,
                wind: {
                    speed: tempestData.current_conditions.wind_avg,
                    direction: tempestData.current_conditions.wind_direction,
                    cardinal_direction: tempestData.current_conditions.wind_direction_cardinal,
                    gust: tempestData.current_conditions.wind_gust
                },
                pressure: {
                    sea_level: tempestData.current_conditions.sea_level_pressure,
                    trend: tempestData.current_conditions.pressure_trend
                }
            };

            //Saves data to a JSON file (used to easily see format)
            fs.writeFileSync("weatherData.json", JSON.stringify(this.weatherData, null, 2));
            console.log("Weather data updated and saved.");

            //Saves information to the class variable.
            return this.weatherData;
        } catch (error) {
            console.error("Error fetching API data:", error.message);
        }
    }

    //Returns found data
    getData(){
        return this.weatherData;
    }

    //Function used for testing purposes, displays found Weather Data in easy to read format
    displayData(weatherData = this.weatherData) {
        //Checks if Data is available
        if (!weatherData) {
            console.log("No weather data available.");
            return;
        }

        //Displays available Data
        const date = new Date(weatherData.time * 1000);
        const time = date.toLocaleString('en-US', { timeZone: 'America/New_York' });

        console.log(`Current Weather (${time}):`);
        console.log(`Temperature: ${weatherData.temperature} °F`);
        console.log(`Dew Point: ${weatherData.dew_point} °F`);
        console.log(`Chance Rain: ${weatherData.chance_rain}%`);
        console.log(`Humidity: ${weatherData.humidity}%`);
        console.log(`Wind Speed: ${weatherData.wind.speed} mph`);
        console.log(`Wind Direction: ${weatherData.wind.direction}° (${weatherData.wind.cardinal_direction})`);
        console.log(`Wind Gust: ${weatherData.wind.gust} mph`);
        console.log(`Pressure: ${weatherData.pressure.sea_level} mb`);
        console.log(`Pressure Trend: ${weatherData.pressure.trend}`);
    }
}

module.exports = GetWeather;