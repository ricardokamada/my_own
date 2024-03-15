require('dotenv').config();
// const Binance = require('node-binance-api');
// const binance = new Binance().options({
//     APIKEY: process.env.APIKEY,
//     APISECRET: process.env.APISECRET,
//     useServerTime: true,
//   });
  
// OP BBS EM BTCUSDT > DOCKBTC > DOCKUSDT = 1.0046322839561446
// Compra de BTC efetuada com sucesso. Total comprado de  : 0.00014000
// Erro ao comprar DOCK: {"statusCode":400,"body":"{\"code\":-2010,\"msg\":\"Account has insufficient balance for requested action.\"}","headers":{"content-type":"application/json;charset=UTF-8","content-length":"77","connection":"keep-alive","date":"Fri, 15 Mar 2024 00:25:32 GMT","server":"nginx","x-mbx-uuid":"e05bd18d-a8d2-4ff9-8d75-3ce9a26b5b7d","x-mbx-used-weight":"23","x-mbx-used-weight-1m":"23","x-mbx-order-count-10s":"1","x-mbx-order-count-1d":"1","strict-transport-security":"max-age=31536000; includeSubdomains","x-frame-options":"SAMEORIGIN","x-xss-protection":"1; mode=block","x-content-type-options":"nosniff","content-security-policy":"default-src 'self'","x-content-security-policy":"default-src 'self'","x-webkit-csp":"default-src 'self'","cache-control":"no-cache, no-store, must-revalidate","pragma":"no-cache","expires":"0","x-cache":"Error from cloudfront","via":"1.1 f2efda1c6a986496720754c7fee772de.cloudfront.net (CloudFront)","x-amz-cf-pop":"GRU1-P1","x-amz-cf-id":"C51pjMlaSxyeZ_c_4VMFHxyOaEOpd-lMYYD0ens0XAn5FtiNCDh95A=="},"request":{"uri":{"protocol":"https:","slashes":true,"auth":null,"host":"api.binance.com","port":443,"hostname":"api.binance.com","hash":null,"search":null,"query":null,"pathname":"/api/v3/order","path":"/api/v3/order","href":"https://api.binance.com/api/v3/order"},"method":"POST","headers":{"User-Agent":"Mozilla/4.0 (compatible; Node Binance API)","Content-type":"application/x-www-form-urlencoded","X-MBX-APIKEY":"zkkOZ6p390Uxqpx7tTJnN1S1PgpM1a1HKkIr2QAzg4YHddJLBc14xbWsurBdbptO","content-length":163}}}
// Tentando novamente a compra...


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

// function formatNumber(value, step_size) {
//     // Calcula o número de casas decimais com base em step_size
//     const decimalPlaces = Math.max(0, -Math.floor(Math.log10(step_size)));
//     // Formata o número com o número correto de casas decimais
//     return value.toFixed(decimalPlaces);
// }


//teste_func = formatNumber(1500.59887, 0.0001);

//console.log("-------", teste_func);


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



function adjustStepSize(qty, min, max, step_size) {
    // Ajuste a quantidade para que ela esteja de acordo com as regras de LOT_SIZE
    qty = Math.max(qty, min); // A quantidade não pode ser menor que min
    qty = Math.min(qty, max); // A quantidade não pode ser maior que max

    // Determine o número de casas decimais do step_size
    let decimalPlaces = (step_size.toString().split('.')[1] || []).length;

    return qty.toFixed(decimalPlaces); // Ajusta a quantidade para ter o número correto de casas decimais
}


// let myOwn = adjustStepSize(4.7, 0.0001, 80, 0.00001);
// console.log(myOwn);


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



binance.marketSell('BTCUSDT', 0.01473, (error, response) => {
    if (response){
        console.log("Sussefufly !", response.orderId);
    }
});


async function x() {
    try {
        let a = await getSymbolBalance("USDT");
        
        console.log(a, typeof(a));


    } catch (error) {
        console.error("Erro ao obter saldo:", error);
    }
}


x();






// Repita o mesmo processo para a segunda compra


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

