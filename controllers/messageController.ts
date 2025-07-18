import { Request, Response } from "express-serve-static-core";
const bcrypt = require("bcrypt");
const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
import Message, { IMessage } from "../model/Message";
const jwt = require("jsonwebtoken");

const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({});
    return res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err });
  }
};

const sendMessage = async (req: Request, res: Response) => {
  const { sender, recipient, content, hasAttachment } = req.body;

  try {
    const newMessage: IMessage = new Message({
      sender,
      recipient,
      content,
      hasAttachment: hasAttachment || false,
    });

    await newMessage.save();
    return res.status(201).json({ message: newMessage });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to send message", error: err });
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
