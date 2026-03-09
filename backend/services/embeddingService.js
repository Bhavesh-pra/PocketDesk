const axios = require("axios");

const getEmbedding = async (text) => {

    try {

        const response = await axios.post(
            "http://localhost:11434/api/embeddings",
            {
                model: "nomic-embed-text",
                prompt: text
            }
        );

        return response.data.embedding;

    } catch (error) {

        console.log("Embedding Error:", error);

        return [];

    }

};

module.exports = {
    getEmbedding
};