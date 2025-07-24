"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var parseTSVtoJSON_1 = require("../utils/amz/parseTSVtoJSON");
var axios = require("axios");
var fs = require("fs");
var moment = require("moment");
var auth_1 = require("../utils/amz/auth");
var _a = require("../utils/amz/feeds"), createFeedDocument = _a.createFeedDocument, uploadFeed = _a.uploadFeed;
var shipmentData = require("../utils/amz/shipmentData").shipmentData;
var _b = require("../utils/amz/listingData"), listingData = _b.listingData, patchListingData = _b.patchListingData;
var zlib = require("zlib");
var Return_1 = require("../model/Return");
var marketplace_id = "A1PA6795UKMFR9"; // This is used for the case of a single id
var marketplaceIds = [
    "A13V1IB3VIYZZH",
    "APJ6JRA9NG5V4",
    "A1RKKUPIHCS9HS",
    "AMEN7PMS3EDWL",
    "A1PA6795UKMFR9",
    "A1805IZSGTT6HS",
    "A1F83G8C2ARO7P",
    "A1C3SOZRARQ6R3",
    "A2NODRKZP88ZB9",
];
var endpoint = "https://sellingpartnerapi-eu.amazon.com";
var sku = "T5-TUY3-3FH8";
// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var USE_DUMMY_DATA = false;
var auth = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var response, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios.post("https://api.amazon.com/auth/o2/token", {
                        grant_type: "refresh_token",
                        refresh_token: process.env.REFRESH_TOKEN,
                        client_id: process.env.SELLING_PARTNER_APP_CLIENT_ID,
                        client_secret: process.env.SELLING_PARTNER_APP_CLIENT_SECRET,
                    })];
            case 1:
                response = _a.sent();
                res.status(200).json(response.data);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Error fetching access token:", error_1.message);
                res
                    .status(500)
                    .json({ error: "Failed to authenticate", details: error_1.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getOrders = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, marketplaceids, createdAfter, createdBefore, createdAfterFormatted, createdBeforeFormatted, authTokens_1, baseUrl_1, queryParams_1, orders_1, nextToken_1, maxRetries_1, retryCount_1, fetchOrders_1, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, marketplaceids = _a.marketplaceids, createdAfter = _a.createdAfter, createdBefore = _a.createdBefore;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, , 8]);
                createdAfterFormatted = createdAfter
                    ? new Date(createdAfter).toISOString()
                    : "2025-07-01T00:00:00Z";
                createdBeforeFormatted = createdBefore
                    ? new Date(createdBefore).toISOString()
                    : undefined;
                return [4 /*yield*/, (0, auth_1.authenticate)()];
            case 2:
                authTokens_1 = _b.sent();
                baseUrl_1 = "".concat(endpoint, "/orders/v0/orders");
                queryParams_1 = {
                    MarketplaceIds: Array.isArray(marketplaceids)
                        ? marketplaceids.join(",")
                        : marketplaceids,
                    CreatedAfter: createdAfterFormatted,
                    MaxResultsPerPage: "100", // Reduce number of requests
                };
                if (createdBeforeFormatted) {
                    queryParams_1.CreatedBefore = createdBeforeFormatted;
                }
                orders_1 = [];
                nextToken_1 = null;
                maxRetries_1 = 7;
                retryCount_1 = 0;
                fetchOrders_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var queryString, url, response, ordersData, error_3, retryAfter_1;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (nextToken_1) {
                                    queryParams_1.NextToken = nextToken_1;
                                }
                                else {
                                    delete queryParams_1.NextToken;
                                }
                                queryString = new URLSearchParams(__assign(__assign({}, queryParams_1), { NextToken: queryParams_1.NextToken || "" })).toString();
                                url = "".concat(baseUrl_1, "?").concat(queryString);
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 8]);
                                return [4 /*yield*/, axios.get(url, {
                                        headers: {
                                            "x-amz-access-token": authTokens_1.access_token,
                                            "Content-Type": "application/json",
                                        },
                                    })];
                            case 2:
                                response = _b.sent();
                                ordersData = response.data.payload.Orders || [];
                                orders_1 = orders_1.concat(ordersData);
                                nextToken_1 = ((_a = response.data.payload.NextToken) === null || _a === void 0 ? void 0 : _a.trim()) || null;
                                retryCount_1 = 0; // Reset retry count on successful request
                                return [3 /*break*/, 8];
                            case 3:
                                error_3 = _b.sent();
                                if (!(error_3.response && error_3.response.status === 429)) return [3 /*break*/, 6];
                                retryCount_1++;
                                if (retryCount_1 > maxRetries_1) {
                                    throw new Error("Max retries exceeded");
                                }
                                retryAfter_1 = error_3.response.headers["retry-after"] ||
                                    Math.pow(2, retryCount_1);
                                console.warn("Rate limited. Retrying after ".concat(retryAfter_1, " seconds..."));
                                return [4 /*yield*/, new Promise(function (resolve) {
                                        return setTimeout(resolve, retryAfter_1 * 1000);
                                    })];
                            case 4:
                                _b.sent();
                                return [4 /*yield*/, fetchOrders_1()];
                            case 5:
                                _b.sent(); // Retry the current request
                                return [3 /*break*/, 7];
                            case 6: throw error_3;
                            case 7: return [3 /*break*/, 8];
                            case 8: return [2 /*return*/];
                        }
                    });
                }); };
                _b.label = 3;
            case 3: return [4 /*yield*/, fetchOrders_1()];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                if (nextToken_1 && nextToken_1 !== null) return [3 /*break*/, 3];
                _b.label = 6;
            case 6:
                res.status(200).json(orders_1);
                return [3 /*break*/, 8];
            case 7:
                error_2 = _b.sent();
                if (error_2 instanceof Error) {
                    console.error("Error getting orders: ".concat(error_2.message));
                }
                else {
                    console.error("Error getting orders: ".concat(String(error_2)));
                }
                res
                    .status(500)
                    .json({ message: "Error getting orders", error: error_2.message });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
