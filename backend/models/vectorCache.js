const mongoose = require("mongoose");

const vectorCacheSchema = new mongoose.Schema({

question: {
type: String,
required: true,
unique: true
},

embedding: [Number],

createdAt: {
type: Date,
default: Date.now
}

});

module.exports =
mongoose.model(
"VectorCache",
vectorCacheSchema
);