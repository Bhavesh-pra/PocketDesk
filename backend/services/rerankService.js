const { askAI } = require("./aiService");

const rerankChunks = async (question, chunks) => {

  const prompt = `
You are a relevance ranking system.

Question:
${question}

Below are document passages.

Select the 5 passages that are most relevant to answering the question.

Return only the numbers of the best passages.

Passages:

${chunks.map((c, i) => `
${i+1}.
${c.text.substring(0,500)}
`).join("\n")}

Answer format example:
1,4,7,10,12
`;

  const response = await askAI("", prompt);

  const numbers = response
    .match(/\d+/g)
    ?.map(n => parseInt(n) - 1) || [];

  return numbers
    .slice(0,5)
    .map(i => chunks[i])
    .filter(Boolean);
};

module.exports = { rerankChunks };