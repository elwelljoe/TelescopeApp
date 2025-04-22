const fs = require('fs');
const path = require('path');

class Configure {
    constructor(fileName) {
        this.fileName = fileName;
        this.config = null;
        this.loadConfig();
    }

    //Loads config from file
    loadConfig() {
        try {
            const configData = fs.readFileSync(this.fileName, 'utf-8');
            this.config = JSON.parse(configData);
            console.log("Config loaded successfully.");
        } catch (error) {
            console.error("Error reading or parsing config file:", error.message);
            this.config = null;
        }
    }

    //returns config data
    getConfig() {
        return this.config;
    }

    //Set config information
    setConfig(type, color, val, n = null) {
        //Checks if config was loaded
        if (!this.config) {
            console.warn("Cannot update config — config not loaded.");
            return;
        }

        //Checks if there will be an 'n' value
        val = isNaN(val) ? val : parseFloat(val);
        if (n !== null) {
            n = isNaN(n) ? n : parseFloat(n);
        }

        //Checks the type and color being changed and sets the value, sets the 'n' value if applicable
        switch (type) {
            case 'humidity':
                if (n !== null) this.config.humidity.n = n;
                if (color) this.config.humidity[color] = val;
                break;
            case 'pressure':
                if (n !== null) this.config.pressure.n = n;
                if (color) this.config.pressure[color] = val;
                break;
            case 'temperature':
            case 'wind':
            case 'rain':
                if (color) this.config[type][color] = val;
                break;
            default:
                console.warn(`Unknown config type: ${type}`);
        }
    }

    //Saves changes to config file
    updateConfig() {
        if (!this.config) return;
        try {
            fs.writeFileSync(this.fileName, JSON.stringify(this.config, null, 2));
            console.log("Config updated and saved.");
        } catch (error) {
            console.error("Error updating config:", error.message);
        }
    }

    //Changes units of config
    changeUnits() {
        if (!this.config || !this.config.units) {
            console.warn("Units config is missing.");
            return;
        }

        if (this.config.units.metric) {
            this.config.units.temp = 'f';
            this.config.units.wind = 'mph';
            this.config.units.pressure = 'inhg';

            this.config.temperature.yellow = Math.round(1.8 * this.config.temperature.yellow);
            this.config.temperature.red = Math.round(1.8 * this.config.temperature.red);
            this.config.wind.yellow = Math.round(2.23694 * this.config.wind.yellow);
            this.config.wind.red = Math.round(2.23694 * this.config.wind.red);
            this.config.pressure.yellow = parseFloat((this.config.pressure.yellow / 33.864).toFixed(2));
            this.config.pressure.red = parseFloat((this.config.pressure.red / 33.864).toFixed(2));

            this.config.units.metric = false;
        } else {
            this.config.units.temp = 'c';
            this.config.units.wind = 'mps';
            this.config.units.pressure = 'mb';

            this.config.temperature.yellow = Math.round(this.config.temperature.yellow / 1.8);
            this.config.temperature.red = Math.round(this.config.temperature.red / 1.8);
            this.config.wind.yellow = Math.round(this.config.wind.yellow / 2.23694);
            this.config.wind.red = Math.round(this.config.wind.red / 2.23694);
            this.config.pressure.yellow = parseFloat((this.config.pressure.yellow * 33.864).toFixed(2));
            this.config.pressure.red = parseFloat((this.config.pressure.red * 33.864).toFixed(2));

            this.config.units.metric = true;
        }
        this.updateConfig();
    }
}

module.exports = Configure;
