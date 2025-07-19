var messageExpress = require("express");
var messageRouter = messageExpress.Router();
var _a = require("../controllers/messageController"), getMessages = _a.getMessages, sendMessage = _a.sendMessage;
// console.log("User Router Loaded", protectRoute);
messageRouter.get("/", getMessages);
messageRouter.post("/", sendMessage);
module.exports = messageRouter;
