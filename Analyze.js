const GetWeather = require('./GetWeather');
const DataHandling = require('./DataHandling');
const DataAnalysis = require('./DataAnalysis');

//This uses the College of Aviation Tempest Station
const weather = new GetWeather('ddeff33f-5d93-4446-b2c1-b22c3b3ad73f', '150341');
const data = new DataHandling(weather, 60);
const timeInterval = 60; //Time interval in seconds
const rainRed = 50;
const rainYellow = 20;
const humidityRed = 0.5;
const humidityYellow = 0.25;
const pressureRed = 990;
const pressureYellow = 1000;

async function initializeArray(){
    await data.initArray();
    //Saves initial information to array JSON
    await data.exportData();
}

async function updateArray() {
    //Adds new weather data to the array
    await data.addArray();
    //Saves information to the array JSON
    await data.exportData();
}

async function setArray(){
    for (let i = 0; i < 10; i++) {
        if(!(data.isInitialized())){
            await initializeArray();
        }
        else{
            await updateArray(); // Waits for each update to finish
        }
        await new Promise(resolve => setTimeout(resolve, timeInterval * 1000)); // Waits before next
    }
}

async function analyze(){
    await setArray();

    const analysis = new DataAnalysis(data, rainYellow, rainRed, humidityYellow, humidityRed, pressureYellow, pressureRed);

    await analysis.checkUsability();
    console.log("Usability: " + analysis.getUsability());
    console.log("Rain Chance: " + analysis.getCurrentWeather().chance_rain);
    console.log("Humidity Slope: " + analysis.getHumiditySlope());
    console.log("Pressure: " + analysis.getCurrentWeather().pressure.sea_level);
}

analyze();