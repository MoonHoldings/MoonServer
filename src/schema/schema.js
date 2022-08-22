const { default: axios } = require("axios")
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLID,
} = require("graphql")

// Coin Type
const CoinType = new GraphQLObjectType({
  name: "Coin",
  fields: () => ({
    id: { type: GraphQLString },
    currency: { type: GraphQLString },
    symbol: { type: GraphQLString },
    name: { type: GraphQLString },
    logo_url: { type: GraphQLString },
    price: { type: GraphQLString },
    circulating_supply: { type: GraphQLString },
    rank: { type: GraphQLString },
    _1d: { type: GraphQLString },
    _30d: { type: GraphQLString },
  }),
})

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    coins: {
      type: new GraphQLList(CoinType),
      async resolve(parent, args) {
        const coinsArr = []
        const response = await axios.get(
          `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_KEY}&interval=1d,30d&per-page=100&page=1&sort=rank`
        )

        response.data.forEach((coin) => {
          coinsArr.push({
            id: coin.id,
            currency: coin.currency,
            symbol: coin.symbol,
            name: coin.name,
            logo_url: coin.logo_url,
            price: coin.price,
            circulating_supply: coin.circulating_supply,
            rank: coin.rank,
            _1d: coin["1d"]["price_change_pct"],
            _30d: coin["30d"]["price_change_pct"],
          })
        })

        return coinsArr
      },
    },
    // coin: {
    //   type: CoinType,
    //   args: { id: { type: GraphQLID } },
    //   async resolve() {
    //     const response = await axios.get(
    //       `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_KEY}&ids=${}&interval=1d,30d&per-page=100&page=1&sort=rank`
    //     )
    //   },
    // },
  },
})

//Mutations
// const mutation = new GraphQLObjectType({
//   name: "Mutation",
//   fields: {},
// })

module.exports = new GraphQLSchema({
  query: RootQuery,
  // mutation,
})
