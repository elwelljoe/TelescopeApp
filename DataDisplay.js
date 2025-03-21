const GetWeather = require('./GetWeather');

const weather = new GetWeather('ddeff33f-5d93-4446-b2c1-b22c3b3ad73f', '150341');

async function dataDisplay() {
    try {
        await weather.fetchData();
        weather.displayData();
    } 
    catch (error) {
        console.error("Error in fetching or displaying weather data:", error);
    }
}

dataDisplay();