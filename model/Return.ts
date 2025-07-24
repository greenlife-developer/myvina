import mongoose, { Schema, Document } from 'mongoose';

export interface IReturn extends Document {
  returnDate: Date;
  orderId: string;
  asin: string;
  sku: string;
  marketplaceId: string;
  condition: string;
  refundAmount?: number;
  status?: string;
  reason: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnSchema: Schema<IReturn> = new Schema(
  {
    returnDate: { type: Date, required: true },
    orderId: { type: String, required: true },
    asin: { type: String, required: true },
    sku: { type: String, required: true },
    marketplaceId: { type: String, required: true },
    condition: { type: String, required: true },
    refundAmount: { type: Number, default: 0 },
    status: { type: String, default: 'Pending' },
    reason: { type: String, required: true },
    quantity: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const ReturnModel = mongoose.model<IReturn>('Return', ReturnSchema);
export default ReturnModel;
