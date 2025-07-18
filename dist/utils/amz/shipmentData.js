

const shipmentData = () => {
    return {
        clientReferenceId: "911-7267646-6348616",
        shipFrom: {
            name: "test name 1",
            addressLine1: "some Test address 1",
            postalCode: "90013",
            city: "Los Angeles",
            countryCode: "US",
            stateOrRegion: "CA",
            email: "testEmail1@amazon.com",
            phoneNumber: "1234567890",
        },
        shipTo: {
            name: "test name 2",
            addressLine1: "some Test address 2",
            postalCode: "90013-1805",
            city: "LOS ANGELES",
            countryCode: "US",
            stateOrRegion: "CA",
            email: "testEmail2@amazon.com",
            phoneNumber: "1234567890",
        },
        containers: [
            {
                containerType: "PACKAGE",
                containerReferenceId: "ContainerRefId-01",
                items: [
                    {
                        title: "String",
                        quantity: 2,
                        unitPrice: {
                            unit: "USD",
                            value: 14.99,
                        },
                        unitWeight: {
                            unit: "lb",
                            value: 0.08164656,
                        },
                    },
                ],
                dimensions: {
                    height: 12,
                    length: 36,
                    width: 15,
                    unit: "CM",
                },
                weight: {
                    unit: "lb",
                    value: 0.08164656,
                },
                value: {
                    unit: "USD",
                    value: 29.98,
                },
            },
        ],
    }
}


module.exports = {
    shipmentData,
}