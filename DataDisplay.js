//This is a test program to test the GetWeather Class.

const GetWeather = require('./GetWeather');

//This uses the College of Aviation Tempest Station
const weather = new GetWeather('ddeff33f-5d93-4446-b2c1-b22c3b3ad73f', '150341');

async function dataDisplay() {
    try {
        //Takes Data from the API
        await weather.fetchData();
        //Displays Data in console
        weather.displayData();
    } 
    catch (error) {
        console.error("Error in fetching or displaying weather data:", error);
    }
}

dataDisplay();