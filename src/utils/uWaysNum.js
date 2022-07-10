const nCr = require("./nCr")

module.exports = (adverbs, adjectives, nouns) => {
  const eachType =
    nCr(adverbs.length, 1) * nCr(adjectives.length, 1) * nCr(nouns.length, 1)
  const adj2noun1 = nCr(adjectives.length, 2) * nCr(nouns.length, 1)
  const adv1noun2 = nCr(adverbs.length, 1) * nCr(nouns.length, 2)
  const adj1noun2 = nCr(adjectives.length, 1) * nCr(nouns.length, 2)

  return eachType + adj2noun1 + adv1noun2 + adj1noun2
}
