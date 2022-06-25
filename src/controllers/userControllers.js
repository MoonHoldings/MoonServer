const { query, where, getDocs, addDoc } = require("firebase/firestore");
const bcrypt = require("bcrypt");
const { Users } = require("../config/firebase");

const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");
const passport = require("passport");

// Register a user
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  // ----- Check if the email is associated to an existing account -----
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Each field needs to be fulfilled", 401));
  }
  const q = query(Users, where("email", "==", req.body.email));
  const docSnap = await getDocs(q);

  if (docSnap.docs.length !== 0) {
    return next(
      new ErrorHandler("An account is associated with this email", 409)
    );
  }

  // ------- save user info for registering -------

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Add a user document
  const docRef = await addDoc(Users, {
    name,
    email,
    password: hashedPassword,
  });

  res.status(200).json({
    success: true,
    user_id: docRef.id,
  });
});

// Login user
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      next(new ErrorHandler("error: " + info.message, 401));
    }
    if (!user) {
      next(new ErrorHandler("error: " + info.message, 401));
    }
    req.logIn(user, (err) => {
      if (err) {
        next(new ErrorHandler("error: " + err.message, 401));
      }

      return res.status(200).json({
        success: true,
      });
    });
  })(req, res, next);
});
