var expressLib = require("express");
var userRouter = expressLib.Router();
var _a = require("../controllers/userController"), createUser = _a.createUser, loginUser = _a.loginUser, getUsers = _a.getUsers, updateUser = _a.updateUser, deleteUser = _a.deleteUser, loginStatus = _a.loginStatus, logoutUser = _a.logoutUser;
var protectRoute = require("../middleWare/authMiddleware").default;
// console.log("User Router Loaded", protectRoute);
userRouter.post("/create", createUser);
userRouter.patch("/update/:id", protectRoute, updateUser);
userRouter.post("/login", loginUser);
userRouter.get("/loggedin-status", loginStatus);
userRouter.post("/logout", protectRoute, logoutUser);
userRouter.delete("/delete/:id", protectRoute, deleteUser);
userRouter.get("/", getUsers);
module.exports = userRouter;