var getInventory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var marketplaceids, authTokens, baseUrl, queryParams, inventoryData, nextToken, retryCount, maxRetries, _loop_1, error_4;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                marketplaceids = req.query.marketplaceids;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 7, , 8]);
                return [4 /*yield*/, (0, auth_1.authenticate)()];
            case 2:
                authTokens = _c.sent();
                baseUrl = "".concat(endpoint, "/fba/inventory/v1/summaries");
                queryParams = {
                    details: "true",
                    granularityType: "Marketplace",
                    granularityId: marketplaceids,
                    marketplaceIds: marketplaceids,
                };
                inventoryData = [];
                nextToken = null;
                retryCount = 0;
                maxRetries = 5;
                _loop_1 = function () {
                    var queryString, url, response, inventory, error_5, retryAfter_2;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                if (nextToken) {
                                    queryParams["nextToken"] = nextToken;
                                }
                                else {
                                    delete queryParams["nextToken"];
                                }
                                queryString = new URLSearchParams(queryParams).toString();
                                url = "".concat(baseUrl, "?").concat(queryString);
                                _d.label = 1;
                            case 1:
                                _d.trys.push([1, 3, , 7]);
                                return [4 /*yield*/, axios.get(url, {
                                        headers: {
                                            "x-amz-access-token": authTokens.access_token,
                                            "Content-Type": "application/json",
                                        },
                                    })];
                            case 2:
                                response = _d.sent();
                                inventory = response.data.payload.inventorySummaries || [];
                                inventoryData = inventoryData.concat(inventory);
                                nextToken = ((_b = (_a = response.data.pagination) === null || _a === void 0 ? void 0 : _a.nextToken) === null || _b === void 0 ? void 0 : _b.trim()) || null;
                                retryCount = 0;
                                return [3 /*break*/, 7];
                            case 3:
                                error_5 = _d.sent();
                                if (!(error_5.response && error_5.response.status === 429)) return [3 /*break*/, 5];
                                retryCount++;
                                if (retryCount > maxRetries) {
                                    throw new Error("Max retries exceeded");
                                }
                                retryAfter_2 = error_5.response.headers["retry-after"] || Math.pow(2, retryCount);
                                console.warn("Rate limited. Retrying after ".concat(retryAfter_2, " seconds..."));
                                return [4 /*yield*/, new Promise(function (resolve) {
                                        return setTimeout(resolve, retryAfter_2 * 1000);
                                    })];
                            case 4:
                                _d.sent();
                                return [3 /*break*/, 6];
                            case 5: throw error_5;
                            case 6: return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                };
                _c.label = 3;
            case 3: return [5 /*yield**/, _loop_1()];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5:
                if (nextToken && nextToken !== "null") return [3 /*break*/, 3];
                _c.label = 6;
            case 6:
                res.status(200).json(inventoryData);
                return [3 /*break*/, 8];
            case 7:
                error_4 = _c.sent();
                console.error("Error getting inventory:", error_4.response ? error_4.response.data : error_4.message);
                res
                    .status(500)
                    .json({ message: "Error getting inventory", error: error_4.message });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
