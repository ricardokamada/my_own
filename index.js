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




// function formatNumber(value, step_size) {
//     // Verifica se o valor é um número
//     if (typeof value !== 'number') {
//         console.error('Erro: o valor deve ser um número');
//         return;
//     }

//     // Calcula o número de casas decimais com base em step_size
//     const decimalPlaces = Math.max(0, -Math.floor(Math.log10(step_size)));

//     // Formata o número com o número correto de casas decimais
//     return value.toFixed(decimalPlaces);
// }

//console.log(formatNumber(value, step_size)); // Saída: 123.46

function adjustStepSize(qty, min_val, max_val, step_size) {
    // Ajuste a quantidade para que ela esteja de acordo com as regras de LOT_SIZE
    qty = Math.max(qty, min_val);  // A quantidade não pode ser menor que min_val
    qty = Math.min(qty, max_val);  // A quantidade não pode ser maior que max_val

    // Determine o número de casas decimais do step_size
    let decimalPlaces = (step_size.toString().split('.')[1] || []).length;

    // Ajusta a quantidade para ter o número correto de casas decimais
    // Use a função Math.floor() em vez de round() para evitar arredondamento
    let trunc_modifier = Math.pow(10, decimalPlaces);
    return Math.floor(qty * trunc_modifier) / trunc_modifier;
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


        let quantity_buy1, buy1Response, quantity_buy2, buy2Response, sell1Response = 0;



        if (crossRate >= PROFITABILITY) {
            console.log(`OP BBS EM ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell1.symbol} = ${crossRate}`);
            quantity_buy1 = process.env.AMOUNT / priceBuy1;
            quantity_buy1 = adjustStepSize(quantity_buy1, candidate.buy1.minLotSize, candidate.buy1.maxLotSize, candidate.buy1.stepSize);
        
            let maxAttempts = 3; // Número máximo de tentativas
            const intervalBetweenOrders = 1000; // 1 segundos em milissegundos
        
            // Primeira compra
            let attempts = 0; // Contador de tentativas
            while (attempts < maxAttempts) {
                try {
                    attempts++;
                    buy1Response = await binance.marketBuy(candidate.buy1.symbol.toString(), quantity_buy1.toString());
                    console.log(`Compra de ${candidate.buy1.base} efetuada com sucesso. Total comprado de  : ${buy1Response.executedQty}`);
                    break; // Se a operação for bem-sucedida, saia do loop
                } catch (error) {
                    console.error(`Erro ao comprar ${candidate.buy1.base}: ${JSON.stringify(error)}`);
                    if (attempts === maxAttempts) {
                        console.error('Número máximo de tentativas atingido. Interrompendo a execução.');
                        throw error; // Se o número máximo de tentativas for atingido, lance o erro e interrompa a execução
                    }
                    console.log('Tentando novamente a compra...');
                }
            }
        
            // Segunda compra
            attempts = 0; // Redefina o contador de tentativas
            quantity_buy2 = adjustStepSize((buy1Response.executedQty / priceBuy2), candidate.buy2.minLotSize, candidate.buy2.maxLotSize, candidate.buy2.stepSize);
            while (attempts < maxAttempts) {
                try {
                    attempts++;
                    buy2Response = await binance.marketBuy(candidate.buy2.symbol.toString(), quantity_buy2.toString());
                    console.log(`Compra de ${candidate.buy2.base} efetuada com sucesso. Total comprado de  : ${buy2Response.executedQty}`);
                    break; // Se a operação for bem-sucedida, saia do loop
                } catch (error) {
                    console.error(`Erro ao comprar ${candidate.buy2.base}: ${JSON.stringify(error)}`);
                    if (attempts === maxAttempts) {
                        console.error('Número máximo de tentativas atingido. Interrompendo a execução.');
                        throw error; // Se o número máximo de tentativas for atingido, lance o erro e interrompa a execução
                    }
                    console.log('Tentando novamente a compra...');
                }
            }
        
            // Venda
            attempts = 0; // Redefina o contador de tentativas
            while (attempts < maxAttempts) {
                try {
                    attempts++;
                    quantity_buy2 = adjustStepSize(quantity_buy2, candidate.sell1.minLotSize, candidate.sell1.maxLotSize, candidate.sell1.stepSize);
                    //VENDA VENDA VENDA #####################################################################
                    sell1Response = await binance.marketSell(candidate.sell1.symbol, quantity_buy2.toString());
                    console.log(`Venda de ${candidate.sell1.base} efetuada com sucesso. Total vendido de  : ${sell1Response.executedQty}`);
                    break; // Se a venda for bem-sucedida, saia do loop
                } catch (error) {
                    console.error(`Erro ao vender ${candidate.sell1.base}: ${JSON.stringify(error)}`);
                    if (attempts === maxAttempts) {
                        console.error('Número máximo de tentativas atingido. Interrompendo a execução.');
                        throw error; // Se o número máximo de tentativas for atingido, lance o erro e interrompa a execução
                    }
                    console.log('Tentando novamente a venda...');
                }
            }

            //await new Promise(resolve => setTimeout(resolve, 5000)); // Aguarde o próximo intervalo
            //process.exit(0);
            return;
            
            
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