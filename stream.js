//const Binance = require('node-binance-api');
//const binance = new Binance();
const binance = require('./settings');
require('dotenv').config();


async function exchangeInfo() {
    try {
        data = await binance.exchangeInfo()
        return data.symbols.filter(s => s.status === 'TRADING').map(s => {
            return {
                symbol: s.symbol,
                base: s.baseAsset,
                quote: s.quoteAsset,
                minLotSize: parseFloat(s.filters.find(f => f.filterType === 'LOT_SIZE').minQty),
                maxLotSize: parseFloat(s.filters.find(f => f.filterType === 'LOT_SIZE').maxQty),
                stepSize: parseFloat(s.filters.find(filter => filter.filterType === 'LOT_SIZE').stepSize),
                minNotional: parseFloat(s.filters.find(f => f.filterType === 'NOTIONAL').minNotional),
                tickSize: parseFloat(s.filters.find(filter => filter.filterType === 'PRICE_FILTER').tickSize),
            }
        });
    } catch (error) {
        console.log("ERROR em exchangeInfo()", error);
        throw error; 
    }
}


const BOOK = {};

binance.websockets.miniTicker(markets => {
    for (let symbol in markets) {
        BOOK[symbol] = { price: parseFloat(markets[symbol].close) };
    }
});

function getBook(symbol) {
    return BOOK[symbol];
}

// Função para obter o saldo de um símbolo específico
async function getSymbolBalance(symbol) {


    try {
        // Chamada à função binance.balance() para obter todos os saldos
        const balances = await binance.balance();

        // Verifique se o símbolo existe nos saldos retornados
        if (balances[symbol]) {
            // Se o símbolo existir, retorne o saldo correspondente
            return parseFloat(balances[symbol].available);
        } else {
            // Se o símbolo não existir, lance um erro
            throw new Error("Symbol not found in balances");
        }
    } catch (error) {
        // Em caso de erro, lance o erro
        throw error;
    }
}







module.exports = { exchangeInfo, getBook, getSymbolBalance };
