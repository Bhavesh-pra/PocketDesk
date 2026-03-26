const { getCachedEmbedding } =
require("./vectorCacheService");

const { getUserChunks } =
require("./chunkCacheService");


const cosineSimilarity = (vecA, vecB) => {

if (!vecA?.length || !vecB?.length) {
  return 0;
}

let dot = 0;
let normA = 0;
let normB = 0;

for (let i = 0; i < vecA.length; i++) {

dot += vecA[i]*vecB[i];
normA += vecA[i]*vecA[i];
normB += vecB[i]*vecB[i];

}

return dot /
(Math.sqrt(normA)*Math.sqrt(normB));

};


const semanticSearch =
async (question,userId,topK=3)=>{


// Embedding

const questionEmbedding =
await getCachedEmbedding(question);


// Get user chunks

const allChunks =
getUserChunks(userId);


let results = [];


allChunks.forEach(chunk=>{

const similarity =
cosineSimilarity(
questionEmbedding,
chunk.embedding
);

results.push({

text: chunk.text,
score: similarity,
sourceType: chunk.sourceType,
sourceName: chunk.sourceName

});

});


results.sort((a,b)=>b.score-a.score);

const filtered = results.filter(r => r.score > 0.2);

if (filtered.length === 0) {
  return results.slice(0, topK); // fallback
}

return filtered.slice(0, topK);
};


module.exports = {

semanticSearch

};