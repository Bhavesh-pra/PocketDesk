const Album = require("../models/album");


// CREATE ALBUM
const createAlbum = async (req,res)=>{

try{

const { name } = req.body;

if(!name){
return res.status(400).json({
message:"Album name required"
});
}

const album = await Album.create({

userId:req.userId,
name

});

res.json(album);

}catch(err){

console.log(err);

res.status(500).json({
message:"Create album failed"
});

}

};


// GET USER ALBUMS
const getAlbums = async (req,res)=>{

try{

const albums = await Album.find({
userId:req.userId
}).sort({createdAt:-1});

res.json(albums);

}catch(err){

res.status(500).json({
message:"Fetch albums failed"
});

}

};


// DELETE ALBUM
const deleteAlbum = async (req,res)=>{

try{

const album = await Album.findOne({
_id:req.params.id,
userId:req.userId
});

if(!album){
return res.status(404).json({
message:"Album not found"
});
}

await Album.deleteOne({
_id:req.params.id
});

res.json({
message:"Album deleted"
});

}catch(err){

res.status(500).json({
message:"Delete album failed"
});

}

};

module.exports = {

createAlbum,
getAlbums,
deleteAlbum

};