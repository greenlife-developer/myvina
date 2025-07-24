const axios = require("axios");


export const authenticate = async () => {
    try {
        const response = await axios.post("https://api.amazon.com/auth/o2/token", {
            grant_type: "refresh_token",
            refresh_token: process.env.REFRESH_TOKEN, 
            client_id: process.env.SELLING_PARTNER_APP_CLIENT_ID,
            client_secret: process.env.SELLING_PARTNER_APP_CLIENT_SECRET,
        });

        return response.data; 
    } catch (error) {
        console.error("Error fetching access token:", error.message);
    }
};

