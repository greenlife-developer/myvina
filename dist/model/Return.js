"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ReturnSchema = new mongoose_1.Schema({
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
}, {
    timestamps: { createdAt: true, updatedAt: true },
});
var ReturnModel = mongoose_1.default.model('Return', ReturnSchema);
exports.default = ReturnModel;
