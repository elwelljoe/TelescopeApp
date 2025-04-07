const GetWeather = require('./GetWeather');
const DataHandling = require('./DataHandling');

class DataAnalysis{
    constructor(data, rainYellow, rainRed, humidityYellow, humidityRed, pressureYellow, pressureRed){
        if(data.isInitialized()){
            this.data = data;
            this.currentWeather = data.getArrayPos(0);
        }
        //Range for chance of rain
        this.rainYellow = rainYellow;
        this.rainRed = rainRed;
        //Range for humidity slope
        this.humidityYellow = humidityYellow;
        this.humidityRed = humidityRed;
        //Range for pressure
        this.pressureYellow = pressureYellow;
        this.pressureRed = pressureRed;

        this.humiditySlope;

        this.usability; //Number value (2, 1, 0)
        this.usable; //String value (Green, Yellow, Red)
    }

    //The slope of the trendline of the humidity data points
    calculateHumiditySlope() {
        //if theres only one datapoint the slope will be zero
        if (this.data.arrayLength() === 1) {
            this.humiditySlope = 0;
            return;
        }
    
        let sumHumidity = 0;   
        let sumTime = 0;
        let numerator = 0;
        let denominator = 0;
    
        const n = this.data.arrayLength();
    
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
    
        this.humiditySlope = parseFloat((numerator / denominator).toFixed(4));
    }

    //Returns the humidity slope if available
    getHumiditySlope(){
        if(this.humiditySlope==null){
            return;
        }
        return this.humiditySlope;
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

        if(this.getHumiditySlope>=this.humidityRed){
            return 0;
        }
        if(this.getHumiditySlope>=this.humidityYellow){
            return 1
        }
        return 2;
    }

    //Checks if chance of rain is in range of green, yellow, or red
    checkRain(){
        const rain = this.currentWeather.chance_rain;

        if(rain>=this.rainRed){
            return 0;
        }
        if(rain>=this.rainYellow){
            return 1
        }
        return 2;        
    }

    //Checks if pressure is in range of green, yellow, or red
    checkPressure(){
        const pressure = this.currentWeather.pressure.sea_level;

        if(pressure>=this.pressureRed){
            return 0;
        }
        if(pressure>=this.pressureYellow){
            return 1
        }
        return 2;
    }

    //Check the usability of the telescope
    async checkUsability(){
        const humidity = this.checkHumidity();
        const rain = this.checkRain();
        const pressure = this.checkPressure();

        //Not finished, figure out how to analyze everything accurately given the information
        this.usability = rain;

        //Assigns the usability to a value green, yellow, or red
        switch(this.usability){
            case 0:
                this.usable = `Red`;
                return;
            case 1:
                this.usable = `Yellow`;
                return;
            case 2:
                this.usable = `Green`;
                return;
        }
    }
    
    //Returns green, yellow, or red if usability is available.
    getUsability(){
        if(usability == null){
            return;
        }
        return this.usable;
    }
}

module.exports = DataAnalysis;