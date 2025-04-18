const fs = require('fs');
const path = require('path');

class Configure{
    constructor(fileName){
        this.fileName = fileName;  // Add this line
        try {
            this.config = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
        } catch (error) {
            console.error("Error reading or parsing JSON file:", error);
            this.config = null;
        }
    }

    getConfig(){
        return this.config;
    }

    setConfig(type, color, val, n = null){
        val = isNaN(val) ? val : parseFloat(val);
        if (n !== null) {
            n = isNaN(n) ? n : parseFloat(n);
        }
    
        switch(type){
            case('humidity'):
                this.config.humidity.n = n;
                switch(color){
                    case('yellow'):
                        this.config.humidity.yellow = val;
                        return;
                    case('red'):
                        this.config.humidity.red = val;
                        return;
                }
            case('pressure'):
                this.config.pressure.n = n;
                switch(color){
                    case('yellow'):
                        this.config.pressure.yellow = val;
                        return;
                    case('red'):
                        this.config.pressure.red = val;
                        return;
                }
            case('temperature'):
                switch(color){
                    case('yellow'):
                        this.config.temperature.yellow = val;
                        return;
                    case('red'):
                        this.config.temperature.red = val;
                        return;
                }
            case('rain'):
                switch(color){
                    case('yellow'):
                        this.config.rain.yellow = val;
                        return;
                    case('red'):
                        this.config.rain.red = val;
                        return;
                }
            case('wind'):
                switch(color){
                    case('yellow'):
                        this.config.wind.yellow = val;
                        return;
                    case('red'):
                        this.config.wind.red = val;
                        return;
                }
        }
    }

    updateConfig() {
        try {
            fs.writeFileSync(this.fileName, JSON.stringify(this.config, null, 2));
            console.log(`Config updated and saved.`);
        } catch (error) {
            console.error("Error updating config:", error);
        }
    }
}

module.exports = Configure;