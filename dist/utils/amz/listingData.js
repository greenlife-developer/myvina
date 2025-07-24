var listingData = function (marketplace_id) {
    return {
        productType: "LUGGAGE",
        requirements: "LISTING",
        attributes: {
            condition_type: [
                {
                    value: "new_new",
                    marketplace_id: marketplace_id,
                },
            ],
            item_name: [
                {
                    value: 'AmazonBasics 16" Underseat Spinner Carry-On',
                    language_tag: "en_US",
                    marketplace_id: marketplace_id,
                },
            ],
        },
    };
};
var patchListingData = function (marketplace_id) {
    return {
        productType: "LUGGAGE",
        // Below are the list of possible patches possible for a listing. Depending on your need, you would need to reduce the array of patches. each object in the array of patches is a patch
        patches: [
            {
                op: "replace",
                path: "/attributes/item_name",
                value: [
                    {
                        value: 'AmazonBasics 16" Underseat Spinner Carry-On',
                        language_tag: "en_US",
                        marketplace_id: marketplace_id,
                    },
                ],
            },
            {
                op: "replace",
                path: "/attributes/purchasable_offer",
                value: [
                    {
                        marketplace_id: marketplace_id,
                        currency: "USD",
                        our_price: [
                            {
                                schedule: [
                                    {
                                        value_with_tax: 15.0,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                op: "delete",
                path: "/attributes/item_type_name",
                value: [
                    {
                        marketplace_id: marketplace_id,
                        language_tag: "en_US",
                    },
                ],
            },
        ],
    };
};
module.exports = {
    listingData: listingData, // marketplace_id should be passed anywhere this function is called.
    patchListingData: patchListingData,
};
