import { Request, Response } from "express-serve-static-core";
import { parseTSVtoJSON } from "../utils/amz/parseTSVtoJSON";
const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
const { authenticate } = require("../utils/amz/auth");
const { createFeedDocument, uploadFeed } = require("../utils/amz/feeds");
const { shipmentData } = require("../utils/amz/shipmentData");
const { listingData, patchListingData } = require("../utils/amz/listingData");
const zlib = require("zlib");

const marketplace_id = "A1PA6795UKMFR9"; // This is used for the case of a single id
const marketplaceIds = [
  "A13V1IB3VIYZZH",
  "APJ6JRA9NG5V4",
  "A1RKKUPIHCS9HS",
  "AMEN7PMS3EDWL",
  "A1PA6795UKMFR9",
  "A1805IZSGTT6HS",
  "A1F83G8C2ARO7P",
  "A1C3SOZRARQ6R3",
  "A2NODRKZP88ZB9",
]; // This is used for the case of many ids. You can add as much as possible.
const endpoint = "https://sellingpartnerapi-eu.amazon.com";
const sku = "T5-TUY3-3FH8";

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const USE_DUMMY_DATA = true;

interface InventoryItem {
  asin: string;
  productName: string;
  fnSku: string;
  sellerSku: string;
  inventoryDetails: {
    fulfillableQuantity: number;
    inboundWorkingQuantity: number;
    inboundShippedQuantity: number;
    inboundReceivingQuantity: number;
    reservedQuantity: {
      totalReservedQuantity: number;
      pendingCustomerOrderQuantity: number;
      pendingTransshipmentQuantity: number;
      fcProcessingQuantity: number;
    };
    researchingQuantity: {
      totalResearchingQuantity: number;
      researchingQuantityBreakdown: { name: string; quantity: number }[];
    };
    unfulfillableQuantity: {
      totalUnfulfillableQuantity: number;
      customerDamagedQuantity: number;
      warehouseDamagedQuantity: number;
      distributorDamagedQuantity: number;
      carrierDamagedQuantity: number;
      defectiveQuantity: number;
      expiredQuantity: number;
    };
    futureSupplyQuantity: {
      reservedFutureSupplyQuantity: number;
      futureSupplyBuyableQuantity: number;
    };
  };
}

const auth = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.post("https://api.amazon.com/auth/o2/token", {
      grant_type: "refresh_token",
      refresh_token: process.env.REFRESH_TOKEN as string,
      client_id: process.env.SELLING_PARTNER_APP_CLIENT_ID as string,
      client_secret: process.env.SELLING_PARTNER_APP_CLIENT_SECRET as string,
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error fetching access token:", error.message);
    res
      .status(500)
      .json({ error: "Failed to authenticate", details: error.message });
  }
};

