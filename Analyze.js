const readline = require('readline');
const GetWeather = require('./GetWeather');
const DataHandling = require('./DataHandling');
const DataAnalysis = require('./DataAnalysis');
const Configure = require('./Configure');

//This uses the College of Aviation Tempest Station
const weather = new GetWeather('ddeff33f-5d93-4446-b2c1-b22c3b3ad73f', '150341');
const data = new DataHandling(weather, 60);
const config = new Configure('config.json')
const timeInterval = 5;

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

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
    for (let i = 0; i < 5; i++) {
        if(!(data.isInitialized())){
            await initializeArray();
        }
        else{
            await updateArray(); // Waits for each update to finish
        }
        await new Promise(resolve => setTimeout(resolve, timeInterval * 1000)); // Waits before next
    }
}

async function setConfig(){
    var ans = await askQuestion("Update Config? (y/n): ");
    if(ans == 'n'){
        return;
    }

    let loop = true;
    while(loop){
        let type = await askQuestion("Enter type: ");
        let color = await askQuestion("Enter color: ");
        let val = await askQuestion("Enter value: ");
        if (type == 'humidity' || type == 'pressure'){
            let n = await askQuestion("Enter number: ");
            config.setConfig(type, color, val, n);
        }
        else{
            config.setConfig(type, color, val);
        }

        ans = await askQuestion("Continue y/n: ");
        if(ans == 'y'){
            loop = true;
        }
        else{
            loop = false;
        }
    }

    config.updateConfig();
}

async function analyze(){
    await setArray();
    await setConfig();

    const analysis = new DataAnalysis(data, config);

    await analysis.checkUsability();
    let usability = (await analysis.getUsability());

    let temp = usability.temperature.usability;
    let rain = usability.rain.usability;
    let humid = usability.humidity.usability;
    let pres = usability.pressure.usability;
    let wind = usability.wind.usability;
    var color;
    switch(temp){
        case(0):
        color = "red";
        break;
        case(1):
        color = "yellow";
        break;
        case(2):
        color = "green";
        break;
    }
    console.log("Temp diff: " + usability.temperature.difference + "F ("+ color +")");

    switch(rain){
        case(0):
        color = "red";
        break;
        case(1):
        color = "yellow";
        break;
        case(2):
        color = "green";
        break;
    }
    console.log("rain chance: " + analysis.getCurrentWeather().chance_rain + "% ("+ color +")");

    switch(humid){
        case(0):
        color = "red";
        break;
        case(1):
        color = "yellow";
        break;
        case(2):
        color = "green";
        break;
    }
    console.log("humidity slope: " + usability.humidity.slope + " ("+ color +")");

    switch(pres){
        case(0):
        color = "red";
        break;
        case(1):
        color = "yellow";
        break;
        case(2):
        color = "green";
        break;
    }
    console.log("pressure slope: " + usability.pressure.slope + " ("+ color +")");

    switch(wind){
        case(0):
        color = "red";
        break;
        case(1):
        color = "yellow";
        break;
        case(2):
        color = "green";
        break;
    }
    console.log("wind speed: " + analysis.getCurrentWeather().wind.speed + "mph ("+ color +")");
}

analyze();