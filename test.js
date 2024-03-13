require('dotenv').config();

const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'qLiJoXnyeiffZYqEcbzQ6pSZKHGWbfYcpntISLU04godqHvokNH4RBgN0rMWqkJI',
  APISECRET: 'ABPzh0iq3pjhYlFE3XjcYEmkXTITdI8qJjNX3vISD91wpyAPAp7Ln4HUKH9iSOtV',
  recvWindow: 60000,
  family: 0,
  urls: {
    base: "https://testnet.binance.vision/api/",

  }
});




// const symbol = 'BTCUSDT'; // Substitua 'BTCUSDT' pelo par de negociação desejado

// binance.exchangeInfo((error, data) => {
//     if (error) {
//         console.error("Erro ao buscar informações de troca:", error);
//         return;
//     }
    
//     // Encontre o símbolo específico nas informações da troca
//     const symbolInfo = data.symbols.find(s => s.symbol === symbol);
//     if (!symbolInfo) {
//         console.error("Símbolo não encontrado:", symbol);
//         return;
//     }

//     // Obtenha as restrições de tamanho do lote para o símbolo
//     const lotSizeFilter = symbolInfo.filters.find(filter => filter.filterType === 'LOT_SIZE');
//     if (!lotSizeFilter) {
//         console.error("Restrições de tamanho de lote não encontradas para o símbolo:", symbol);
//         return;
//     }

//     console.log("Restrições de tamanho do lote para", symbol, ":", lotSizeFilter);
// });



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


//binance.marketSell("BTCUSDT" , 0.0041);

// function comprarMercado(symbol, quantity) {
//     binance.marketBuy("BTCUSDT", 0.001, (error, response) => {
//       if (error) {
//         console.log("Erro na compra:", error);
//       } else {
//         console.log("Resposta da compra:", response);
//       }
//     });
//   }



async function x() {
    try {
        let a = await getSymbolBalance("USDT");
        console.log(a);


    } catch (error) {
        console.error("Erro ao obter saldo:", error);
    }
}


x();

//binance.marketSell("BTCUSDT", 1.0414);




//meu ip 189.123.97.38

// const BOOK = {};

// binance.websockets.miniTicker(markets => {
//     for (let symbol in markets) {
//         BOOK[symbol] = { price: parseFloat(markets[symbol].close) };

//         if (symbol === "CRVUSDT")
//             console.log(markets[symbol].close)
//     }

    
// });

// async function executeOrders() {
//     try {
//         // Coloque suas ordens de compra
//         await binance.buy('BTCUSDT', 0.001, 60000); // Compra 0.001 BTC a um preço de $60000 por BTC

//         // Coloque suas ordens de venda
//         await binance.sell('BTCUSDT', 0.001, 70000); // Vende 0.001 BTC a um preço de $70000 por BTC

//         console.log('Orders executed successfully.');
//     } catch (error) {
//         console.error('Error executing orders:', error);
//     }
// }

// function executeOrders() {
//     try {
//         let quantity = 5;
//         binance.marketBuy('BTCUSDT', quantity, (error, response) => {
//             if (error) {
//                 console.error('Erro ao realizar a compra de mercado:', error);
//                 console.error('Error executing orders:', error);
//             } else {
//                 console.info("Market Buy response", response);
//                 console.info("order id: " + response.orderId);
//                 console.log('Orders executed successfully.');
//             }
//         });        
//     } catch (error) {
//         console.error('Error executing orders:', error);
//     }
// }

// Chamada da função para executar as ordens
//executeOrders();


// Obter saldos da conta
// binance.balance((error, balances) => {
//     if (error) return console.error(error);

//     // Operação 1: Comprar BTCUSDT a mercado
//     binance.marketBuy('BTCUSDT', 0.001, (error, response) => {
//         if (error) return console.error(error);
//         console.log("Compra de BTCUSDT realizada com sucesso:", response);
        
//         // Operação 2: Trocar todo saldo de BTC por BTCETH
//         const btcBalance = balances.BTC.available;
//         binance.marketSell('BTCETH', btcBalance, (error, response) => {
//             if (error) return console.error(error);
//             console.log("Troca de BTC por BTCETH realizada com sucesso:", response);

//             // Operação 3: Trocar todo saldo de ETH por ETHUSDT
//             const ethBalance = balances.ETH.available;
//             binance.marketSell('ETHUSDT', ethBalance, (error, response) => {
//                 if (error) return console.error(error);
//                 console.log("Troca de ETH por ETHUSDT realizada com sucesso:", response);
//             });
//         });
//     });
// });

// Obter saldos da conta

// binance.balance( (error, balances) => {
//     if (error) return console.error(error);

//     console.log(`Saldo BTC ---> ${balances.BTC.available}`)

// });






// async function getBNBBalance(symbol) {
//   try {
//       const balances = await new Promise((resolve, reject) => {
//           binance.balance((error, balances) => {
//               if (error) {
//                   reject(error);
//               } else {
//                   resolve(balances);
//               }
//           });
//       });

//       return balances.symbol.available;
//   } catch (error) {
//       console.error("Erro ao obter saldo BNB:", error);
//       throw error; // Ou retorne algum valor padrão, dependendo do comportamento desejado
//   }
// }

// Exemplo de uso
// async function main() {
//   try {
//       const balance = await getBNBBalance();
//       console.log("Saldo BNB:", balance);
//   } catch (error) {
//       console.error("Erro ao obter saldo BNB:", error);
//   }
// }

// main();





// async function order_BuyBuySell(symbol1, symbol2, symbol3) {
//     try {

//         console.log("CHEGANDO OS SIMBOLOS : ", symbol1, symbol2, symbol3);

        
        
//         // etapa 1: comprar bitcoin com dolares usdt. par BTC/USDT
//         // 1. Realizar a primeira compra no mercado spot
//         const firstOrder = await binance.marketBuy(symbol1, process.env.QUOTE); // Exemplo: Compra de 0.001 BTC com USDT
//         console.log('Compra realizada com sucesso:', firstOrder);

//         // Verificar o saldo do ativo comprado
//         const balance = await binance.balance();
//         const boughtAssetBalance = balance[symbol1].available; // Substitua 'symbol1' pelo símbolo do ativo que você comprou
//         console.log('Saldo do ativo comprado:', symbol1,  boughtAssetBalance);

//         //###################################################################################################################
//         // etapa 2: comprar ETH com o saldo disponivel de bitcoin. par ETH/BTC
//         const secondOrder = await binance.marketBuy(symbol2, boughtAssetBalance); 
//         console.log('Segunda compra realizada com sucesso:', secondOrder);

//         // Verificar o saldo novamente após a segunda compra
//         const updatedBalance = await binance.balance();
//         const updatedBoughtAssetBalance = updatedBalance[symbol2].available; 
//         console.log('Saldo atualizado do ativo comprado:', updatedBoughtAssetBalance);

//         //###################################################################################################################

//         // 5. Usar o saldo para realizar ultima venda 
//         const thirdOrder = await binance.marketSell(symbol3, updatedBoughtAssetBalance); // Exemplo: Compra de 0.01 ETH com BTC
//         console.log('Terceira venda realizada com sucesso:', thirdOrder);
        


//     } catch (error) {
//         console.error('Ocorreu um erro:', error);
//     }

    
// }

