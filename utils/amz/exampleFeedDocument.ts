export const exampleFeedDocument = () => {
    return {
        header: {
            sellerId: process.env.AMZ_SELLER_ID,
            version: "2.0",
            issueLocale: "en_US",
        },
        // Below are the list of feeds(in messages). Each object in the array is a feed. Depending on your need per time you will need to modify it. 
        messages: [
            {
                messageId: 1,
                sku: "My-SKU-A",
                operationType: "DELETE",
            },
            {
                messageId: 2,
                sku: "My-SKU-B",
                operationType: "PARTIAL_UPDATE",
                productType: "LUGGAGE",
                attributes: {
                    fulfillment_availability: [
                        {
                            fulfillment_channel_code: "DEFAULT",
                            quantity: 10,
                        },
                    ],
                },
            },
            {
                messageId: 3,
                sku: "My-SKU-C",
                operationType: "UPDATE",
                productType: "LUGGAGE",
                requirements: "LISTING_OFFER_ONLY",
                // You may need to add the marketplaceids here manually and you may need more than one in some cases
                attributes: {
                    condition_type: [
                        {
                            value: "new_new",
                            marketplace_id: "ATVPDKIKX0DER",
                        },
                    ],
                    merchant_suggested_asin: [
                        {
                            value: "AXXXXXXXXXXXX",
                            marketplace_id: "A1PA6795UKMFR9",
                        },
                    ],
                    fulfillment_availability: [
                        {
                            fulfillment_channel_code: "DEFAULT",
                            quantity: 0,
                        },
                    ],
                    purchasable_offer: [
                        {
                            currency: "USD",
                            our_price: [
                                {
                                    schedule: [
                                        {
                                            value_with_tax: 100,
                                        },
                                    ],
                                },
                            ],
                            marketplace_id: "A1PA6795UKMFR9",
                        },
                    ],
                },
            },
            {
                messageId: 4,
                sku: "My-SKU-D",
                operationType: "PATCH",
                productType: "LUGGAGE",
                patches: [
                    {
                        op: "replace",
                        path: "/attributes/fulfillment_availability",
                        value: [
                            {
                                fulfillment_channel_code: "DEFAULT",
                                quantity: 10,
                            },
                        ],
                    },
                ],
            },
        ],
    }
}
