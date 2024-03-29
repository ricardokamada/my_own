require('dotenv').config();

const binance = require('./settings');
const stream = require("./stream");
//const  { exchangeInfo }  = require("./api");



const QUOTE = process.env.QUOTE;
const AMOUNT = parseInt(process.env.AMOUNT);
const INTERVAL = parseInt(process.env.CRAWLER_INTERVAL);
const PROFITABILITY = parseFloat(process.env.PROFITABILITY);



console.log("hello word 519 7148");



function getBuyBuySell(buySymbols, allSymbols, symbolsMap) {
    const buyBuySell = [];
    for (let i = 0; i < buySymbols.length; i++) {
        const buy1 = buySymbols[i];

        const right = allSymbols.filter(s => s.quote === buy1.base);

        for (let j = 0; j < right.length; j++) {
            const buy2 = right[j];

            const sell1 = symbolsMap[buy2.base + buy1.quote];
            if (!sell1) continue;

            buyBuySell.push({ buy1, buy2, sell1 });
        }
    }
    return buyBuySell;
}

function getBuySellSell(buySymbols, allSymbols, symbolsMap) {
    const buySellSell = [];
    for (let i = 0; i < buySymbols.length; i++) {
        const buy1 = buySymbols[i];

        const right = allSymbols.filter(s => s.base === buy1.base && s.quote !== buy1.quote);

        for (let j = 0; j < right.length; j++) {
            const sell1 = right[j];

            const sell2 = symbolsMap[sell1.quote + buy1.quote];
            if (!sell2) continue;

            buySellSell.push({ buy1, sell1, sell2 });
        }
    }
    return buySellSell;
}


function getSymbolMap(symbols) {
    const map = {};
    symbols.map(s => map[s.symbol] = s);
    return map;
}


function ajustarValorComStepSize(valor, stepSize) {
    const numeroCasasDecimais = -Math.floor(Math.log10(parseFloat(stepSize)));
    return valor.toFixed(numeroCasasDecimais);
}
function calcularCasasDecimais(valor, stepSize) {
    // Convertendo o valor para um número
    const valorNum = parseFloat(valor);

    // Verificando se o valor é um número válido
    if (!isNaN(valorNum)) {
        // Convertendo o stepSize para um número
        const stepSizeNum = parseFloat(stepSize);

        // Verificando se o stepSize é um número válido maior que zero
        if (!isNaN(stepSizeNum) && stepSizeNum > 0) {
            // Calculando o número de casas decimais com base no logaritmo do inverso do stepSize
            const numCasasDecimais = -Math.floor(Math.log10(stepSizeNum));

            // Arredondando o valor para o número correto de casas decimais
            return valorNum.toFixed(numCasasDecimais);
        }
    }

    // Se não for possível converter para número ou se o stepSize não for válido, retornar o valor original
    return valor;
}

async function executeTradeBbs(symbol1, symbol2, symbol3) {


    console.log(`OP BBS EM ${symbol1.symbol} > ${symbol2.symbol} > ${symbol3.symbol} `);

    let buy1Response, buy2Response, sell1Response, quantity_buy1;

    const stepSizeNumeric = parseFloat(symbol1.stepSize);

    if (stepSizeNumeric === 1 || stepSizeNumeric === 0.1 || stepSizeNumeric === 0.01) {
        quantity_buy1 = 10;
    } else if (stepSizeNumeric <= 0.001) {
        quantity_buy1 = 0.0003;
    }

    console.log('minNotional', symbol1.minNotional, symbol2.minNotional, symbol3.minNotional);

    try {
        buy1Response = await binance.marketBuy(symbol1.symbol.toString(), quantity_buy1 );
        console.log(`Compra de ${symbol1.symbol} efetuada com sucesso. Total comprado de  : ${buy1Response.executedQty} no preco -----`);
    } catch (error) {
        console.error(`Erro ao comprar ${symbol1.symbol}: ${JSON.stringify(error)}`);
    }

    if (buy1Response.status === 'FILLED') {
        try {
            buy2Response = await binance.marketBuy(symbol2.symbol.toString(), null, { quoteOrderQty: buy1Response.executedQty });
            console.log(`Compra de ${symbol2.symbol} efetuada com sucesso. Total comprado de  : ${buy2Response.executedQty} no preco ------`);
        } catch (error) {
            console.error(`Erro ao comprar ${symbol2.symbol}: ${JSON.stringify(error)}`);
        }
    }

    if (buy2Response.status === 'FILLED') {
        try {
            sell1Response = await binance.marketSell(symbol3.symbol.toString(), buy2Response.executedQty);
            console.log(`Venda de ${symbol3.symbol} efetuada com sucesso. Total vendido de  : ${sell1Response.executedQty} no preco ------`);
        } catch (error) {
            console.error(`Erro ao vender ${symbol3.symbol}: ${JSON.stringify(error)}`);
        }
    }

    if (buy1Response && buy1Response.orderId && buy2Response && buy2Response.orderId && sell1Response && sell1Response.orderId) {
        console.log("All operations completed successfully!");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarde o próximo intervalo

    }


}