const getOrders = async (req: Request, res: Response) => {
  const { marketplaceids, createdAfter, createdBefore } = req.query;

  try {
    const createdAfterFormatted = createdAfter
      ? new Date(createdAfter as string).toISOString()
      : "2025-07-01T00:00:00Z";
    const createdBeforeFormatted = createdBefore
      ? new Date(createdBefore as string).toISOString()
      : undefined;
    let authTokens = await authenticate();
    const baseUrl = `${endpoint}/orders/v0/orders`;

    const queryParams: Record<string, string> = {
      MarketplaceIds: Array.isArray(marketplaceids)
        ? marketplaceids.join(",")
        : (marketplaceids as string),
      CreatedAfter: createdAfterFormatted,
      MaxResultsPerPage: "100", // Reduce number of requests
    };
    if (createdBeforeFormatted) {
      queryParams.CreatedBefore = createdBeforeFormatted;
    }

    let orders: any[] = [];
    let nextToken: string | null = null;
    const maxRetries = 7;
    let retryCount = 0;

    const fetchOrders = async () => {
      if (nextToken) {
        queryParams.NextToken = nextToken;
      } else {
        delete queryParams.NextToken;
      }

      const queryString: string = new URLSearchParams({
        ...queryParams,
        NextToken: queryParams.NextToken || "",
      }).toString();
      const url = `${baseUrl}?${queryString}`;

      // console.log("authTokens", authTokens);

      try {
        const response = await axios.get(url, {
          headers: {
            "x-amz-access-token": authTokens.access_token,
            "Content-Type": "application/json",
          },
        });

        const ordersData = response.data.payload.Orders || [];
        orders = orders.concat(ordersData);

        nextToken = response.data.payload.NextToken?.trim() || null;
        retryCount = 0; // Reset retry count on successful request
      } catch (error) {
        if ((error as any).response && (error as any).response.status === 429) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw new Error("Max retries exceeded");
          }
          const retryAfter =
            (error as any).response.headers["retry-after"] ||
            Math.pow(2, retryCount);
          console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
          await fetchOrders(); // Retry the current request
        } else {
          throw error;
        }
      }
    };

    do {
      await fetchOrders();
    } while (nextToken && nextToken !== null);
    res.status(200).json(orders);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error getting orders: ${error.message}`);
    } else {
      console.error(`Error getting orders: ${String(error)}`);
    }
    res
      .status(500)
      .json({ message: "Error getting orders", error: (error as any).message });
  }
};

const getInventory = async (req: Request, res: Response) => {
  const { marketplaceids } = req.query as { marketplaceids: string };
  // console.log("MarketPlaceId", marketplaceids);

  try {
    const authTokens = await authenticate();
    const baseUrl = `${endpoint}/fba/inventory/v1/summaries`;

    const queryParams: Record<string, string> = {
      details: "true",
      granularityType: "Marketplace",
      granularityId: marketplaceids,
      marketplaceIds: marketplaceids,
    };

    let inventoryData: InventoryItem[] = [];
    let nextToken: string | null = null;
    let retryCount = 0;
    const maxRetries = 5;

    do {
      if (nextToken) {
        queryParams["nextToken"] = nextToken;
      } else {
        delete queryParams["nextToken"];
      }

      const queryString = new URLSearchParams(queryParams).toString();
      const url = `${baseUrl}?${queryString}`;

      try {
        const response = await axios.get(url, {
          headers: {
            "x-amz-access-token": authTokens.access_token,
            "Content-Type": "application/json",
          },
        });

        const inventory: InventoryItem[] =
          response.data.payload.inventorySummaries || [];
        inventoryData = inventoryData.concat(inventory);

        nextToken = response.data.pagination?.nextToken?.trim() || null;
        retryCount = 0;
      } catch (error: any) {
        if (error.response && error.response.status === 429) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw new Error("Max retries exceeded");
          }
          const retryAfter =
            error.response.headers["retry-after"] || Math.pow(2, retryCount);
          console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
        } else {
          throw error;
        }
      }
    } while (nextToken && nextToken !== "null");

    res.status(200).json(inventoryData);
  } catch (error: any) {
    console.error(
      "Error getting inventory:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ message: "Error getting inventory", error: error.message });
  }
};

const getCustomerReturnsReport = async (req: Request, res: Response) => {
  const { marketplaceIds, startDate, endDate } = req.query as {
    marketplaceIds: string | string[];
    startDate?: string;
    endDate?: string;
  };

  function getSummaryMetrics(data: any[]) {
    const returnCountMap = new Map<string, number>();
    const damageCountMap = new Map<string, number>();

    for (const item of data) {
      const key = item.sku || item.asin;

      // Count returns
      returnCountMap.set(
        key,
        (returnCountMap.get(key) || 0) + (item.quantity || 1)
      );

      // Count damages
      if (
        item.reason &&
        typeof item.reason === "string" &&
        item.reason.toLowerCase().includes("damage")
      ) {
        damageCountMap.set(
          key,
          (damageCountMap.get(key) || 0) + (item.quantity || 1)
        );
      }
    }

    const mostReturned = Array.from(returnCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const mostDamaged = Array.from(damageCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const mostProfitable = Array.from(returnCountMap.entries()).sort(
      (a, b) => a[1] - b[1]
    )[0]; // least returned = most profitable

    return {
      mostReturnedProduct: mostReturned?.[0] || null,
      mostDamagedProduct: mostDamaged?.[0] || null,
      mostProfitableProduct: mostProfitable?.[0] || null,
    };
  }

  const REPORT_TYPE = "GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA";

  try {
    if (USE_DUMMY_DATA) {
      const dummyReturns = [
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

      const summary = getSummaryMetrics(dummyReturns);

      return res.status(200).json({
        reportId: "dummy-report-id",
        reportDocumentId: "dummy-doc-id",
        compressionAlgorithm: "none",
        count: dummyReturns.length,
        returnsData: dummyReturns,
        ...summary,
      });
    }

    const authTokens = await authenticate();
    const headers = {
      Authorization: `Bearer ${authTokens.access_token}`,
      "x-amz-access-token": authTokens.access_token,
      "Content-Type": "application/json",
    };

    const createReportResponse = await axios.post(
      "https://sellingpartnerapi-na.amazon.com/reports/2021-06-30/reports",
      {
        reportType: REPORT_TYPE,
        dataStartTime:
          startDate ||
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dataEndTime: endDate || new Date().toISOString(),
        marketplaceIds: Array.isArray(marketplaceIds)
          ? marketplaceIds
          : [marketplaceIds],
      },
      { headers }
    );

    const reportId: string = createReportResponse.data.reportId;

    let reportDocumentId: string | null = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!reportDocumentId && attempts < maxAttempts) {
      attempts++;
      const getReportResponse = await axios.get(
        `https://sellingpartnerapi-na.amazon.com/reports/2021-06-30/reports/${reportId}`,
        { headers }
      );

      const status: string = getReportResponse.data.processingStatus;

      if (status === "DONE") {
        reportDocumentId = getReportResponse.data.reportDocumentId;
      } else if (["CANCELLED", "FATAL"].includes(status)) {
        throw new Error(`Report processing failed: ${status}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 20000));
      }
    }

    if (!reportDocumentId) {
      throw new Error("Report was not ready after maximum attempts");
    }

    const getDocResponse = await axios.get(
      `https://sellingpartnerapi-na.amazon.com/reports/2021-06-30/documents/${reportDocumentId}`,
      { headers }
    );

    const downloadUrl: string = getDocResponse.data.url;
    const compressionAlgorithm: string | undefined =
      getDocResponse.data.compressionAlgorithm;

    const fileResponse = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });

    let fileData: string;

    if (compressionAlgorithm === "GZIP") {
      fileData = zlib.gunzipSync(fileResponse.data).toString("utf-8");
    } else {
      fileData = Buffer.from(fileResponse.data).toString("utf-8");
    }

    const returnsJson = parseTSVtoJSON(fileData);
    const summary = getSummaryMetrics(returnsJson);

    return res.status(200).json({
      reportId,
      reportDocumentId,
      compressionAlgorithm: compressionAlgorithm || "none",
      count: returnsJson.length,
      returnsData: returnsJson,
      ...summary,
    });
  } catch (error: any) {
    console.error("Error fetching returns report:", error.message);
    return res.status(500).json({
      message: error.message,
      response: error.response ? error.response.data : null,
      stack: error.stack,
    });
  }
};

