//Class used to analyze data from DataHanding according to the config file

const GetWeather = require('./GetWeather');
const DataHandling = require('./DataHandling');
const Configure = require('./Configure');

class DataAnalysis {
    constructor(data, config) {
        //Checks if data is initialized and sets the values if it is
        if (!data.isInitialized()) {
            throw new Error("Data Array is not initialized.");
        }
        this.data = data;
        this.currentWeather = data.getArrayPos(0);

        //Used to see if the data was analyzed
        this.checked = false;

        //Checks if config is available and sets value if it is
        if (!config || !config.getConfig()) {
            throw new Error("Config is not initialized properly.");
        }
        this.config = config;

        //Formats usability data, everything is set to nothing before analysis
        this.usability = {
            humidity: { usability: 0, slope: 0, trend: 'unknown' },
            pressure: { usability: 0, slope: 0, trend: 'unknown' },
            temperature: { usability: 0, difference: 0 },
            rain: { usability: 0 },
            wind: { usability: 0 }
        };
    }

    //Calculates the slope of the humidity vs time for the last 'n' values
    //'n' specified in config
    calculateHumiditySlope() {
        if (this.data.arrayLength() === 1) {
            this.usability.humidity.slope = 0;
            return;
        }

        //gets the n value from the config
        const cfg = this.config.getConfig();
        let n = cfg.humidity.n;
        let sumHumidity = 0;
        let sumTime = 0;
        let numerator = 0;
        let denominator = 0;

        //Calculates the average humidity and time
        if (n >= this.data.arrayLength()) {
            n = this.data.arrayLength();
        }

        for (let i = 0; i < n; i++) {
            sumHumidity += this.data.getArrayPos(i).humidity;
            sumTime += i;
        }
        const avgHumidity = sumHumidity / n;
        const avgTime = sumTime / n;

        //Calculates the numerator and denominator of the slope
        for (let i = 0; i < n; i++) {
            const timeDiff = i - avgTime;
            const humidityDiff = this.data.getArrayPos(i).humidity - avgHumidity;

            numerator += timeDiff * humidityDiff;
            denominator += timeDiff ** 2;
        }

        //Calculates the slope
        this.usability.humidity.slope = parseFloat((numerator / denominator).toFixed(4));

        //Determines the trend based on the value for yellow
        if (this.usability.humidity.slope > cfg.humidity.yellow) {
            this.usability.humidity.trend = 'rising';
        }
        else if (this.usability.humidity.slope < -cfg.humidity.yellow) {
            this.usability.humidity.trend = 'falling';
        }
        else {
            this.usability.humidity.trend = 'steady';
        }
    }

    //Calculates the slope of the pressure vs time of the past 'n' terms
    //'n' value from the config file
    calculatePressureSlope() {
        if (this.data.arrayLength() === 1) {
            this.usability.pressure.slope = 0;
            return;
        }

        //Gets the 'n' value from the config
        const cfg = this.config.getConfig();
        let n = cfg.pressure.n;
        let sumPressure = 0;
        let sumTime = 0;
        let numerator = 0;
        let denominator = 0;

        //Makes sure there are enough values in the array and corrects if not
        if (n >= this.data.arrayLength()) {
            n = this.data.arrayLength();
        }

        //Calculates average time and pressure
        for (let i = 0; i < n; i++) {
            sumPressure += this.data.getArrayPos(i).pressure.sea_level;
            sumTime += i;
        }
        const avgPressure = sumPressure / n;
        const avgTime = sumTime / n;

        //Calculates numerator and denominator of slope
        for (let i = 0; i < n; i++) {
            const timeDiff = i - avgTime;
            const pressureDiff = this.data.getArrayPos(i).pressure.sea_level - avgPressure;

            numerator += timeDiff * pressureDiff;
            denominator += timeDiff ** 2;
        }

        //Calculates slope
        this.usability.pressure.slope = parseFloat((numerator / denominator).toFixed(4));
        //Determines pressure trend from the API data
        this.usability.pressure.trend = this.data.getArrayPos(0).pressure.trend;
    }

    //Calculates difference between current temperature and dew point
    calculateTempRange() {
        this.usability.temperature.difference = Math.abs(
            this.currentWeather.temperature.current - this.currentWeather.temperature.dew_point
        );
    }

    //Returns the current weather information
    getCurrentWeather() {
        return this.currentWeather;
    }

    //Checks if humidity slope exceeds yellow or red values
    async checkHumidity() {
        await this.calculateHumiditySlope();

        const cfg = this.config.getConfig().humidity;
        const slope = this.usability.humidity.slope;

        if (slope >= cfg.red) {
            this.usability.humidity.usability = 0;
        } else if (slope >= cfg.yellow) {
            this.usability.humidity.usability = 1;
        } else {
            this.usability.humidity.usability = 2;
        }
    }

    //Checks if pressure slope exceeds yellow or red values
    async checkPressure() {
        await this.calculatePressureSlope();

        const cfg = this.config.getConfig().pressure;
        const slope = this.usability.pressure.slope;

        if (slope <= cfg.red) {
            this.usability.pressure.usability = 0;
        } else if (slope <= cfg.yellow) {
            this.usability.pressure.usability = 1;
        } else {
            this.usability.pressure.usability = 2;
        }
    }

    //Checks if rain chance exceeds yellow or red values
    checkRain() {
        const rain = this.currentWeather.chance_rain;
        const cfg = this.config.getConfig().rain;

        if (rain >= cfg.red) {
            this.usability.rain.usability = 0;
        } else if (rain >= cfg.yellow) {
            this.usability.rain.usability = 1;
        } else {
            this.usability.rain.usability = 2;
        }
    }

    //Checks if wind speed exceeds yellow or red values
    checkWind() {
        const wind = this.currentWeather.wind.speed;
        const cfg = this.config.getConfig().wind;

        if (wind >= cfg.red) {
            this.usability.wind.usability = 0;
        } else if (wind >= cfg.yellow) {
            this.usability.wind.usability = 1;
        } else {
            this.usability.wind.usability = 2;
        }
    }

    //Checks if temperature difference exceeds yellow or red values
    async checkTemp() {
        await this.calculateTempRange();

        const diff = this.usability.temperature.difference;
        const cfg = this.config.getConfig().temperature;

        if (diff <= cfg.red) {
            this.usability.temperature.usability = 0;
        } else if (diff <= cfg.yellow) {
            this.usability.temperature.usability = 1;
        } else {
            this.usability.temperature.usability = 2;
        }
    }

    //Checks all conditions and marks that the analysis was done
    async checkUsability() {
        await this.checkHumidity();
        await this.checkPressure();
        this.checkRain();
        await this.checkTemp();
        this.checkWind();

        this.checked = true;
    }

    //Makes sure that the data was checked
    async getUsability() {
        if (!this.checked) {
            await this.checkUsability();
        }
        return this.usability;
    }

    //Changes from metric to imperial and vice versa, the config, array, and API URL will be updated
    async changeUnits() {
        await this.data.changeUnits();
        await this.checkUsability();
    }
}

module.exports = DataAnalysis;