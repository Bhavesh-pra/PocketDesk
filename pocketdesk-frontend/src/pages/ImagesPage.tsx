import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../services/api";

interface Album {
  _id: string;
  name: string;
}

// Pastel colour palette for album cards
const palette = [
  { bg: "bg-purple-500/10", border: "hover:border-purple-500/50", icon: "text-purple-400", iconBg: "bg-purple-500/10" },
  { bg: "bg-blue-500/10", border: "hover:border-blue-500/50", icon: "text-blue-400", iconBg: "bg-blue-500/10" },
  { bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50", icon: "text-emerald-400", iconBg: "bg-emerald-500/10" },
  { bg: "bg-amber-500/10", border: "hover:border-amber-500/50", icon: "text-amber-400", iconBg: "bg-amber-500/10" },
  { bg: "bg-pink-500/10", border: "hover:border-pink-500/50", icon: "text-pink-400", iconBg: "bg-pink-500/10" },
  { bg: "bg-cyan-500/10", border: "hover:border-cyan-500/50", icon: "text-cyan-400", iconBg: "bg-cyan-500/10" },
];

export default function ImagesPage() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [newAlbum, setNewAlbum] = useState("");
  const [creating, setCreating] = useState(false);

  const loadAlbums = async () => {
    try {
      const res = await API.get("/albums/list");
      setAlbums(res.data);
    } catch (err) {
      console.log("Failed loading albums");
    }
  };

  useEffect(() => { loadAlbums(); }, []);

  const createAlbum = async () => {
    if (!newAlbum.trim()) return;
    setCreating(true);
    try {
      await API.post("/albums/create", { name: newAlbum });
      setNewAlbum("");
      loadAlbums();
    } catch (err) {
      console.log("Create album failed");
    } finally {
      setCreating(false);
    }
  };

  const deleteAlbum = async (id: string, name: string) => {
    if (!window.confirm(`Delete album "${name}"?`)) return;
    try {
      await API.delete(`/albums/${id}`);
      loadAlbums();
    } catch (err) {
      console.log("Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Image Albums</h1>
        </div>
        <p className="text-sm text-neutral-500 ml-12">Organise images into albums — text is extracted via OCR for AI search</p>
      </div>

      {/* Create album bar */}
      <div className="flex gap-3">
        <input
          value={newAlbum}
          onChange={(e) => setNewAlbum(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") createAlbum(); }}
          placeholder="New album name..."
          className="flex-1 bg-neutral-900 border border-neutral-700 focus:border-purple-500/60 focus:outline-none px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 rounded-lg transition"
        />
        <button
          onClick={createAlbum}
          disabled={creating || !newAlbum.trim()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-lg transition font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create
        </button>
      </div>

      {/* Albums grid */}
      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-neutral-700 rounded-xl">
          <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="text-sm text-neutral-500">No albums yet — create one above</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {albums.map((album, i) => {
            const c = palette[i % palette.length];
            return (
              <div
                key={album._id}
                className={`group relative border border-neutral-700/80 ${c.border} bg-neutral-900/60 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}
                onClick={() => navigate(`/images/${album._id}`)}
              >
                <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center mb-4`}>
                  <svg className={`w-5 h-5 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-neutral-200 truncate">{album.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Click to view images</p>

                {/* Delete btn — top-right on hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteAlbum(album._id, album.name); }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all p-1 rounded"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}