const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    if (USE_DUMMY_DATA) {
      return res.status(200).json({
        paymentBalance: 13240.0,
        currency: "INR",
        nextPayoutDate: "2025-07-21T23:59:59Z",
        totalGrossSales: 18000,
        totalRefunds: 1600,
        totalFees: 3160,
        netProfitEstimate: 13240,
      });
    }

    const authTokens = await authenticate();
    const headers = {
      Authorization: `Bearer ${authTokens.access_token}`,
      "x-amz-access-token": authTokens.access_token,
      Accept: "application/json",
    };

    const financesResponse = await axios.get(
      "https://sellingpartnerapi-na.amazon.com/finances/v0/financialEvents?MaxResultsPerPage=100",
      { headers }
    );

    const financialEvents = financesResponse.data?.payload?.FinancialEvents;

    let paymentBalance = 0;
    let nextPayoutDate = "";
    let totalGrossSales = 0;
    let totalRefunds = 0;
    let totalFees = 0;

    const groups = financialEvents?.FinancialEventGroupList || [];
    if (groups.length > 0) {
      const latestSettlement = groups[0];
      paymentBalance = Number(
        latestSettlement?.OriginalTotal?.CurrencyAmount || 0
      );
      nextPayoutDate = latestSettlement?.ProcessingEndTime || "";
    }

    if (financialEvents?.ShipmentEventList) {
      for (const shipmentEvent of financialEvents.ShipmentEventList) {
        if (shipmentEvent?.OrderChargeList) {
          for (const charge of shipmentEvent.OrderChargeList) {
            totalGrossSales += Number(
              charge?.ChargeAmount?.CurrencyAmount || 0
            );
          }
        }
      }
    }

    if (financialEvents?.RefundEventList) {
      for (const refundEvent of financialEvents.RefundEventList) {
        if (refundEvent?.ShipmentItemAdjustmentList) {
          for (const adj of refundEvent.ShipmentItemAdjustmentList) {
            totalRefunds += Number(
              adj?.ItemChargeAdjustmentList?.reduce(
                (sum: number, charge: any) => {
                  return sum + Number(charge.ChargeAmount?.CurrencyAmount || 0);
                },
                0
              ) || 0
            );
          }
        }
      }
    }

    if (financialEvents?.ServiceFeeEventList) {
      for (const feeEvent of financialEvents.ServiceFeeEventList) {
        if (feeEvent?.FeeList) {
          for (const fee of feeEvent.FeeList) {
            totalFees += Number(fee?.FeeAmount?.CurrencyAmount || 0);
          }
        }
      }
    }

    const netProfitEstimate = totalGrossSales - totalRefunds - totalFees;

    return res.status(200).json({
      paymentBalance,
      currency: "USD",
      nextPayoutDate,
      totalGrossSales,
      totalRefunds,
      totalFees,
      netProfitEstimate,
    });
  } catch (error: any) {
    console.error("Error fetching payment details:", error.message);
    return res.status(500).json({
      message: error.message,
      response: error.response ? error.response.data : null,
      stack: error.stack,
    });
  }
};

