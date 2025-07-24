var messageExpress = require("express");
var messageRouter = messageExpress.Router();
var _a = require("../controllers/messageController"), getMessages = _a.getMessages, sendMessage = _a.sendMessage;
var protectMessageRoute = require("../middleWare/authMiddleware").default;
// console.log("User Router Loaded", protectRoute);
messageRouter.get("/", getMessages);
messageRouter.post("/", sendMessage);
module.exports = messageRouter;
