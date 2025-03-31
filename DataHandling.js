const fs = require('fs');
const GetWeather = require('./GetWeather');

class DataHandling{
    constructor(weather){
        this.weather = weather;
        this.weatherArray = [];
        this.maxSize = 60; //The number of past data calls to be saved for data analysis purposes.
    }

    //Initializes the Array with weather data.
    async initArray(){
        try {
            await this.weather.fetchData();
            this.weatherArray[0] = this.weather.getData();
        } 
        catch (error) {
            console.error("Error in fetching or displaying weather data:", error);
        }
    }

    //Adds new weather data to the array
    async addArray() {
        try {
            const newWeatherData = await this.weather.fetchData();

            //Adds newest weather data to the front of the Array
            this.weatherArray.unshift(newWeatherData);

            //Removes oldest data from array if the maximum size is reached.
            if (this.weatherArray.length > this.maxSize) {
                this.weatherArray.pop();
            }
        } catch (error) {
            console.error("Error adding new weather data to array:", error);
        }
    }

    //Function used for testing purposes, Should only return numbers below maxSize
    arrayLength(){
        return this.weatherArray.length;
    }

    //Function used for testing purposes, Will display the Weather data at the position called
    dataArray(pos) {
        //Checking to make sure the value does not exceed the number of values in the Array
        if (pos >= 0 && pos < this.weatherArray.length) {
            const weatherData = this.weatherArray[pos];
            if (weatherData) {
                return this.formatWeatherData(weatherData); //Return formatted string
            }
        }
        return "Invalid index. No data available.";
    }
    
    //Function used for testing purposes, formats data in an easy to read format to be
    //displayed in the console for the dataArray function
    formatWeatherData(weatherData) {
        const date = new Date(weatherData.time * 1000);
        const time = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
    
        return `Current Weather (${time}):
    Temperature: ${weatherData.temperature} F
    Dew Point: ${weatherData.dew_point} F
    Chance Rain: ${weatherData.chance_rain}%
    Humidity: ${weatherData.humidity}%
    Wind Speed: ${weatherData.wind.speed} mph
    Wind Direction: ${weatherData.wind.direction}° (${weatherData.wind.cardinal_direction})
    Wind Gust: ${weatherData.wind.gust} mph
    Pressure: ${weatherData.pressure.sea_level} mb
    Pressure Trend: ${weatherData.pressure.trend}`;
    }

    //Exports the array to a JSON file, used for testing purposes to make sure values
    //are added and removed propperly
    exportData(filename = 'weatherArray.json') {
        try {
            fs.writeFileSync(filename, JSON.stringify(this.weatherArray, null, 2));
            console.log(`Weather data array updated and saved.`);
        } catch (error) {
            console.error("Error exporting data:", error);
        }
    }
}

module.exports = DataHandling;