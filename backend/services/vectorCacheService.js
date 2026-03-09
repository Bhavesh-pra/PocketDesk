const VectorCache =
require("../models/vectorCache");

const { getEmbedding } =
require("./embeddingService");


const getCachedEmbedding =
async (question)=>{

// 1 Check Cache

let cached =
await VectorCache.findOne({
question
});

if(cached){

console.log("Cache Hit");

return cached.embedding;

}


// 2 Generate Embedding

console.log("Cache Miss");

const embedding =
await getEmbedding(question);


// 3 Save Cache

await VectorCache.create({

question,
embedding

});


return embedding;

};


module.exports = {
getCachedEmbedding
};