"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var MessageSchema = new mongoose_1.Schema({
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    hasAttachment: { type: Boolean, default: false },
});
var Message = mongoose_1.default.model("Message", MessageSchema);
exports.default = Message;
