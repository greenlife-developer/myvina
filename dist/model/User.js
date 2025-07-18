"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var PlatformPermissionsSchema = new mongoose_1.Schema({
    officePlatform: { type: Boolean, default: false },
    amazonPlatform: { type: Boolean, default: true },
    meeshoPlatform: { type: Boolean, default: false },
    websitePlatform: { type: Boolean, default: false },
    dashboard: { type: Boolean, default: false },
    categories: { type: Boolean, default: false },
    products: { type: Boolean, default: false },
    stocks: { type: Boolean, default: false },
    customers: { type: Boolean, default: false },
    vendors: { type: Boolean, default: false },
    salesInvoice: { type: Boolean, default: false },
    purchaseInvoice: { type: Boolean, default: false },
    creditDebitNote: { type: Boolean, default: false },
    expenses: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    settings: { type: Boolean, default: false },
    amazonDashboard: { type: Boolean, default: false },
    orders: { type: Boolean, default: false },
    catalog: { type: Boolean, default: false },
    inventory: { type: Boolean, default: false },
    advertising: { type: Boolean, default: false },
    amazonVendors: { type: Boolean, default: false },
    returns: { type: Boolean, default: false },
    payments: { type: Boolean, default: false },
    amazonReports: { type: Boolean, default: false },
    messaging: { type: Boolean, default: false },
});
var UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // optional but unique if present
    password: { type: String },
    role: { type: String, required: true },
    permissions: { type: PlatformPermissionsSchema, required: true },
}, { timestamps: { createdAt: true, updatedAt: true } });
var User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
