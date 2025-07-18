import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;   
  recipient: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
  hasAttachment?: boolean;
}

const MessageSchema: Schema<IMessage> = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  hasAttachment: { type: Boolean, default: false },
});

const Message = mongoose.model<IMessage>("Message", MessageSchema);
export default Message;
