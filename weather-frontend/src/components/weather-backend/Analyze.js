const readline = require('readline');
const path = require('path');
const GetWeather = require('./GetWeather');
const DataHandling = require('./DataHandling');
const DataAnalysis = require('./DataAnalysis');
const Configure = require('./Configure');

//Uses the College of Aviation Tempest Station
const config = new Configure(path.join(__dirname, 'config.json'));
const weather = new GetWeather('ddeff33f-5d93-4446-b2c1-b22c3b3ad73f', '150341', config);
const data = new DataHandling(weather, 60);
const timeInterval = 2;
const loopNum = 3;

//Used for user input for setting config and changing units
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

//Initializes the array
async function initializeArray() {
    await data.initArray();
    await data.exportData();
}

//Adds new data to array
async function updateArray() {
    await data.addArray();
    await data.exportData();
}

//Sets an array for a certain number of values that repeats at a certain time interval
async function setArray() {
    for (let i = 0; i < loopNum; i++) {
        if (!data.isInitialized()) {
            await initializeArray();
        } else {
            await updateArray();
        }
        await new Promise(resolve => setTimeout(resolve, timeInterval * 1000));
    }
}

//Asks the user if they would like to update the config before analysis
async function setConfig() {
    let ans = await askQuestion("Update Config? (y/n): ");
    if (ans === 'n') return;

    while (true) {
        let type = await askQuestion("Enter type: ");
        let color = await askQuestion("Enter color: ");
        let val = await askQuestion("Enter value: ");
        if (type === 'humidity' || type === 'pressure') {
            let n = await askQuestion("Enter number: ");
            config.setConfig(type, color, val, n);
        } else {
            config.setConfig(type, color, val);
        }

        let cont = await askQuestion("Continue y/n: ");
        if (cont.toLowerCase() !== 'y') break;
    }

    config.updateConfig();
}

//Returns the color of the usability (0=red, 1=yellow, 2=green)
function getColor(usability) {
    return ['red', 'yellow', 'green'][usability] || 'unknown';
}

//Prints the usability
function printUsability(analysis, usability, units) {
    const current = analysis.getCurrentWeather();

    console.log(`Temp diff: ${usability.temperature.difference} ${units.temp} (${getColor(usability.temperature.usability)})`);
    console.log(`Rain chance: ${current.chance_rain}% (${getColor(usability.rain.usability)})`);
    console.log(`Humidity slope: ${usability.humidity.slope} (${usability.humidity.trend}) (${getColor(usability.humidity.usability)})`);
    console.log(`Pressure slope: ${usability.pressure.slope} (${usability.pressure.trend}) (${getColor(usability.pressure.usability)})`);
    console.log(`Wind speed: ${current.wind.speed} ${units.wind} (${getColor(usability.wind.usability)})`);
}

async function analyze() {
    //Sets the array and asks for config
    await setArray();
    await setConfig();

    //analyzes the data
    const analysis = new DataAnalysis(data, config);

    await analysis.checkUsability();
    let usability = await analysis.getUsability();

    let temp = usability.temperature.usability;
    let rain = usability.rain.usability;
    let humid = usability.humidity.usability;
    let pres = usability.pressure.usability;
    let wind = usability.wind.usability;
    var color;

    //Displays the usability analysis
    switch (temp) {
        case 0: color = "red"; break;
        case 1: color = "yellow"; break;
        case 2: color = "green"; break;
    }
    console.log("Temp diff: " + usability.temperature.difference + "° (" + color + ")");

    switch (rain) {
        case 0: color = "red"; break;
        case 1: color = "yellow"; break;
        case 2: color = "green"; break;
    }
    console.log("Rain chance: " + analysis.getCurrentWeather().chance_rain + "% (" + color + ")");

    switch (humid) {
        case 0: color = "red"; break;
        case 1: color = "yellow"; break;
        case 2: color = "green"; break;
    }
    console.log("Humidity slope: " + usability.humidity.slope + " (" + color + ")");

    switch (pres) {
        case 0: color = "red"; break;
        case 1: color = "yellow"; break;
        case 2: color = "green"; break;
    }
    console.log("Pressure slope: " + usability.pressure.slope + " (" + color + ")");

    switch (wind) {
        case 0: color = "red"; break;
        case 1: color = "yellow"; break;
        case 2: color = "green"; break;
    }
    console.log("Wind speed: " + analysis.getCurrentWeather().wind.speed + " (" + color + ")");

    //Prints current weather with config information
    console.log("\nConfig Information:");
    console.log(config.getConfig());

    console.log("\nCurrent Weather Summary:");
    data.stringArray(0);

    //Asks if user wants to change units, repeats until user says no
    let changeUnitsResponse;
    do {
        changeUnitsResponse = await askQuestion("Would you like to change units? (y/n): ");
        if (changeUnitsResponse.toLowerCase() === 'y') {
            await analysis.changeUnits();
            console.log("Units changed. Reanalyzing data...\n");

            await analysis.checkUsability();
            usability = await analysis.getUsability();

            //Re-displays updated usability data
            temp = usability.temperature.usability;
            rain = usability.rain.usability;
            humid = usability.humidity.usability;
            pres = usability.pressure.usability;
            wind = usability.wind.usability;

            switch (temp) { case 0: color = "red"; break; case 1: color = "yellow"; break; case 2: color = "green"; break; }
            console.log("Temp diff: " + usability.temperature.difference + "° (" + color + ")");

            switch (rain) { case 0: color = "red"; break; case 1: color = "yellow"; break; case 2: color = "green"; break; }
            console.log("Rain chance: " + analysis.getCurrentWeather().chance_rain + "% (" + color + ")");

            switch (humid) { case 0: color = "red"; break; case 1: color = "yellow"; break; case 2: color = "green"; break; }
            console.log("Humidity slope: " + usability.humidity.slope + " (" + color + ")");

            switch (pres) { case 0: color = "red"; break; case 1: color = "yellow"; break; case 2: color = "green"; break; }
            console.log("Pressure slope: " + usability.pressure.slope + " (" + color + ")");

            switch (wind) { case 0: color = "red"; break; case 1: color = "yellow"; break; case 2: color = "green"; break; }
            console.log("Wind speed: " + analysis.getCurrentWeather().wind.speed + " (" + color + ")");

            //Re-displays current weather after unit change with config data
            console.log("\nConfig Information:");
            console.log(config.getConfig());

            console.log("\nUpdated Current Weather:");
            data.stringArray(0);
        }
    } while (changeUnitsResponse.toLowerCase() === 'y');

    console.log("Ending the program.");
}

analyze();