const GetWeather = require('./GetWeather');
const DataHandling = require('./DataHandling');
const Configure = require('./Configure');

class DataAnalysis{
    constructor(data, config){
        if(data.isInitialized()){
            this.data = data;
            this.currentWeather = data.getArrayPos(0);
        }

        //Check if the usability was found
        this.checked = false;
        
        //Gets the config data from the config (Ranges for Yellow and Red, and other settings)
        this.config = config.getConfig();

        this.usability = {
            humidity: {
                usability: 0,
                slope: 0, //slope of humidity over 'n' points (from config)
                trend: 'unknown' //general trend (increasing is bad)
            },
            pressure: {
                usability: 0,
                slope: 0, //slope of pressure over 'n' points (from config)
                trend: 'unknown' //general trend (decreasing is bad)
            },
            temperature: {
                usability: 0,
                difference: 0 //difference of dew point and temp (small values are bad)
            },
            rain: {
                usability: 0
            },
            wind: {
                usability: 0
            }
        }; 
    }

    //The slope of the trendline of the humidity data points
    calculateHumiditySlope() {
        //if theres only one datapoint the slope will be zero
        if (this.data.arrayLength() === 1) {
            this.usability.humidity.slope = 0;
            return;
        }
        
        let n = this.config.humidity.n;
        let sumHumidity = 0;   
        let sumTime = 0;
        let numerator = 0;
        let denominator = 0;

        if(n >= this.data.arrayLength()){
            n = this.data.arrayLength();
        }
    
        //Calculating the average of the points
        for (let i = 0; i < n; i++) {
            sumHumidity += this.data.getArrayPos(i).humidity;
            sumTime += i;
        }
        const avgHumidity = sumHumidity / n;
        const avgTime = sumTime / n;
    
        //Calculating the trendline slope
        for (let i = 0; i < n; i++) {
            const timeDiff = i - avgTime;
            const humidityDiff = this.data.getArrayPos(i).humidity - avgHumidity;
    
            numerator += timeDiff * humidityDiff;
            denominator += timeDiff ** 2;
        }
    
        this.usability.humidity.slope = parseFloat((numerator / denominator).toFixed(4));
    }

    //The slope of the trendline of the pressure data points
    calculatePressureSlope() {
        //if theres only one datapoint the slope will be zero
        if (this.data.arrayLength() === 1) {
            this.usability.pressure.slope = 0;
            return;
        }
    
        let n = this.config.pressure.n;
        let sumPressure = 0;   
        let sumTime = 0;
        let numerator = 0;
        let denominator = 0;

        if(n >= this.data.arrayLength()){
            n = this.data.arrayLength();
        }
    
        //Calculating the average of the points
        for (let i = 0; i < n; i++) {
            sumPressure += this.data.getArrayPos(i).pressure.sea_level;
            sumTime += i;
        }
        const avgPressure = sumPressure / n;
        const avgTime = sumTime / n;
    
        //Calculating the trendline slope
        for (let i = 0; i < n; i++) {
            const timeDiff = i - avgTime;
            const pressureDiff = this.data.getArrayPos(i).pressure.sea_level - avgPressure;
    
            numerator += timeDiff * pressureDiff;
            denominator += timeDiff ** 2;
        }
    
        this.usability.pressure.slope = parseFloat((numerator / denominator).toFixed(4));
    }

    calculateTempRange(){
        this.usability.temperature.difference = Math.abs(this.currentWeather.temperature.current - this.currentWeather.temperature.dew_point);
    }

    //Returns the current weather dataset if available
    getCurrentWeather(){
        if(this.currentWeather==null){
            return;
        }
        return this.currentWeather;
    }

    //Checks if humidity slope is in range of green, yellow, or red
    async checkHumidity(){
        await this.calculateHumiditySlope();

        if(this.usability.humidity.slope>=this.config.humidity.red){
            this.usability.humidity.usability = 0;
            return;
        }
        if(this.usability.humidity.slope>=this.config.humidity.yellow){
            this.usability.humidity.usability = 1;
            return;
        }
        this.usability.humidity.usability = 2;
}

    //Checks if pressure slope is in range of green, yellow, or red
    async checkPressure(){
        await this.calculatePressureSlope();

        if(this.usability.pressure.slope<=this.config.pressure.red){
            this.usability.pressure.usability = 0;
            return;
        }
        if(this.usability.pressure.slope<=this.config.pressure.yellow){
            this.usability.pressure.usability = 1;
            return;
        }
        this.usability.pressure.usability = 2;
}

    //Checks if chance of rain is in range of green, yellow, or red
    checkRain(){
        const rain = this.currentWeather.chance_rain;

        if(rain>=this.config.rain.red){
            this.usability.rain.usability = 0;
            return;
        }
        if(rain>=this.config.rain.yellow){
            this.usability.rain.usability =  1;
            return;
        }
        this.usability.rain.usability =  2;        
    }

    //Checks if wind speed is in range of green, yellow, or red
    checkWind(){
        const wind = this.currentWeather.wind.speed;

        if(wind>=this.config.wind.red){
            this.usability.wind.usability = 0;
            return;
        }
        if(wind>=this.config.wind.yellow){
            this.usability.wind.usability = 1;
            return;
        }
        this.usability.wind.usability =  2;        
    }

    //Checks if wind speed is in range of green, yellow, or red
    async checkTemp(){
        await this.calculateTempRange();

        if(this.usability.temperature.difference<=this.config.temperature.red){
            this.usability.temperature.usability = 0;
            return;
        }
        if(this.usability.temperature.difference<=this.config.temperature.yellow){
            this.usability.temperature.usability = 1;
            return;
        }
        this.usability.temperature.usability =  2;        
    }

    checkUsability(){
        this.checkHumidity();
        this.checkPressure();
        this.checkRain();
        this.checkTemp();
        this.checkWind();

        this.checked == true;
    }

    async getUsability(){
        if(!this.checked){
            await this.checkUsability();
        }
        return this.usability;
    }

    changeUnits(){
        
    }
}

module.exports = DataAnalysis;