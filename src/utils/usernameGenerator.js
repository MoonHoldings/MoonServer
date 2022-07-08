const { doc, getDoc, updateDoc } = require("firebase/firestore")
const { db } = require("../config/firebase")
const nCr = require("./nCr")

function capFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = async () => {
  let the_username
  let doesExist
  let ways
  let tryNum = 0

  do {
    tryNum++
    const usernameRef = doc(db, "usernames", "username-words")
    const usernameSnap = await getDoc(usernameRef)

    const adverbs = usernameSnap.data().adverbs
    const adjectives = usernameSnap.data().adjectives
    const nouns = usernameSnap.data().nouns
    const usernames = usernameSnap.data().usernames

    ways =
      nCr(adverbs.length, 1) * nCr(adjectives.length, 1) * nCr(nouns.length, 1)

    //Random words index
    const randAdverbsIndex = Math.floor(Math.random() * adverbs.length)
    const randAdjectiveIndex = Math.floor(Math.random() * adjectives.length)
    const randNounsIndex = Math.floor(Math.random() * nouns.length)

    const doubleAdj = Math.floor(Math.random() * 4) + 1

    if (doubleAdj === 1) {
      const randAdjectiveIndexAgain = Math.floor(
        Math.random() * adjectives.length
      )

      if (tryNum > ways) {
        the_username =
          capFirstLetter(adjectives[randAdjectiveIndex]) +
          capFirstLetter(adjectives[randAdjectiveIndexAgain]) +
          capFirstLetter(nouns[randNounsIndex]) +
          (Math.floor(Math.random() * tryNum) + 1)
      } else {
        the_username =
          capFirstLetter(adjectives[randAdjectiveIndex]) +
          capFirstLetter(adjectives[randAdjectiveIndexAgain]) +
          capFirstLetter(nouns[randNounsIndex])
      }
    } else {
      if (tryNum > ways) {
        the_username =
          capFirstLetter(adverbs[randAdverbsIndex]) +
          capFirstLetter(adjectives[randAdjectiveIndex]) +
          capFirstLetter(nouns[randNounsIndex]) +
          (Math.floor(Math.random() * tryNum) + 1)
      } else {
        the_username =
          capFirstLetter(adverbs[randAdverbsIndex]) +
          capFirstLetter(adjectives[randAdjectiveIndex]) +
          capFirstLetter(nouns[randNounsIndex])
      }
    }

    doesExist = usernames.some((username) => the_username === username)

    if (!doesExist) {
      usernames.push(the_username)
      await updateDoc(usernameRef, {
        usernames,
      })
    }
  } while (doesExist === true)

  return the_username
}
