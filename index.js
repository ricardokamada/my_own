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

            console.log(`OP BBS EM ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell1.symbol} = ${crossRate}`);


            try {
                let quantity = parseFloat(process.env.AMOUNT / priceBuy1);
                quantity = formatNumber(quantity, candidate.buy1.quantityPrecision);
            
                // Compra do primeiro par
                let buy1Response = await binance.marketBuy(candidate.buy1.symbol.toString(), quantity.toString());
                console.log("Compra efetuada com sucesso. ID da ordem:", buy1Response.orderId);
                
                // Obter a quantidade comprada do primeiro par
                let buy1ExecutedQty = parseFloat(buy1Response.executedQty);
            
                // Calcular a quantidade para comprar do segundo par
                let quantitySecondPair = buy1ExecutedQty / priceBuy2;
                quantitySecondPair = formatNumber(quantitySecondPair, candidate.buy2.quantityPrecision);
            
                // Compra do segundo par
                let buy2Response = await binance.marketBuy(candidate.buy2.symbol.toString(), quantitySecondPair.toString());
                console.log("Compra do segundo par efetuada com sucesso. ID da ordem:", buy2Response.orderId);
            
                // Obter a quantidade comprada do segundo par
                let buy2ExecutedQty = parseFloat(buy2Response.executedQty);
            
                // Venda do segundo par
                let sell1Response = await binance.marketSell(candidate.sell1.symbol.toString(), buy2ExecutedQty.toString());
                console.log("Venda do segundo par efetuada com sucesso. ID da ordem:", sell1Response.orderId);
            } catch (error) {
                console.error('Houve um erro:', error); 
            }
            

            



            //####################################################################################
            //Realiza a segunda compra com o saldo da primeira compra.
            // let quantity2;
            // try {
                
                
            //     quantity2 = parseFloat(quantity / priceBuy2);
            //     quantity2 = formatNumber(quantity2, candidate.buy2.quantityPrecision); // deixa no padrao    

            //     teste2 = Number(candidate.buy2.minNotional);
            //     if(quantity2 < teste2){
            //         console.log("TOTAL menor q notional");
            //         process.exit(0);
            //     }

            //     await binance.marketBuy(candidate.buy2.symbol, quantity2.toString());
            //     console.log("Segunda compra realizada com sucesso !", candidate.buy2.symbol + "Foi comprado o total de :" + quantity2, typeof(quantity2));
            // } catch (error) {
            //     console.error('Houve um erro na segunda compra  2:', error);
            // }
            

            //#####################################################################################
            //Realiza a venda com o saldo da segunda compra.
            // let quantity3;
            // try {
            //     quantity3 = parseFloat(quantity2 * priceSell1);
            //     console.log("minimo notional : ", Number(candidate.sell1.minNotional));
            //     quantity3 = formatNumber(quantity3, candidate.sell1.quantityPrecision); // deixa no padrao   
            //     console.log("Total que esta sendo vendido :", quantity3);

            //     teste3 = Number(candidate.sell1.minNotional);

            //     if(quantity3 < teste3){
            //         console.log("TOTAL menor q notional");
            //         process.exit(0);
            //     }
            //     //process.exit(0);
            //     await binance.marketSell(candidate.sell1.symbol, quantity3.toString());
            //     console.log("Venda realizado com sucesso !", candidate.sell1.symbol, "TOTAL de :" + quantity3, typeof(quantity3));
            // } catch (error) {
            //     console.error('Houve um erro na venda compra 3:', error);
            // }


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