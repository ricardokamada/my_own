const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
  useServerTime: true,
  testnet: true,
  urls: {
    base: "https://testnet.binance.vision/api/",
  }
});


// This is a websocket, binance will send you constant updates
binance.websockets.prevDay(false, (error, response) => {
  if (response.symbol === 'BTCUSDT'){
  console.log("Símbolo:", response.symbol);
  console.log("Melhor preço de venda (ask):", response.bestAsk);}
});



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