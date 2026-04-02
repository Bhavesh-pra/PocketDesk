import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

interface Album {
  _id:string;
  name:string;
}

export default function ImagesPage(){

const navigate = useNavigate();

const [albums,setAlbums] = useState<Album[]>([]);
const [newAlbum,setNewAlbum] = useState("");

const loadAlbums = async ()=>{

try{

const res = await API.get("/albums/list");

setAlbums(res.data);

}catch(err){
console.log("Failed loading albums");
}

};

useEffect(()=>{
loadAlbums();
},[]);


const createAlbum = async ()=>{

if(!newAlbum.trim()) return;

try{

await API.post("/albums/create",{
name:newAlbum
});

setNewAlbum("");

loadAlbums();

}catch(err){
console.log("Create album failed");
}

};


const deleteAlbum = async (id:string,name:string)=>{

const confirmDelete =
window.confirm(`Delete album "${name}" ?`);

if(!confirmDelete) return;

try{

await API.delete(`/albums/${id}`);

loadAlbums();

}catch(err){
console.log("Delete failed");
}

};


return(

<div className="space-y-8">

  <button
  onClick={() => navigate("/home")}
  className="text-sm text-blue-400 hover:underline"
>
← Back to Home
</button>

<h1 className="text-xl text-white">
Image Albums
</h1>


<div className="flex gap-4">

<input
value={newAlbum}
onChange={(e)=>setNewAlbum(e.target.value)}
placeholder="Album name"
className="bg-neutral-900 border border-neutral-700 px-4 py-2 text-sm"
/>

<button
onClick={createAlbum}
className="bg-blue-600 px-4 py-2 text-sm"
>
Create
</button>

</div>


<div className="grid grid-cols-3 gap-6">

{albums.map(album=>{

return(

<div
key={album._id}
className="border border-neutral-700 p-6 bg-neutral-900"
>

<div
onClick={()=>navigate(`/images/${album._id}`)}
className="cursor-pointer text-neutral-200"
>
{album.name}
</div>

<button
onClick={()=>deleteAlbum(album._id,album.name)}
className="text-xs text-red-400 mt-2"
>
Delete
</button>

</div>

);

})}

</div>

</div>

);

}