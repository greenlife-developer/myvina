const expressLib = require("express");
const userRouter = expressLib.Router();

const {
  createUser,
  loginUser,
  getUsers,
  updateUser,
  deleteUser,
  loginStatus,
  logoutUser,
} = require("../controllers/userController");
const { default: protectRoute } = require("../middleWare/authMiddleware");

// console.log("User Router Loaded", protectRoute);

userRouter.post("/create", createUser);
userRouter.patch("/update/:id", protectRoute, updateUser);
userRouter.post("/login", loginUser);
userRouter.get("/loggedin-status", loginStatus);
userRouter.post("/logout", protectRoute, logoutUser);
userRouter.delete("/delete/:id", protectRoute, deleteUser);
userRouter.get("/", getUsers);


module.exports = userRouter;
