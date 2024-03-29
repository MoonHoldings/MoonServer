const {
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  updateDoc,
} = require("firebase/firestore")
const { Strategy } = require("passport-discord")
const usernameGenerator = require("../../utils/usernameGenerator")
const { Users, db } = require("../firebase")

// module.exports = (passport) => {

//   passport.use(
//     new Strategy(
//       {
//         clientID: process.env.DISCORD_CLIENT_ID,
//         clientSecret: process.env.DISCORD_CLIENT_SECRET,
//         callbackURL: "http://localhost:9000/api/auth/discord/redirect",
//         scope: ["identify", "email"],
//       },
//       async (accessToken, refreshToken, profile, done) => {
//         console.log(profile.email)
//         try {
//           const q = query(Users, where("email", "==", profile.email))
//           const qSnapshot = await getDocs(q)
//           qSnapshot.docs.forEach((d) => {
//             console.log(d.id)
//           })

//           if (qSnapshot.docs.length === 0) {
//             const username = await usernameGenerator(profile.email)
//             // create user
//             const newUserRef = await addDoc(Users, {
//               strategy: "discord",
//               username,
//               email: profile.email,
//               confirm: "",
//               confirmEmailExpire: null,
//               createdAt: serverTimestamp(),
//               portfolioStyle: "grid",
//               currency: "usd",
//               activity: {
//                 visits: 0,
//                 streaks: {
//                   _5days: 0,
//                   _30days: 0,
//                   _100days: 0,
//                 },
//               },
//               portfolio: {
//                 coins: [],
//                 nfts: [],
//               },
//             })
//             const newUserSnap = await getDoc(newUserRef)

//             console.log("newUserSnap", newUserSnap)
//             return done(null, newUserSnap.data())
//           }
//           if (
//             qSnapshot.docs.length === 1 &&
//             qSnapshot.docs[0].data().strategy === "local"
//           ) {
//             const docRef = await doc(db, "users", qSnapshot.docs[0].id)
//             await updateDoc(docRef, {
//               strategy: "local-discord",
//             })
//             const docSnap = await getDoc(docRef)
//             return done(null, docSnap.data())
//           }
//           if (
//             qSnapshot.docs.length === 1 &&
//             qSnapshot.docs[0].data().strategy === "discord"
//           ) {
//             return done(null, qSnapshot.docs[0].data())
//           }
//         } catch (error) {
//           return done(error, null)
//         }
//       }
//     )
//   )
// }

module.exports = (passport) => {
  passport.serializeUser(function (user, done) {
    done(null, user)
  })
  passport.deserializeUser(function (obj, done) {
    done(null, obj)
  })

  passport.use(
    new Strategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: "/api/auth/discord/redirect",
        scope: ["identify", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const q = query(
            Users,
            where("strategy", "==", "twitter"),
            where("email", "==", profile.email)
          )
          const qSnapshot = await getDocs(q)

          if (qSnapshot.docs.length !== 0) {
            done(null, qSnapshot.docs[0].data())
          } else {
            // Generate a username
            const username = await usernameGenerator(profile.email)

            // Create a user
            const newUserRef = await addDoc(Users, {
              strategy: "discord",
              username,
              email: profile.email,
              confirm: "",
              confirmEmailExpire: null,
              createdAt: serverTimestamp(),
              portfolioStyle: "grid",
              currency: "usd",
              activity: {
                visits: 0,
                streaks: {
                  _5days: 0,
                  _30days: 0,
                  _100days: 0,
                },
              },
              portfolio: {
                coins: [],
                nfts: [],
              },
            })

            const newUserSnap = await getDoc(newUserRef)
            return done(null, newUserSnap.data())
          }
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )
}
