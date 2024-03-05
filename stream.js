//const Binance = require('node-binance-api');
//const binance = new Binance();
const binance = require('./settings');
require('dotenv').config();


async function exchangeInfo() {
    data =  await binance.exchangeInfo() 
    return data.symbols.filter(s => s.status === 'TRADING').map(s => {
      return {
        symbol: s.symbol,
        base: s.baseAsset,
        quote:s.quoteAsset
      }
    })
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

    console.log("IMPRIMINDO SYMBOL CHEGANDO EM GETBALANCE :", symbol)
    try {
        // Chamada à função binance.balance() para obter todos os saldos
        const balances = await binance.balance();

        // Verifique se o símbolo existe nos saldos retornados
        if (balances[symbol]) {
            // Se o símbolo existir, retorne o saldo correspondente
            return balances[symbol].available;
        } else {
            // Se o símbolo não existir, lance um erro
            throw new Error("Symbol not found in balances");
        }
    } catch (error) {
        // Em caso de erro, lance o erro
        throw error;
    }
}










module.exports = { exchangeInfo, getBook , getSymbolBalance};
