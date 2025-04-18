const Configure = require('./Configure');

const configuer = new Configure('config.json');
const config = configuer.getConfig();

console.log(config);