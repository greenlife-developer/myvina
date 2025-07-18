const { authenticate } = require("./auth");
const axios = require("axios");
const { exampleFeedDocument } = require("./exampleFeedDocument");
const endpoint = "https://sellingpartnerapi-eu.amazon.com";


const createFeedDocument = async () => {
    try {
        const authTokens = await authenticate();
        const response = await axios.post(
            `${endpoint}/feeds/2021-06-30/documents`,
            {
                contentType: "text/xml; charset=UTF-8",
            },
            {
                headers: {
                    "x-amz-access-token": authTokens.access_token,
                    "Content-Type": "application/json",
                },
            }
        );
        
        return response.data;
    } catch (error) {
        console.error("Could not create Feed Document:", error.message);
    }
};



const uploadFeed = async (feedUrl) => {
    const contentType = "application/json; charset=utf-8";

    const instance = axios.create({
        headers: {
            "Content-Type": contentType,
        },
    });

    instance
        .post(feedUrl, exampleFeedDocument())
        .then((response) => {
            console.log("Upload successful:", response.data);
            return response.data;
        })
        .catch((error) => {
            console.error("Upload failed:", error.response.data);
        });
};

module.exports = {
    createFeedDocument,
    uploadFeed,
}