async function executeTradeBss(symbol1, symbol2, symbol3, price) {


    console.log(`OP BSS EM ${symbol1.symbol} > ${symbol2.symbol} > ${symbol3.symbol} `);

    let buy1Response, buy2Response, sell1Response, quantity_buy1;

    quantity_buy1 = calcularCasasDecimais(process.env.AMOUNT/price, symbol1.stepSize);


    try {
        buy1Response = await binance.marketBuy(symbol1.symbol.toString(), quantity_buy1);
        console.log(`Compra de ${symbol1.symbol} efetuada com sucesso. Total comprado de  : ${buy1Response.executedQty} no preco -----`);
    } catch (error) {
        console.error(`Erro ao comprar ${symbol1.symbol}: ${JSON.stringify(error)}`);
    }

    let sell2 = calcularCasasDecimais(buy1Response.executedQty, symbol2.stepSize);
    if (buy1Response.status === 'FILLED') {
        try {
            buy2Response = await binance.marketSell(symbol2.symbol.toString(), sell2);
            console.log(`Venda de ${symbol2.symbol} efetuada com sucesso. Total vendido de  : ${buy2Response.executedQty} no preco ------`);
        } catch (error) {
            console.error(`Erro ao vender ${symbol2.symbol}: ${JSON.stringify(error)}`);
        }
    }

    
    let sell3 = buy2Response.fills[0].price * buy2Response.fills[0].qty;
    sell3 = calcularCasasDecimais(sell3, symbol3.stepSize);
    if (buy2Response.status === 'FILLED') {
        try {
            sell1Response = await binance.marketSell(symbol3.symbol.toString(), sell3);
            console.log(`Venda de ${symbol3.symbol} efetuada com sucesso. Total vendido de  : ${sell1Response.executedQty} no preco ------`);
        } catch (error) {
            console.error(`Erro ao vender ${symbol3.symbol}: ${JSON.stringify(error)}`);
        }
    }

    if (buy1Response && buy1Response.orderId && buy2Response && buy2Response.orderId && sell1Response && sell1Response.orderId) {
        console.log("All operations BSS completed successfully!");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarde o próximo intervalo

    }


}




let isTaskRunning = false;


// async function processBuyBuySell(buyBuySell) {



//     for (let i = 0; i < buyBuySell.length; i++) {
//         const candidate = buyBuySell[i];


//         //verifica se já temos todos os preços
//         let priceBuy1 = await getBestAsk(candidate.buy1.symbol);
//         if (!priceBuy1) continue;

//         priceBuy1 = parseFloat(priceBuy1);

//         let priceBuy2 = await getBestAsk(candidate.buy2.symbol);
//         if (!priceBuy2) continue;

//         priceBuy2 = parseFloat(priceBuy2);

//         let priceSell1 = await getBestBid(candidate.sell1.symbol);
//         if (!priceSell1) continue;

//         console.log("p1", priceBuy1);
//         console.log("p2", priceBuy2)
//         console.log("p3", priceSell1);

//         priceSell1 = parseFloat(priceSell1.price);

//         //se tem o preço dos 3, pode analisar a lucratividade
//         const crossRate = (1 / priceBuy1) * (1 / priceBuy2) * priceSell1;


//         let buy1Response, buy2Response, sell1Response, quantity_buy1, quantity_buy2;

//         quantity_buy1 = process.env.AMOUNT;

