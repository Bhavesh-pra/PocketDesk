const axios = require("axios");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const askAI = async (context, question, stream = false) => {

  const provider = process.env.AI_PROVIDER;

  const prompt = `
You are PocketDesk AI, an advanced academic study assistant.

Your goal is to help students understand concepts clearly and solve problems.

-------------------------
ANSWER FORMAT RULES
-------------------------

Always follow this structure when possible:

1. Definition
2. Detailed Explanation
3. Steps / Procedure (if applicable)
4. Working / Mechanism
5. Example (if applicable)
6. Key Points / Summary

Use proper formatting:
- Use short paragraphs
- Leave blank lines between sections
- Use bullet points when explaining lists
- Use numbered steps for procedures
- Use clear headings when helpful

Do NOT write everything in one paragraph.

-------------------------
DOCUMENT PRIORITY
-------------------------

1. First search the provided DOCUMENT CONTEXT.
2. If the answer exists there, explain it using that information.
3. If the context is incomplete, combine:
   DOCUMENT + general knowledge.

Never ignore useful document information.

-------------------------
IMPORTANT
-------------------------

• Explain concepts clearly for students.
• If the question asks for steps, procedures, or working, provide them.
• If a formula exists, include it.
• If a numerical method is required, show the method.

-------------------------
DOCUMENT CONTEXT
-------------------------

${context}

-------------------------
QUESTION
-------------------------

${question}

-------------------------
ANSWER
-------------------------
`;

  // ===== OPENAI MODE =====
  if (provider === "openai") {

    const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are an AI study assistant." },
    { role: "user", content: prompt }
  ],
  temperature: 0.6,
  max_tokens: 600,
  stream: stream
});

    if (stream) {
  return completion;   // return stream iterator
}

return completion.choices[0].message.content;
  }

  // ===== OLLAMA MODE =====
  else {

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "tinyllama",
        prompt: prompt,
        stream: false,

        options: {
          num_predict: 450,
          temperature: 0.6,
          top_p: 0.9,
          stop: ["<end>"]
        }
      }
    );

    return response.data.response;
  }
};

module.exports = { askAI };