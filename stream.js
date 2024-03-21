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





// async function getBestBid(symbol) {
//     return new Promise((resolve, reject) => {
//         binance.websockets.bookTickers(symbol, (ticker) => {
//             resolve(ticker.bestBid);  
//             binance.websockets.terminate(symbol);        
//         });
//     });
// }

async function getBestBid(symbol) {
    return new Promise((resolve, reject) => {
        binance.websockets.bookTickers(symbol, (ticker) => {
            resolve(ticker.bestBid);  
        });
    }).then(() => {
        binance.websockets.terminate(symbol); // Terminar a inscrição após a resolução da promessa
    });
}


async function getBestAsk(symbol) {
    return new Promise((resolve, reject) => {
        binance.websockets.bookTickers(symbol, (ticker) => {
            resolve(ticker.bestAsk);  
        });
    }).then(() => {
        binance.websockets.terminate(symbol); // Terminar a inscrição após a resolução da promessa
    });
}

// async function getBestBid(symbol) {
//     return new Promise((resolve, reject) => {
//         binance.websockets.bookTickers(symbol, (ticker) => {
//             resolve(ticker.bestBid);          
//         });
//     });
// }

// async function getBestAsk(symbol) {
//     return new Promise((resolve, reject) => {
//         binance.websockets.bookTickers(symbol, (ticker) => {
//             resolve(ticker.bestAsk); 
//         });
//     });
// }

// async function getBestBid(symbol) {
//     return new Promise((resolve, reject) => {
//         binance.websockets.bookTickers(symbol, (ticker) => {
//             resolve(ticker.bestBid);  
//         });
//     }).then(() => {
//         binance.websockets.terminate(symbol); // Terminar a inscrição após a resolução da promessa
//     });
// }





// Função para obter o saldo de um símbolo específico
// async function getSymbolBalance(symbol) {


//     try {
//         // Chamada à função binance.balance() para obter todos os saldos
//         const balances = await binance.balance();

//         // Verifique se o símbolo existe nos saldos retornados
//         if (balances[symbol]) {
//             // Se o símbolo existir, retorne o saldo correspondente
//             return parseFloat(balances[symbol].available);
//         } else {
//             // Se o símbolo não existir, lance um erro
//             throw new Error("Symbol not found in balances");
//         }
//     } catch (error) {
//         // Em caso de erro, lance o erro
//         throw error;
//     }
// }







module.exports = { exchangeInfo, getBestBid, getBestAsk };