const getAccount = async (req: Request, res: Response) => {
  try {
    const authTokens = await authenticate();

    const headers = {
      Authorization: `Bearer ${authTokens.access_token}`,
      "x-amz-access-token": authTokens.access_token,
      "Content-Type": "application/json",
    };

    const response = await axios.get(
      `${endpoint}/sellers/v1/marketplaceParticipations`,
      { headers }
    );

    console.log("Response data:560 ", response.data);

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error fetching seller account:", error.message);
    return res.status(500).json({
      message: error.message,
      response: error.response ? error.response.data : null,
      stack: error.stack,
    });
  }
};

const getInventoryValue = async (req: Request, res: Response) => {
  if (USE_DUMMY_DATA) {
    const dummyItems = [
      { offers: [{ price: { amount: "50.00" } }], fulfillmentAvailability: [{ quantity: 20 }] },
      { offers: [{ price: { amount: "30.00" } }], fulfillmentAvailability: [{ quantity: 10 }] },
      { offers: [{ price: { amount: "100.00" } }], fulfillmentAvailability: [{ quantity: 5 }] },
    ];

    const dummyTotal = dummyItems.reduce((sum, item) => {
      const price = parseFloat(item.offers?.[0]?.price?.amount ?? "0");
      const qty = parseInt(String(item.fulfillmentAvailability?.[0]?.quantity ?? "0"), 10);
      return sum + price * qty;
    }, 0);

    return res.status(200).json({
      totalInventoryValue: dummyTotal.toFixed(2),
      currency: "USD",
      source: "dummy",
    });
  }


  const sellerId = "A2NH4IXZ2D0U9U";
  const marketplaceId = "A21TJRUUN4KGV";
  const endpointBase = "https://sellingpartnerapi-eu.amazon.com";

  let totalValue = 0;
  let nextToken: string | undefined;

  try {
    const authTokens = await authenticate();

    do {
      const url = new URL(`${endpointBase}/listings/2021-08-01/items/${encodeURIComponent(sellerId)}`);
      url.searchParams.set("marketplaceIds", marketplaceId);
      url.searchParams.set("includedData", "offers,fulfillmentAvailability");
      if (nextToken) url.searchParams.set("nextToken", nextToken);

      const { data } = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${authTokens.access_token}`,
          "x-amz-access-token": authTokens.access_token,
          "Content-Type": "application/json",
        },
      });

      const { items, pagination } = data;
      if (!Array.isArray(items)) {
        throw new Error("Unexpected response format");
      }

      for (const item of items) {
        const price = parseFloat(item.offers?.[0]?.price?.amount ?? "0");
        const qty = parseInt(item.fulfillmentAvailability?.[0]?.quantity ?? "0", 10);
        totalValue += price * qty;
      }

      nextToken = pagination?.nextToken;
    } while (nextToken);

    return res.status(200).json({
      totalInventoryValue: totalValue.toFixed(2),
      currency: "INR",
      source: "live",
    });

  } catch (error: any) {
    console.error("Error fetching inventory value:", error.response?.data || error.message);
    return res.status(500).json({
      message: error.message,
      response: error.response?.data || null,
    });
  }
};


module.exports = {
  auth,
  getOrders,
  getInventory,
  getCustomerReturnsReport,
  getPaymentDetails,
  getAccount,
  getInventoryValue,
};

// 'A13V1IB3VIYZZH': 'France',
//   'APJ6JRA9NG5V4': 'Italy',
//   'A1RKKUPIHCS9HS': 'Spain',
//   'AMEN7PMS3EDWL': 'Belgium',
//   'A1PA6795UKMFR9': 'Germany',
//   'A1805IZSGTT6HS': 'Netherlands',
//   'A1F83G8C2ARO7P': 'United Kingdom',
//   'A1C3SOZRARQ6R3': 'Poland',
//   'A2NODRKZP88ZB9': 'Sweden'
// }
