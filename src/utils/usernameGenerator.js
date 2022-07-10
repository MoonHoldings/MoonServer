const { doc, getDoc, updateDoc } = require("firebase/firestore")
const { db } = require("../config/firebase")
const uWaysNum = require("./uWaysNum")

function capFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = async (email) => {
  let tryNum = 0
  let the_username
  let doesExist

  let randAdverbIndex
  let randAdjectiveIndex
  let randNounIndex

  const uRef = doc(db, "usernames", "username-words")
  const uSnap = await getDoc(uRef)

  const adverbs = uSnap.data().adverbs
  const adjectives = uSnap.data().adjectives
  const nouns = uSnap.data().nouns
  const usernames = uSnap.data().usernames

  const uWays = uWaysNum(adverbs, adjectives, nouns)

  do {
    tryNum++

    randAdverbIndex = Math.floor(Math.random() * adverbs.length)
    randAdjectiveIndex = Math.floor(Math.random() * adjectives.length)
    randNounIndex = Math.floor(Math.random() * nouns.length)

    const doubleWordsNumRand = Math.floor(Math.random() * 6) + 1

    if (doubleWordsNumRand === 1) {
      let randAdjectiveIndex2

      do {
        randAdjectiveIndex2 = Math.floor(Math.random() * adjectives.length)
      } while (randAdjectiveIndex === randAdjectiveIndex2)

      the_username = makeUsername(
        "",
        adjectives[randAdjectiveIndex],
        adjectives[randAdjectiveIndex2],
        nouns[randNounIndex],
        "",
        tryNum,
        uWays
      )
    } else if (doubleWordsNumRand === 2) {
      let randNounIndex2

      do {
        randNounIndex2 = Math.floor(Math.random() * nouns.length)
      } while (randNounIndex === randNounIndex2)

      the_username = makeUsername(
        adverbs[randAdverbIndex],
        "",
        "",
        nouns[randNounIndex],
        nouns[randNounIndex2],
        tryNum,
        uWays
      )
    } else if (doubleWordsNumRand === 3) {
      let randNounIndex2

      do {
        randNounIndex2 = Math.floor(Math.random() * nouns.length)
      } while (randNounIndex === randNounIndex2)

      the_username = makeUsername(
        "",
        adjectives[randAdjectiveIndex],
        "",
        nouns[randNounIndex],
        nouns[randNounIndex2],
        tryNum,
        uWays
      )
    } else {
      the_username = makeUsername(
        adverbs[randAdverbIndex],
        adjectives[randAdjectiveIndex],
        "",
        nouns[randNounIndex],
        "",
        tryNum,
        uWays
      )
    }

    doesExist = usernames.some((username) => the_username === username)
  } while (doesExist === true)

  if (!doesExist) {
    usernames.push(the_username)
    await updateDoc(uRef, {
      usernames,
    })
  }

  const reservedRef = doc(db, "reservedUsernames", email)
  const reservedSnap = await getDoc(reservedRef)

  if (reservedSnap.exists()) {
    the_username = reservedSnap.data().username
  }

  return the_username
}

function makeUsername(adv, adj, adj2, noun, noun2, tryNum, uWays) {
  let result

  if (adj2 === "" && noun2 === "") {
    result =
      tryNum <= uWays
        ? capFirstLetter(adv) +
          capFirstLetter(adj) +
          capFirstLetter(noun) +
          (Math.floor(Math.random() * tryNum) + 1)
        : capFirstLetter(adv) + capFirstLetter(adj) + capFirstLetter(noun)
  } else if (adj === "" && adj2 === "") {
    result =
      tryNum <= uWays
        ? capFirstLetter(adv) +
          capFirstLetter(noun) +
          capFirstLetter(noun2) +
          (Math.floor(Math.random() * tryNum) + 1)
        : capFirstLetter(adv) + capFirstLetter(noun) + capFirstLetter(noun2)
  } else if (adv === "" && noun2 === "") {
    result =
      tryNum <= uWays
        ? capFirstLetter(adj) +
          capFirstLetter(adj2) +
          capFirstLetter(noun) +
          (Math.floor(Math.random() * tryNum) + 1)
        : capFirstLetter(adj) + capFirstLetter(adj2) + capFirstLetter(noun)
  } else {
    result =
      tryNum <= uWays
        ? capFirstLetter(adj) +
          capFirstLetter(noun) +
          capFirstLetter(noun2) +
          (Math.floor(Math.random() * tryNum) + 1)
        : capFirstLetter(adj) + capFirstLetter(noun) + capFirstLetter(noun2)
  }

  return result
}
