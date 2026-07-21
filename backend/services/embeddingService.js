const axios = require("axios");
const OpenAI = require("openai");

const provider = process.env.AI_PROVIDER || "openai";
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getEmbeddingFromOpenAI = async (text) => {
  const response = await openai.embeddings.create({
    model: embeddingModel,
    input: text
  });

  return response.data?.[0]?.embedding || [];
};

const getEmbeddingFromOllama = async (text) => {
  const response = await axios.post(
    `${ollamaBaseUrl}/api/embeddings`,
    {
      model: "nomic-embed-text",
      prompt: text
    }
  );

  return response.data?.embedding || [];
};

const getEmbedding = async (text) => {
  try {
    if (!text || !text.trim()) {
      return [];
    }

    if (provider === "openai") {
      return await getEmbeddingFromOpenAI(text);
    }

    return await getEmbeddingFromOllama(text);
  } catch (error) {
    console.log("Embedding Error:", error?.response?.data || error.message || error);
    return [];
  }
};

module.exports = {
  getEmbedding
};
