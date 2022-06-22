const { query, where, getDocs, addDoc } = require("firebase/firestore");
const { Users } = require("../config/firebase");

const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");

// Register a user
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  const q = query(Users, where("email", "==", req.body.email));
  const docSnap = await getDocs(q);

  if (docSnap.docs.length !== 0) {
    next(new ErrorHandler("An account is associated with this email", 409));
  }

  const docRef = await addDoc(Users, {
    ...req.body,
  });

  res.json({
    success: true,
    user_id: docRef.id,
  });
});
