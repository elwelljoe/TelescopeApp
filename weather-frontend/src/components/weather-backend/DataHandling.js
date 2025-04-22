//This class is used to create an array of weather data to be used in the analysis.

const fs = require('fs');
const GetWeather = require('./GetWeather');

class DataHandling{
    constructor(weather, maxSize){
        this.weather = weather;
        this.weatherArray = [];
        this.maxSize = maxSize; //The number of past data calls to be saved for data analysis purposes.
        this.initialized = false;
    }

    //Checks to see if the array has been initialized
    isInitialized(){
        return this.initialized;
    }

    //Initializes the Array with weather data.
    async initArray(){
        try {
            await this.weather.fetchData();
            this.weatherArray[0] = this.weather.getData();
            this.initialized = true;
        } 
        catch (error) {
            console.error("Error in fetching or displaying weather data:", error);
        }
    }

    //Adds new weather data to the array
    async addArray() {
        if(this.initialized == false){
            console.log("Please initialize the Array");
            return;
        }
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

    //Should only return numbers below maxSize
    arrayLength(){
        return this.weatherArray.length;
    }

    //Returns the entire Array
    getArray(){
        return this.weatherArray;
    }

    //Returns the information at a position in the array
    getArrayPos(pos){
        return this.weatherArray[pos];
    }

    //True if metric, false if imperial
    isMetric(){
        return this.weather.isMetric();
    }

    //Changes the past weather data and config
    async changeUnits() {
        if (this.weather.isMetric()) {
            console.log("This is metric:" + this.weather.isMetric());
            await this.weather.changeUnits();
            for (let i = 0; i < this.weatherArray.length; i++) {
                this.weatherArray[i].temperature.current = Math.round((1.8 * this.weatherArray[i].temperature.current) + 32);
                this.weatherArray[i].temperature.dew_point = Math.round((1.8 * this.weatherArray[i].temperature.dew_point) + 32);
                this.weatherArray[i].wind.speed = Math.round(2.23694 * this.weatherArray[i].wind.speed);
                this.weatherArray[i].wind.gust = Math.round(2.23694 * this.weatherArray[i].wind.gust);
                this.weatherArray[i].pressure.sea_level = Math.round(this.weatherArray[i].pressure.sea_level / 33.864);
            }
        } else {
            console.log("This is metric:" + this.weather.isMetric());
            await this.weather.changeUnits();
            for (let i = 0; i < this.weatherArray.length; i++) {
                this.weatherArray[i].temperature.current = Math.round((this.weatherArray[i].temperature.current - 32) / 1.8);
                this.weatherArray[i].temperature.dew_point = Math.round((this.weatherArray[i].temperature.dew_point - 32) / 1.8);
                this.weatherArray[i].wind.speed = Math.round(this.weatherArray[i].wind.speed / 2.23694);
                this.weatherArray[i].wind.gust = Math.round(this.weatherArray[i].wind.gust / 2.23694);
                this.weatherArray[i].pressure.sea_level = Math.round(33.864 * this.weatherArray[i].pressure.sea_level);
            }
        }
    }    

    //Formats the weather at a certain position in the array and displays in console
    stringArray(pos) {
        //Checking to make sure the value does not exceed the number of values in the Array
        if ((pos >= 0 && pos < this.weatherArray.length) || this.initialized == false) {
            const weatherData = this.weatherArray[pos];
            if (weatherData) {
                //Displays available Data
                const date = new Date(weatherData.time * 1000);
                const time = date.toLocaleString('en-US', { timeZone: 'America/New_York' });

                if(this.weather.isMetric()){
                    console.log(`Current Weather (${time}):`);
                    console.log(`Temperature: ${weatherData.temperature.current} °C`);
                    console.log(`Dew Point: ${weatherData.temperature.dew_point} °C`);
                    console.log(`Conditions: ${weatherData.conditions}`);
                    console.log(`Chance Rain: ${weatherData.chance_rain}%`);
                    console.log(`Humidity: ${weatherData.humidity}%`);
                    console.log(`Wind Speed: ${weatherData.wind.speed} m/s`);
                    console.log(`Wind Direction: ${weatherData.wind.direction}° (${weatherData.wind.cardinal_direction})`);
                    console.log(`Wind Gust: ${weatherData.wind.gust} m/s`);
                    console.log(`Pressure: ${weatherData.pressure.sea_level} mb`);
                    console.log(`Pressure Trend: ${weatherData.pressure.trend}`);
                    return;
                }
                else{
                    console.log(`Current Weather (${time}):`);
                    console.log(`Temperature: ${weatherData.temperature.current} °F`);
                    console.log(`Dew Point: ${weatherData.temperature.dew_point} °F`);
                    console.log(`Conditions: ${weatherData.conditions}`);
                    console.log(`Chance Rain: ${weatherData.chance_rain}%`);
                    console.log(`Humidity: ${weatherData.humidity}%`);
                    console.log(`Wind Speed: ${weatherData.wind.speed} mph`);
                    console.log(`Wind Direction: ${weatherData.wind.direction}° (${weatherData.wind.cardinal_direction})`);
                    console.log(`Wind Gust: ${weatherData.wind.gust} mph`);
                    console.log(`Pressure: ${weatherData.pressure.sea_level} inHg`);
                    console.log(`Pressure Trend: ${weatherData.pressure.trend}`);
                    return;
                }
            }
        }
        return "Invalid index. No data available.";
    }

    //Exports the array to a JSON file
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