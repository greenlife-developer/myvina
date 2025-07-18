const messageExpress = require("express");
const messageRouter = messageExpress.Router();

const {
  getMessages,
  sendMessage,
} = require("../controllers/messageController");
const { default: protectMessageRoute } = require("../middleWare/authMiddleware");

// console.log("User Router Loaded", protectRoute);

messageRouter.get("/", getMessages);
messageRouter.post("/", sendMessage);



module.exports = messageRouter;
