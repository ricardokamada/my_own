const Binance = require('node-binance-api');
const binance = new Binance();

const BOOK = {};

binance.websockets.miniTicker(markets => {
    for (let symbol in markets) {
        BOOK[symbol] = { price: parseFloat(markets[symbol].close) };
    }
});

function getBook(symbol) {
    return BOOK[symbol];
}

module.exports = { getBook };
