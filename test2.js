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




let tickers = {};

binance.websockets.bookTickers((ticker) => {
    let { s: symbol, b: bidPrice, a: askPrice } = ticker;
    tickers[symbol] = { bidPrice, askPrice };
    console.log
});

// binance.websockets.bookTickers((ticker) => {
//   console.log(ticker);
// });



// setInterval(async () => {
//   console.log(new Date());
//   if (tickers['BTCUSDT']) {
//       console.log(tickers['BTCUSDT']);
//   } else {
//       console.log('Dados para BTCUSDT ainda não disponíveis');
//   }
// }, 3000);

// Agora você pode acessar os preços atuais a qualquer momento:

