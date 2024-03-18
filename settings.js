const Binance = require('node-binance-api');
require('dotenv').config();

// const binance = new Binance().options({
//   APIKEY: process.env.APIKEY,
//   APISECRET: process.env.APISECRET,
//   useServerTime: true,
// });


const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
  useServerTime: true,
  testnet: true,
  urls: {
    base: "https://testnet.binance.vision/api/",
    useServerTime: true,
  }
});




module.exports = binance;