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




function formatNumber(value, step_size) {
    // Calcula o número de casas decimais com base em step_size
    const decimalPlaces = Math.max(0, -Math.floor(Math.log10(step_size)));
    // Formata o número com o número correto de casas decimais
    return value.toFixed(decimalPlaces);
}


//console.log(formatNumber(value, step_size)); // Saída: 123.46



async function processBuyBuySell(buyBuySell) {
    for (let i = 0; i < buyBuySell.length; i++) {
        const candidate = buyBuySell[i];

        //verifica se já temos todos os preços
        let priceBuy1 = stream.getBook(candidate.buy1.symbol);
        if (!priceBuy1) continue;
        priceBuy1 = parseFloat(priceBuy1.price);

        let priceBuy2 = stream.getBook(candidate.buy2.symbol);
        if (!priceBuy2) continue;
        priceBuy2 = parseFloat(priceBuy2.price);

        let priceSell1 = stream.getBook(candidate.sell1.symbol);
        if (!priceSell1) continue;

        priceSell1 = parseFloat(priceSell1.price);

        //se tem o preço dos 3, pode analisar a lucratividade
        const crossRate = (1 / priceBuy1) * (1 / priceBuy2) * priceSell1;
        if (crossRate > PROFITABILITY) {

            let quantity_buy1, buy1Response, buy1ExecutedQty, quantity_buy2, buy2Response, buy2ExecutedQty, quantity_sell1, sell1Response = 0;

            console.log(`OP BBS EM ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell1.symbol} = ${crossRate}`);

            quantity_buy1 = process.env.AMOUNT;

            try {
                if ((quantity_buy1 / priceBuy1) > candidate.buy1.minNotional) {
                    quantity_buy1 = parseFloat(process.env.AMOUNT / priceBuy1);
                    quantity_buy1 = formatNumber(quantity_buy1, candidate.buy1.quantityPrecision);

                    // Compra do primeiro par
                    buy1Response = await binance.marketBuy(candidate.buy1.symbol.toString(), quantity_buy1.toString());
                    console.log(`Compra de ${candidate.buy1.base} efetuada com sucesso. Total comprado de  : ${buy1Response.executedQty}`);
                } else {
                    console.log("Valor menor que nocional (1) ");
                }
            } catch (error) {
                console.error('Houve um erro na compra do primeiro par:', error);
            }


            try {
                // Calcular a quantidade para comprar do segundo par e / Arredondar a quantidade e o preço para a precisão correta
                quantity_buy2 = Math.floor(buy1Response.executedQty / priceBuy2) * candidate.buy2.stepSize;
                if (quantity_buy2 * priceBuy2 > candidate.buy2.minNotional) {
                    buy2Response = await binance.marketBuy(candidate.buy2.symbol.toString(), quantity_buy2.toString());
                    console.log(`Compra de ${candidate.buy2.base} efetuada com sucesso. Total comprado de  : ${buy2Response.executedQty}`);
                } else {
                    console.log("Valor menor que nocional (2) ");
                }
            } catch (error) {
                console.error('Houve um erro na segunda operação de compra :', error);
            }

            try {

                //Calcula a qntda a ser vendida
                quantity_sell1 = Math.floor(buy2Response.executedQty / candidate.sell1.stepSize) * candidate.sell1.stepSize;
                if (quantity_sell1 * priceBuy2 < candidate.sell1.minNotional) {
                    console.log("Valor menor que nocional (3) ");
                }else{

                }
                break;
                //sell1Response = await binance.marketSell(candidate.sell1.symbol.toString(), quantity_sell1.toString());
                console.log(`Venda de ${candidate.sell1.base} efetuada com sucesso. Total comprado de  : ${sell1Response.executedQty}`);

            } catch (error) {
                console.error('Houve um erro na operação de venda :', error);
            }


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
        processBuyBuySell(buyBuySell);
        //processBuySellSell(buySellSell);


    }, INTERVAL)
}

start();