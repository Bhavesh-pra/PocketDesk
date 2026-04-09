import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { 
  Users, 
  Database, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  LogOut, 
  Home, 
  CheckCircle2, 
  XCircle,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";

interface MetricStats {
  totalUsers: number;
  activeUsers: number;
  totalStorage: number;
  signups: { _id: string; count: number }[];
  distribution: { name: string; value: number }[];
}

interface UserData {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  assetCount: number;
}

export default function AdminDashboard() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overview" | "users">("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, usersRes] = await Promise.all([
        API.get("/admin/metrics"),
        API.get("/admin/users")
      ]);
      setMetrics(metricsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      await API.patch(`/admin/users/${userId}/toggle`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900/50 border-r border-neutral-800 flex flex-col p-6 space-y-8 sticky top-0 h-screen">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
            PocketAdmin
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setView("overview")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${view === "overview" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300"}`}
          >
            <TrendingUp size={20} />
            <span className="font-medium">Overview</span>
          </button>
          <button 
            onClick={() => setView("users")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${view === "users" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300"}`}
          >
            <Users size={20} />
            <span className="font-medium">User Management</span>
          </button>
        </nav>

        <div className="pt-8 border-t border-neutral-800 space-y-2">
          <Link to="/home" className="flex items-center space-x-3 px-4 py-3 text-neutral-500 hover:text-white transition-colors">
            <Home size={20} />
            <span className="font-medium">Back to App</span>
          </Link>
          <button 
            onClick={() => { auth?.logout(); navigate("/"); }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400/70 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {view === "overview" ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Metrics Dashboard</h1>
              <p className="text-neutral-500">Real-time usage and engagement statistics</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                    <Users size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{metrics?.totalUsers}</div>
                <div className="text-neutral-500 text-sm">Total users registered</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-500/10 text-green-400 rounded-2xl">
                    <Activity size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{metrics?.activeUsers}</div>
                <div className="text-neutral-500 text-sm">Active users (last 30 days)</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                    <Database size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{formatFileSize(metrics?.totalStorage || 0)}</div>
                <div className="text-neutral-500 text-sm">Total storage occupied</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
                    <CheckCircle2 size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{users.reduce((acc, u) => acc + u.assetCount, 0)}</div>
                <div className="text-neutral-500 text-sm">Total assets stored</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Line Chart */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
                <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                  <TrendingUp size={20} className="text-indigo-400" />
                  <span>User Growth (Last 7 Days)</span>
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics?.signups}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="_id" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '12px' }}
                        itemStyle={{ color: '#818cf8' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
                <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                  <Database size={20} className="text-pink-400" />
                  <span>Content Distribution</span>
                </h3>
                <div className="h-[300px] flex">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics?.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {metrics?.distribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-1/3 flex flex-col justify-center space-y-3">
                    {metrics?.distribution.map((entry, index) => (
                      <div key={entry.name} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm text-neutral-400">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">User Management</h1>
              <p className="text-neutral-500">View performance and manage accounts</p>
            </div>

            {/* Users Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-neutral-800 bg-neutral-800/20">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Assets</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-neutral-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                              {user.email[0].toUpperCase()}
                            </div>
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-neutral-800 text-neutral-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-neutral-400 text-sm">
                            <Database size={14} className="mr-1.5" />
                            {user.assetCount}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center space-x-1.5 ${user.isActive ? 'text-green-500' : 'text-red-500'}`}>
                            {user.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            <span className="text-sm font-medium">{user.isActive ? 'Active' : 'Banned'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleUserStatus(user._id)}
                            disabled={user.email === auth?.email}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                              user.isActive 
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                          >
                            {user.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
