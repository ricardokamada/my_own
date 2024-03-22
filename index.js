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


let isTaskRunning = false;


async function processBuyBuySell(buyBuySell) {



    for (let i = 0; i < buyBuySell.length; i++) {
        const candidate = buyBuySell[i];


        //verifica se já temos todos os preços
        let priceBuy1 = await getBestAsk(candidate.buy1.symbol);
        if (!priceBuy1) continue;

        priceBuy1 = parseFloat(priceBuy1);

        let priceBuy2 = await getBestAsk(candidate.buy2.symbol);
        if (!priceBuy2) continue;

        priceBuy2 = parseFloat(priceBuy2);

        let priceSell1 = await getBestBid(candidate.sell1.symbol);
        if (!priceSell1) continue;

        console.log("p1", priceBuy1);
        console.log("p2", priceBuy2)
        console.log("p3", priceSell1);

        priceSell1 = parseFloat(priceSell1.price);

        //se tem o preço dos 3, pode analisar a lucratividade
        const crossRate = (1 / priceBuy1) * (1 / priceBuy2) * priceSell1;


        let buy1Response, buy2Response, sell1Response, quantity_buy1, quantity_buy2;

        quantity_buy1 = process.env.AMOUNT;

        let stepSize1 = parseFloat(candidate.buy1.stepSize);
        let stepSize2 = parseFloat(candidate.buy2.stepSize);
        let stepSize3 = parseFloat(candidate.sell1.stepSize);

        if (crossRate > PROFITABILITY && !isTaskRunning && stepSize2 <= stepSize1 && stepSize3 <= stepSize2) {

            isTaskRunning = true;


            console.log(`OP BBS EM ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell1.symbol} = ${crossRate}`);

            // Primeira compra

            try {
                buy1Response = await binance.marketBuy(candidate.buy1.symbol.toString(), null, { quoteOrderQty: parseFloat(quantity_buy1) });
                console.log(`Compra de ${candidate.buy1.base} efetuada com sucesso. Total comprado de  : ${buy1Response.executedQty} no preco ${priceBuy1.toFixed(8)}`);
            } catch (error) {
                console.error(`Erro ao comprar ${candidate.buy1.base}: ${JSON.stringify(error)}`);
            }


            // Segunda compra
            if (buy1Response.status === 'FILLED') {
                try {
                    buy2Response = await binance.marketBuy(candidate.buy2.symbol.toString(), null, { quoteOrderQty: buy1Response.executedQty });
                    console.log(`Compra de ${candidate.buy2.base} efetuada com sucesso. Total comprado de  : ${buy2Response.executedQty} no preco ${priceBuy2.toFixed(8)}`);
                } catch (error) {
                    console.error(`Erro ao comprar ${candidate.buy2.base}: ${JSON.stringify(error)}`);
                }
            }

            // // Venda
            if (buy2Response.status === 'FILLED') {
                try {
                    sell1Response = await binance.marketSell(candidate.sell1.symbol.toString(), buy2Response.executedQty);
                    console.log(`Venda de ${candidate.sell1.base} efetuada com sucesso. Total vendido de  : ${sell1Response.executedQty} no preco ${priceSell1}`);
                } catch (error) {
                    console.error(`Erro ao vender ${candidate.sell1.base}: ${JSON.stringify(error)}`);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarde o próximo intervalo
            isTaskRunning = false;
            return;
            process.exit(0);




            //Erro ao vender PHB: {"statusCode":400,"body":"{\"code\":-1013,\"msg\":\"Filter failure: LOT_SIZE\"}



            //process.exit(0);




        }

    }

}


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

// Inicializa o WebSocket
binance.websockets.prevDay(false, (error, response) => {
    // Atualiza o objeto de preços com os novos valores
    prices[response.symbol] = {
        bestAsk: parseFloat(response.bestAsk),
        bestBid: parseFloat(response.bestBid)
    };
});
async function start() {

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
        console.log(prices['BTCUSDT']);


    }, 3000)

}

start();