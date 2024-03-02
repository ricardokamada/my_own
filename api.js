const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET
});

async function exchangeInfo() {
  data =  await binance.exchangeInfo() 
  return data.symbols.filter(s => s.status === 'TRADING').map(s => {
    return {
      symbol: s.symbol,
      base: s.baseAsset,
      quote:s.quoteAsset
    }
  })
}


module.exports = { exchangeInfo }