var getCustomerReturnsReport = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    function getSummaryMetrics(data) {
        var returnCountMap = new Map();
        var damageCountMap = new Map();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var item = data_1[_i];
            var key = item.sku || item.asin;
            // Count returns
            returnCountMap.set(key, (returnCountMap.get(key) || 0) + (item.quantity || 1));
            // Count damages
            if (item.reason &&
                typeof item.reason === "string" &&
                item.reason.toLowerCase().includes("damage")) {
                damageCountMap.set(key, (damageCountMap.get(key) || 0) + (item.quantity || 1));
            }
        }
        var mostReturned = Array.from(returnCountMap.entries()).sort(function (a, b) { return b[1] - a[1]; })[0];
        var mostDamaged = Array.from(damageCountMap.entries()).sort(function (a, b) { return b[1] - a[1]; })[0];
        var mostProfitable = Array.from(returnCountMap.entries()).sort(function (a, b) { return a[1] - b[1]; })[0]; // least returned = most profitable
        return {
            mostReturnedProduct: (mostReturned === null || mostReturned === void 0 ? void 0 : mostReturned[0]) || null,
            mostDamagedProduct: (mostDamaged === null || mostDamaged === void 0 ? void 0 : mostDamaged[0]) || null,
            mostProfitableProduct: (mostProfitable === null || mostProfitable === void 0 ? void 0 : mostProfitable[0]) || null,
        };
    }
    var _a, marketplaceIds, startDate, endDate, REPORT_TYPE, dummyReturns, summary, useManualData, start, end, returnsFromDB, summary, authTokens, headers, createReportResponse, reportId, reportDocumentId, attempts, maxAttempts, getReportResponse, status_1, getDocResponse, downloadUrl, compressionAlgorithm, fileResponse, fileData, returnsJson, summary, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, marketplaceIds = _a.marketplaceIds, startDate = _a.startDate, endDate = _a.endDate;
                REPORT_TYPE = "GET_XML_RETURNS_DATA_BY_RETURN_DATE";
                _b.label = 1;
            case 1:
                _b.trys.push([1, 16, , 17]);
                if (USE_DUMMY_DATA) {
                    dummyReturns = [
                        {
                            returnDate: "2025-07-15T10:00:00Z",
                            orderId: "123-4567890-1234567",
                            asin: "B00TEST123",
                            sku: "SKU-001",
                            marketplaceId: "ATVPDKIKX0DER",
                            condition: "New",
                            reason: "Customer changed mind",
                            quantity: 3, // Most returned
                        },
                        {
                            returnDate: "2025-07-16T14:30:00Z",
                            orderId: "123-4567890-7654321",
                            asin: "B00TEST456",
                            sku: "SKU-002",
                            marketplaceId: "ATVPDKIKX0DER",
                            condition: "Used",
                            reason: "Item was damaged during delivery",
                            quantity: 2, // Most damaged
                        },
                        {
                            returnDate: "2025-07-17T09:15:00Z",
                            orderId: "123-4567890-1112223",
                            asin: "B00TEST789",
                            sku: "SKU-003",
                            marketplaceId: "ATVPDKIKX0DER",
                            condition: "New",
                            reason: "Wrong size",
                            quantity: 1, // Least returned → Most profitable
                        },
                    ];
                    summary = getSummaryMetrics(dummyReturns);
                    return [2 /*return*/, res.status(200).json(__assign({ reportId: "dummy-report-id", reportDocumentId: "dummy-doc-id", compressionAlgorithm: "none", count: dummyReturns.length, returnsData: dummyReturns }, summary))];
                }
                useManualData = true;
                if (!useManualData) return [3 /*break*/, 3];
                start = new Date(startDate);
                end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999); // ← include the full day
                console.log("Fetching returns from DB:", {
                    marketplaceIds: marketplaceIds,
                    start: start,
                    end: end
                });
                return [4 /*yield*/, Return_1.default.find({
                        marketplaceId: Array.isArray(marketplaceIds)
                            ? { $in: marketplaceIds }
                            : marketplaceIds,
                        returnDate: {
                            $gte: start,
                            $lte: end,
                        },
                    })];
            case 2:
                returnsFromDB = _b.sent();
                summary = getSummaryMetrics(returnsFromDB);
                return [2 /*return*/, res.status(200).json(__assign({ compressionAlgorithm: "none", count: returnsFromDB.length, returnsData: returnsFromDB }, summary))];
            case 3: return [4 /*yield*/, (0, auth_1.authenticate)()];
            case 4:
                authTokens = _b.sent();
                headers = {
                    Authorization: "Bearer ".concat(authTokens.access_token),
                    "x-amz-access-token": authTokens.access_token,
                    "Content-Type": "application/json",
                };
                return [4 /*yield*/, axios.post("https://sellingpartnerapi-na.amazon.com/reports/2021-06-30/reports", {
                        reportType: REPORT_TYPE,
                        dataStartTime: startDate ||
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        dataEndTime: endDate || new Date().toISOString(),
                        marketplaceIds: Array.isArray(marketplaceIds)
                            ? marketplaceIds
                            : [marketplaceIds],
                    }, { headers: headers })];
            case 5:
                createReportResponse = _b.sent();
                reportId = createReportResponse.data.reportId;
                reportDocumentId = null;
                attempts = 0;
                maxAttempts = 10;
                _b.label = 6;
            case 6:
                if (!(!reportDocumentId && attempts < maxAttempts)) return [3 /*break*/, 12];
                attempts++;
                return [4 /*yield*/, axios.get("https://sellingpartnerapi-na.amazon.com/reports/2021-06-30/reports/".concat(reportId), { headers: headers })];
            case 7:
                getReportResponse = _b.sent();
                status_1 = getReportResponse.data.processingStatus;
                if (!(status_1 === "DONE")) return [3 /*break*/, 8];
                reportDocumentId = getReportResponse.data.reportDocumentId;
                return [3 /*break*/, 11];
            case 8:
                if (!["CANCELLED", "FATAL"].includes(status_1)) return [3 /*break*/, 9];
                throw new Error("Report processing failed: ".concat(status_1));
            case 9: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 20000); })];
            case 10:
                _b.sent();
                _b.label = 11;
            case 11: return [3 /*break*/, 6];
            case 12:
                if (!reportDocumentId) {
                    throw new Error("Report was not ready after maximum attempts");
                }
                return [4 /*yield*/, axios.get("https://sellingpartnerapi-na.amazon.com/reports/2021-06-30/documents/".concat(reportDocumentId), { headers: headers })];
            case 13:
                getDocResponse = _b.sent();
                downloadUrl = getDocResponse.data.url;
                compressionAlgorithm = getDocResponse.data.compressionAlgorithm;
                return [4 /*yield*/, axios.get(downloadUrl, {
                        responseType: "arraybuffer",
                    })];
            case 14:
                fileResponse = _b.sent();
                fileData = void 0;
                if (compressionAlgorithm === "GZIP") {
                    fileData = zlib.gunzipSync(fileResponse.data).toString("utf-8");
                }
                else {
                    fileData = Buffer.from(fileResponse.data).toString("utf-8");
                }
                returnsJson = (0, parseTSVtoJSON_1.parseTSVtoJSON)(fileData);
                summary = getSummaryMetrics(returnsJson);
                return [2 /*return*/, res.status(200).json(__assign({ reportId: reportId, reportDocumentId: reportDocumentId, compressionAlgorithm: compressionAlgorithm || "none", count: returnsJson.length, returnsData: returnsJson }, summary))];
            case 15: return [3 /*break*/, 17];
            case 16:
                error_6 = _b.sent();
                console.error("Error fetching returns report:", error_6.message);
                return [2 /*return*/, res.status(500).json({
                        message: error_6.message,
                        response: error_6.response ? error_6.response.data : null,
                        stack: error_6.stack,
                    })];
            case 17: return [2 /*return*/];
        }
    });
}); };
var getPaymentDetails = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var authTokens, headers, financesResponse, financialEvents, paymentBalance, nextPayoutDate, totalGrossSales, totalRefunds, totalFees, groups, latestSettlement, _i, _a, shipmentEvent, _b, _c, charge, _d, _e, refundEvent, _f, _g, adj, _h, _j, feeEvent, _k, _l, fee, netProfitEstimate, error_7;
    var _m, _o, _p, _q, _r, _s;
    return __generator(this, function (_t) {
        switch (_t.label) {
            case 0:
                _t.trys.push([0, 3, , 4]);
                if (USE_DUMMY_DATA) {
                    return [2 /*return*/, res.status(200).json({
                            paymentBalance: 13240.0,
                            currency: "INR",
                            nextPayoutDate: "2025-07-21T23:59:59Z",
                            totalGrossSales: 18000,
                            totalRefunds: 1600,
                            totalFees: 3160,
                            netProfitEstimate: 13240,
                        })];
                }
                return [4 /*yield*/, (0, auth_1.authenticate)()];
            case 1:
                authTokens = _t.sent();
                headers = {
                    Authorization: "Bearer ".concat(authTokens.access_token),
                    "x-amz-access-token": authTokens.access_token,
                    Accept: "application/json",
                };
                return [4 /*yield*/, axios.get("https://sellingpartnerapi-na.amazon.com/finances/v0/financialEvents?MaxResultsPerPage=100", { headers: headers })];
            case 2:
                financesResponse = _t.sent();
                financialEvents = (_o = (_m = financesResponse.data) === null || _m === void 0 ? void 0 : _m.payload) === null || _o === void 0 ? void 0 : _o.FinancialEvents;
                paymentBalance = 0;
                nextPayoutDate = "";
                totalGrossSales = 0;
                totalRefunds = 0;
                totalFees = 0;
                groups = (financialEvents === null || financialEvents === void 0 ? void 0 : financialEvents.FinancialEventGroupList) || [];
                if (groups.length > 0) {
                    latestSettlement = groups[0];
                    paymentBalance = Number(((_p = latestSettlement === null || latestSettlement === void 0 ? void 0 : latestSettlement.OriginalTotal) === null || _p === void 0 ? void 0 : _p.CurrencyAmount) || 0);
                    nextPayoutDate = (latestSettlement === null || latestSettlement === void 0 ? void 0 : latestSettlement.ProcessingEndTime) || "";
                }
                if (financialEvents === null || financialEvents === void 0 ? void 0 : financialEvents.ShipmentEventList) {
                    for (_i = 0, _a = financialEvents.ShipmentEventList; _i < _a.length; _i++) {
                        shipmentEvent = _a[_i];
                        if (shipmentEvent === null || shipmentEvent === void 0 ? void 0 : shipmentEvent.OrderChargeList) {
                            for (_b = 0, _c = shipmentEvent.OrderChargeList; _b < _c.length; _b++) {
                                charge = _c[_b];
                                totalGrossSales += Number(((_q = charge === null || charge === void 0 ? void 0 : charge.ChargeAmount) === null || _q === void 0 ? void 0 : _q.CurrencyAmount) || 0);
                            }
                        }
                    }
                }
                if (financialEvents === null || financialEvents === void 0 ? void 0 : financialEvents.RefundEventList) {
                    for (_d = 0, _e = financialEvents.RefundEventList; _d < _e.length; _d++) {
                        refundEvent = _e[_d];
                        if (refundEvent === null || refundEvent === void 0 ? void 0 : refundEvent.ShipmentItemAdjustmentList) {
                            for (_f = 0, _g = refundEvent.ShipmentItemAdjustmentList; _f < _g.length; _f++) {
                                adj = _g[_f];
                                totalRefunds += Number(((_r = adj === null || adj === void 0 ? void 0 : adj.ItemChargeAdjustmentList) === null || _r === void 0 ? void 0 : _r.reduce(function (sum, charge) {
                                    var _a;
                                    return sum + Number(((_a = charge.ChargeAmount) === null || _a === void 0 ? void 0 : _a.CurrencyAmount) || 0);
                                }, 0)) || 0);
                            }
                        }
                    }
                }
                if (financialEvents === null || financialEvents === void 0 ? void 0 : financialEvents.ServiceFeeEventList) {
                    for (_h = 0, _j = financialEvents.ServiceFeeEventList; _h < _j.length; _h++) {
                        feeEvent = _j[_h];
                        if (feeEvent === null || feeEvent === void 0 ? void 0 : feeEvent.FeeList) {
                            for (_k = 0, _l = feeEvent.FeeList; _k < _l.length; _k++) {
                                fee = _l[_k];
                                totalFees += Number(((_s = fee === null || fee === void 0 ? void 0 : fee.FeeAmount) === null || _s === void 0 ? void 0 : _s.CurrencyAmount) || 0);
                            }
                        }
                    }
                }
                netProfitEstimate = totalGrossSales - totalRefunds - totalFees;
                return [2 /*return*/, res.status(200).json({
                        paymentBalance: paymentBalance,
                        currency: "USD",
                        nextPayoutDate: nextPayoutDate,
                        totalGrossSales: totalGrossSales,
                        totalRefunds: totalRefunds,
                        totalFees: totalFees,
                        netProfitEstimate: netProfitEstimate,
                    })];
            case 3:
                error_7 = _t.sent();
                console.error("Error fetching payment details:", error_7.message);
                return [2 /*return*/, res.status(500).json({
                        message: error_7.message,
                        response: error_7.response ? error_7.response.data : null,
                        stack: error_7.stack,
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getAccount = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var authTokens, headers, body, response, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, auth_1.authenticate)()];
            case 1:
                authTokens = _a.sent();
                headers = {
                    Authorization: "Bearer ".concat(authTokens.access_token),
                    "x-amz-access-token": authTokens.access_token,
                    "Content-Type": "application/json",
                };
                body = {
                    FeesEstimateRequestList: [
                        {
                            MarketplaceId: "A21TJRUUN4KGV",
                            IdType: "SellerSKU",
                            IdValue: "Kids-Butterfly-Blue-0-1 Years",
                            IsAmazonFulfilled: true,
                            Identifier: "Estimate1",
                            PriceToEstimateFees: {
                                ListingPrice: {
                                    CurrencyCode: "USD",
                                    Amount: 10.0,
                                },
                                Shipping: {
                                    CurrencyCode: "USD",
                                    Amount: 0.0,
                                },
                            },
                        },
                    ],
                };
                return [4 /*yield*/, axios.post("".concat(endpoint, "/products/fees/v0/feesEstimate"), body, { headers: headers })];
            case 2:
                response = _a.sent();
                console.log("Response data:560 ", response.data);
                return [2 /*return*/, res.status(200).json(response.data)];
            case 3:
                error_8 = _a.sent();
                console.error("Error fetching seller account:", error_8.message);
                return [2 /*return*/, res.status(500).json({
                        message: error_8.message,
                        response: error_8.response ? error_8.response.data : null,
                        stack: error_8.stack,
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getInventoryValue = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, marketplaceId, _c, sku, _d, sellerId, totalValue, nextToken, retryCount, maxRetries, inventoryItems, authTokens_2, baseUrl_2, queryParams_2, fetchInventory_1, error_9;
    var _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _a = req.query, _b = _a.marketplaceId, marketplaceId = _b === void 0 ? "A21TJRUUN4KGV" : _b, _c = _a.sku, sku = _c === void 0 ? "0W-C7T5-ESJ7" : _c, _d = _a.sellerId, sellerId = _d === void 0 ? "AXO3C55P4B1RQ" : _d;
                totalValue = 0;
                retryCount = 0;
                maxRetries = 5;
                inventoryItems = [];
                _g.label = 1;
            case 1:
                _g.trys.push([1, 7, , 8]);
                return [4 /*yield*/, (0, auth_1.authenticate)()];
            case 2:
                authTokens_2 = _g.sent();
                baseUrl_2 = "".concat(endpoint, "/listings/2021-08-01/items/").concat(sellerId);
                queryParams_2 = {
                    marketplaceIds: marketplaceId,
                    includedData: "offers,fulfillmentAvailability",
                };
                fetchInventory_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var queryString, url, response, _a, items, pagination, _i, items_1, item, price, qty, error_10, retryAfter_3;
                    var _b, _c, _d, _e, _f, _g, _h, _j;
                    return __generator(this, function (_k) {
                        switch (_k.label) {
                            case 0:
                                if (nextToken) {
                                    queryParams_2.pageToken = nextToken;
                                }
                                else {
                                    delete queryParams_2.pageToken;
                                }
                                queryString = new URLSearchParams(queryParams_2).toString();
                                url = "".concat(baseUrl_2, "?").concat(queryString);
                                console.log("Fetching inventory from URL:", url);
                                _k.label = 1;
                            case 1:
                                _k.trys.push([1, 3, , 8]);
                                return [4 /*yield*/, axios.get(url, {
                                        headers: {
                                            "x-amz-access-token": authTokens_2.access_token,
                                            "Content-Type": "application/json",
                                        },
                                    })];
                            case 2:
                                response = _k.sent();
                                _a = response.data, items = _a.items, pagination = _a.pagination;
                                if (!Array.isArray(items)) {
                                    throw new Error("Unexpected response format: items is not an array");
                                }
                                for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                                    item = items_1[_i];
                                    price = parseFloat((_e = (_d = (_c = (_b = item.offers) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.price) === null || _d === void 0 ? void 0 : _d.amount) !== null && _e !== void 0 ? _e : "0");
                                    qty = parseInt((_h = (_g = (_f = item.fulfillmentAvailability) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.quantity) !== null && _h !== void 0 ? _h : "0", 10);
                                    totalValue += price * qty;
                                }
                                if (items) {
                                    inventoryItems.push(items);
                                }
                                nextToken = (pagination === null || pagination === void 0 ? void 0 : pagination.nextToken) || undefined;
                                retryCount = 0; // reset on success
                                return [3 /*break*/, 8];
                            case 3:
                                error_10 = _k.sent();
                                if (!(((_j = error_10.response) === null || _j === void 0 ? void 0 : _j.status) === 429 && retryCount < maxRetries)) return [3 /*break*/, 6];
                                retryCount++;
                                retryAfter_3 = error_10.response.headers["retry-after"] || Math.pow(2, retryCount);
                                console.warn("Rate limited. Retrying after ".concat(retryAfter_3, " seconds..."));
                                return [4 /*yield*/, new Promise(function (resolve) {
                                        return setTimeout(resolve, retryAfter_3 * 1000);
                                    })];
                            case 4:
                                _k.sent();
                                return [4 /*yield*/, fetchInventory_1()];
                            case 5:
                                _k.sent(); // retry
                                return [3 /*break*/, 7];
                            case 6: throw error_10;
                            case 7: return [3 /*break*/, 8];
                            case 8: return [2 /*return*/];
                        }
                    });
                }); };
                _g.label = 3;
            case 3: return [4 /*yield*/, fetchInventory_1()];
            case 4:
                _g.sent();
                _g.label = 5;
            case 5:
                if (nextToken) return [3 /*break*/, 3];
                _g.label = 6;
            case 6: return [2 /*return*/, res.status(200).json({
                    totalInventoryValue: totalValue.toFixed(2),
                    currency: "INR",
                    source: "live",
                    items: inventoryItems.flat(),
                })];
            case 7:
                error_9 = _g.sent();
                console.error("Error fetching inventory value:", ((_e = error_9.response) === null || _e === void 0 ? void 0 : _e.data) || error_9.message);
                return [2 /*return*/, res.status(500).json({
                        message: error_9.message,
                        response: ((_f = error_9.response) === null || _f === void 0 ? void 0 : _f.data) || null,
                    })];
            case 8: return [2 /*return*/];
        }
    });
}); };
var postReturns = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, returnDate, orderId, asin, sku_1, marketplaceId, condition, reason, quantity, status_2, refundAmount, newReturn, error_11;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, returnDate = _a.returnDate, orderId = _a.orderId, asin = _a.asin, sku_1 = _a.sku, marketplaceId = _a.marketplaceId, condition = _a.condition, reason = _a.reason, quantity = _a.quantity, status_2 = _a.status, refundAmount = _a.refundAmount;
                console.log("BODY: ", req.body);
                if (!returnDate ||
                    !orderId ||
                    !asin ||
                    !sku_1 ||
                    !marketplaceId ||
                    !condition ||
                    !reason ||
                    !quantity) {
                    return [2 /*return*/, res.status(400).json({ message: "All fields are required" })];
                }
                newReturn = new Return_1.default({
                    returnDate: returnDate,
                    orderId: orderId,
                    asin: asin,
                    sku: sku_1,
                    marketplaceId: marketplaceId,
                    condition: condition,
                    reason: reason,
                    status: status_2,
                    quantity: quantity,
                    refundAmount: refundAmount || 0,
                });
                return [4 /*yield*/, newReturn.save()];
            case 1:
                _b.sent();
                return [2 /*return*/, res
                        .status(201)
                        .json({ message: "Return added successfully", data: newReturn })];
            case 2:
                error_11 = _b.sent();
                console.error("Error adding return:", error_11.message);
                return [2 /*return*/, res
                        .status(500)
                        .json({ message: "Server error", error: error_11.message })];
            case 3: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    auth: auth,
    getOrders: getOrders,
    getInventory: getInventory,
    getCustomerReturnsReport: getCustomerReturnsReport,
    getPaymentDetails: getPaymentDetails,
    getAccount: getAccount,
    getInventoryValue: getInventoryValue,
    postReturns: postReturns,
};