//         let stepSize1 = parseFloat(candidate.buy1.stepSize);
//         let stepSize2 = parseFloat(candidate.buy2.stepSize);
//         let stepSize3 = parseFloat(candidate.sell1.stepSize);

//         if (crossRate > PROFITABILITY && !isTaskRunning && stepSize2 <= stepSize1 && stepSize3 <= stepSize2) {

//             isTaskRunning = true;


//             console.log(`OP BBS EM ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell1.symbol} = ${crossRate}`);

//             // Primeira compra

//             try {
//                 buy1Response = await binance.marketBuy(candidate.buy1.symbol.toString(), null, { quoteOrderQty: parseFloat(quantity_buy1) });
//                 console.log(`Compra de ${candidate.buy1.base} efetuada com sucesso. Total comprado de  : ${buy1Response.executedQty} no preco ${priceBuy1.toFixed(8)}`);
//             } catch (error) {
//                 console.error(`Erro ao comprar ${candidate.buy1.base}: ${JSON.stringify(error)}`);
//             }


//             // Segunda compra
//             if (buy1Response.status === 'FILLED') {
//                 try {
//                     buy2Response = await binance.marketBuy(candidate.buy2.symbol.toString(), null, { quoteOrderQty: buy1Response.executedQty });
//                     console.log(`Compra de ${candidate.buy2.base} efetuada com sucesso. Total comprado de  : ${buy2Response.executedQty} no preco ${priceBuy2.toFixed(8)}`);
//                 } catch (error) {
//                     console.error(`Erro ao comprar ${candidate.buy2.base}: ${JSON.stringify(error)}`);
//                 }
//             }

//             // // Venda
//             if (buy2Response.status === 'FILLED') {
//                 try {
//                     sell1Response = await binance.marketSell(candidate.sell1.symbol.toString(), buy2Response.executedQty);
//                     console.log(`Venda de ${candidate.sell1.base} efetuada com sucesso. Total vendido de  : ${sell1Response.executedQty} no preco ${priceSell1}`);
//                 } catch (error) {
//                     console.error(`Erro ao vender ${candidate.sell1.base}: ${JSON.stringify(error)}`);
//                 }
//             }

//             await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarde o próximo intervalo
//             isTaskRunning = false;
//             return;
//             process.exit(0);




//             //Erro ao vender PHB: {"statusCode":400,"body":"{\"code\":-1013,\"msg\":\"Filter failure: LOT_SIZE\"}



//             //process.exit(0);




//         }

//     }

// }


function processBuySellSell(buySellSell) {



    for (let i = 0; i < buySellSell.length; i++) {
        const candidate = buySellSell[i];

        //verifica se já temos todos os preços
        let priceBuy1 = stream.getBook(candidate.buy1.symbol);
        if (!priceBuy1) continue;
        priceBuy1 = parseFloat(priceBuy1.price);

        let priceSell1 = stream.getBook(candidate.sell1.symbol);
        if (!priceSell1) continue;
        priceSell1 = parseFloat(priceSell1.price);

        let priceSell2 = stream.getBook(candidate.sell2.symbol);
        if (!priceSell2) continue;
        priceSell2 = parseFloat(priceSell2.price);

        //se tem o preço dos 3, pode analisar a lucratividade
        const crossRate = (1 / priceBuy1) * priceSell1 * priceSell2;
        if (crossRate > PROFITABILITY) {

            console.log(`OPERAÇÃO BSS EM ${candidate.buy1.symbol} > ${candidate.sell1.symbol} > ${candidate.sell2.symbol} = ${crossRate}`);
            console.log(`Investindo ${QUOTE}${AMOUNT}, retorna ${QUOTE}${((AMOUNT / priceBuy1) * priceSell1) * priceSell2}`);

        }
    }
}


let prices = {};
let updatedSymbols = new Set(); // Lista de símbolos atualizados desde a última verificação


// Inicializa o WebSocket
binance.websockets.prevDay(false, (error, response) => {
    // Atualiza o objeto de preços com os novos valores
    prices[response.symbol] = {
        bestAsk: parseFloat(response.bestAsk),
        bestBid: parseFloat(response.bestBid)
    };
    // Adiciona o símbolo à lista de símbolos atualizados
    updatedSymbols.add(response.symbol);
});

let contatador = 0;

