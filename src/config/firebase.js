const { initializeApp } = require("firebase/app")
const { getFirestore, collection } = require("firebase/firestore")

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID,
  measurementId: process.env.FB_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

exports.db = db
exports.Users = collection(db, "users")
exports.Coins = collection(db, "coins")
exports.Usernames = collection(db, "usernames")
exports.Historical = collection(db, "historical")
exports.BetaTesters = collection(db, "betaTesters")
exports.InvestorNetwork = collection(db, "investorNetwork")
exports.TestNetwork = collection(db, "testNetwork")
