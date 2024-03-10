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




async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



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
            
            console.log(`OP BBS EM ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell1.symbol} = ${crossRate}`);
            let quantity = parseFloat(process.env.AMOUNT / priceBuy1).toFixed(4);
            

            try {    
            //realiza a primeira compra   
            quantity = Math.max(candidate.buy1.minLotSize, quantity);  // garante a compra usando valor de minLotSize  
            quantity = parseFloat(quantity.toFixed(4)); 
            await binance.marketBuy(candidate.buy1.symbol, quantity);
            console.log("Primeira compra realizada com sucesso !", candidate.buy1.symbol + "Foi comprado o total de :" + quantity);
            //await stream.execute_purchase_order(candidate.buy1.symbol, quantity);
            } catch (error) {
                console.error('Houve um erro na primeira compra :', error);
            }
            

            //####################################################################################

            //const quantidadeOutraMoeda = Math.floor(btcAmount / stepSize); // Arredonda para baixo para garantir que seja um número inteiro
            try {
            //Realiza a segunda compra com o saldo da primeira compra.
            quantity = Math.round(quantity / priceBuy2) * candidate.buy2.quantityPrecision;
            await binance.marketBuy(candidate.buy2.symbol, quantity);
            console.log("Segunda compra realizada com sucesso !", candidate.buy2.symbol, "TOTAL de :" + quantity );
            //await stream.execute_purchase_order(candidate.buy2.symbol, balance);
            } catch (error) {
                console.error('Houve um erro na segunda compra :', error);
            }


            //#####################################################################################

            try {
                //Realiza a ultima venda.
                quantity = Math.floor(quantity);
                console.log("Vendendo no par",candidate.sell1.symbol, "quantidade de :",  quantity);
                console.log("Min LOTSIZE: ", candidate.sell1.minLotSize);
                console.log("QntdPrecision : ", candidate.sell1.quantityPrecision);
                await binance.marketSell(candidate.sell1.symbol, quantity);
                console.log("Venda realizado com sucesso !", candidate.sell1.symbol, "TOTAL de :" + quantity );
                } catch (error) {
                    console.error('Houve um erro na venda compra :', error);
                }
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

start()