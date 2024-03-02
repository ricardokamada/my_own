const QUOTE = process.env.QUOTE;
const AMOUNT = process.env.AMOUNT;
const INTERVAL = process.env.INTERVAL;
const PROFITABILITY = process.env.PROFITABILITY;

const { exchangeInfo } = require("./api");

console.log("hello word 519 7148");

async function start() {
    // get all coins from ExchangeInfo() api
    console.log("Loading exchange info()... ");
    const allSymbols = await exchangeInfo();
    console.log(allSymbols);
}


start()