async function start() {

    let isTaskRunning = false;


    //pega todas moedas que estão sendo negociadas
    console.log('Loading Exchange Info...');
    const allSymbols = await stream.exchangeInfo();

    //moedas que você pode comprar
    const buySymbols = allSymbols.filter(s => s.quote === QUOTE);
    console.log('There are ' + buySymbols.length + " pairs that you can buy with " + QUOTE);

    //organiza em map para performance
    const symbolsMap = getSymbolMap(allSymbols);

    //descobre todos os pares que podem triangular BUY-BUY-SELL
    const buyBuySell = getBuyBuySell(buySymbols, allSymbols, symbolsMap);
    console.log('There are ' + buyBuySell.length + " pairs that we can do BBS");

    //descobre todos os pares que podem triangular BUY-SELL-SELL
    const buySellSell = getBuySellSell(buySymbols, allSymbols, symbolsMap);
    console.log('There are ' + buySellSell.length + " pairs that we can do BSS");



    setInterval(async () => {
        console.log(new Date());

        if (updatedSymbols.size > 0) {
            for (const symbol of updatedSymbols) {
                // Verifica apenas os símbolos que foram atualizados
                // E verifica se eles têm pares de triangulação em buyBuySell
                const relevantPairs_bbs = buyBuySell.filter(pair =>
                    pair.buy1.symbol === symbol || pair.buy2.symbol === symbol || pair.sell1.symbol === symbol
                );

                const relevantPairs_bss = buySellSell.filter(pair =>
                    pair.buy1.symbol === symbol || pair.sell1.symbol === symbol || pair.sell2.symbol === symbol
                );

                for (const candidate of relevantPairs_bbs) {

                    if (!isTaskRunning) {

                        // Verifique se você já tem os preços necessários
                        const priceBuy1 = prices[candidate.buy1.symbol];
                        const priceBuy2 = prices[candidate.buy2.symbol];
                        const priceSell1 = prices[candidate.sell1.symbol];

                        if (!priceBuy1 || !priceBuy2 || !priceSell1) continue;

                        //se tem o preço dos 3, pode analisar a lucratividade
                        const crossRate = (1 / priceBuy1.bestAsk) * (1 / priceBuy2.bestAsk) * priceSell1.bestBid;

                        // Se todas as condições forem atendidas, execute as operações de compra e venda
                        if (crossRate >= PROFITABILITY) {
                            isTaskRunning = true;
                            //await executeTradeBbs(candidate.buy1.symbol, candidate.buy2.symbol, candidate.sell1.symbol);
                            await executeTradeBbs(candidate.buy1, candidate.buy2, candidate.sell1);

                            isTaskRunning = false;
                        }
                    }

                }

                for (const candidate of relevantPairs_bss) {
                    if (!isTaskRunning) {

                        // Verifique se você já tem os preços necessários
                        const priceBuy1 = prices[candidate.buy1.symbol];
                        const priceSell1 = prices[candidate.sell1.symbol];
                        const priceSell2 = prices[candidate.sell2.symbol];

                        if (!priceBuy1 || !priceSell1 || !priceSell2) continue;

                        //se tem o preço dos 3, pode analisar a lucratividade
                        const crossRate = (1 / priceBuy1.bestAsk) * priceSell1.bestBid * priceSell2.bestBid;

                        // Se todas as condições forem atendidas, execute as operações de compra e venda
                        if (crossRate >= PROFITABILITY) {
                            isTaskRunning = true;
                            //await executeTradeBbs(candidate.buy1.symbol, candidate.buy2.symbol, candidate.sell1.symbol);
                            await executeTradeBss(candidate.buy1, candidate.sell1, candidate.sell2, priceBuy1.bestAsk);

                            isTaskRunning = false;
                        }
                    };
                }

                // Remova o símbolo da lista de símbolos atualizados
                updatedSymbols.delete(symbol);
            }
        }

        // Não finalize o processo até que todas as tarefas estejam concluídas
        // if (!isTaskRunning && updatedSymbols.size === 0 && buyBuySell.every(candidate => prices[candidate.buy1.symbol] && prices[candidate.buy2.symbol] && prices[candidate.sell1.symbol])) {
        //     process.exit(0);
        // }
    }, 1000);






}

start();