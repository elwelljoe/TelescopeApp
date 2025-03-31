////This is a test program to test the DataHandling Class.

const GetWeather = require('./GetWeather');
const DataHandling = require('./DataHandling');

//This uses the College of Aviation Tempest Station
const weather = new GetWeather('ddeff33f-5d93-4446-b2c1-b22c3b3ad73f', '150341');
const data = new DataHandling(weather);
const timeInterval = 60; //Time interval in seconds
//NOTE: timeInterval values less than 60 will not be useful, the API only updates information called
//once per minute, It is only in seconds for testing purposes

//Initializes a the Weather data array
async function initializeArray(){
    await data.initArray();
    //Saves initial information to array JSON
    await data.exportData();
    //Prints initial data to the console
    console.log("Array Length: " + data.arrayLength());
    console.log(data.dataArray(0));
    console.log();
}

async function updateArray() {
    //Adds new weather data to the array
    await data.addArray();
    //Saves information to the array JSON
    await data.exportData();
    //Prints the first value of the array to the console (Current conditions)
    console.log("Array Length: " + data.arrayLength());
    console.log(data.dataArray(0));
    console.log();
}

initializeArray();
//Will add a new value to the array every timeInterval seconds
const intervalId = setInterval(updateArray, timeInterval*1000);