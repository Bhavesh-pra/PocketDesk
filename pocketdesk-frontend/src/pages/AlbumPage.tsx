import { useEffect,useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../services/api";

interface Image {
_id:string;
fileName:string;
filePath:string;
}

export default function AlbumPage(){

const { albumId } = useParams();

const [images,setImages] = useState<Image[]>([]);
const [file,setFile] = useState<File | null>(null);
const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

const navigate = useNavigate();

const loadImages = async ()=>{

try{

const res = await API.get(`/images/list/${albumId}`);

setImages(res.data);

}catch(err){
console.log("Failed loading images");
}

};

useEffect(()=>{
loadImages();
},[]);


const uploadImage = async ()=>{

if(!file) return;

const formData = new FormData();

formData.append("image",file);

try{

await API.post(`/images/upload/${albumId}`,formData);

setFile(null);

loadImages();

}catch(err){
console.log("Upload failed");
}

};



const deleteImage = async (id: string, _name: string) => {
  try {
    await API.delete(`/images/${id}`);
    loadImages();
  } catch (err) {
    console.log("Delete failed");
  }
};


return(

<div className="space-y-8">

      <button 
        onClick={() => navigate("/images")}
        className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-4 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Albums</span>
      </button>

<h1 className="text-xl text-white">
Album Images
</h1>


<div className="border border-neutral-700 p-6 bg-neutral-900">

<input
type="file"
accept="image/*"
onChange={(e)=>setFile(e.target.files?.[0] || null)}
/>

<button
onClick={uploadImage}
className="ml-4 bg-blue-600 px-4 py-2 text-sm"
>
Upload
</button>

</div>


<div className="grid grid-cols-3 gap-6">

{images.map(img=>{

return(

<div
key={img._id}
className="border border-neutral-700 p-2"
>

<img
src={`${API.defaults.baseURL?.replace("/api", "")}/${img.filePath}`}
className="w-full"
/>

<div className="text-xs mt-2 text-neutral-400 truncate">
{img.fileName}
</div>

<div className="flex items-center gap-1.5 mt-2">
  {confirmingDelete === img._id ? (
    <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-1">
      <button
        onClick={() => {
          deleteImage(img._id, img.fileName);
          setConfirmingDelete(null);
        }}
        className="px-2 py-1 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-semibold"
      >
        Confirm
      </button>
      <button
        onClick={() => setConfirmingDelete(null)}
        className="p-1 hover:bg-neutral-800 text-neutral-400 rounded transition"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  ) : (
    <button
      onClick={() => setConfirmingDelete(img._id)}
      className="text-xs text-red-500 hover:text-red-400 transition-colors p-1"
    >
      Delete
    </button>
  )}
</div>

</div>

);

})}

</div>

</div>

);

}