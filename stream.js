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
        quote:s.quoteAsset,
        minLotSize: parseFloat(s.filters.find(f => f.filterType === 'LOT_SIZE').minQty),
        //quantityPrecision: parseFloat(s.filters.find(f => f.filterType === 'LOT_SIZE').quantityPrecision),
        stepSize: parseFloat(s.filters.find(filter => filter.filterType === 'LOT_SIZE').stepSize),
        minNotional: parseFloat(s.filters.find(f => f.filterType === 'NOTIONAL').minNotional),        
        tickSize: parseFloat(s.filters.find(filter => filter.filterType === 'PRICE_FILTER').tickSize),
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

async function execute_purchase_order(symbol, qtd) {
    try {        

        binance.marketBuy(symbol, qtd, (error, response) => {
            if (error) {
                console.error('An error occurred while making the purchase:', error);
            } else {
                console.log(`Purchase made successfully in pair : ${symbol},  qtd: ${qtd} @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`);
            }
            
        });
    } catch (error) {
        console.error('An error occurred while making the purchase:', error);
    }
}






module.exports = { exchangeInfo, getBook , execute_purchase_order, getSymbolBalance };
