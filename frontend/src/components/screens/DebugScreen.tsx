import { useState, useEffect } from 'react';
import api from '../../services/api';

export function DebugScreen() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    // Get the base URL from the axios instance
    setBackendUrl(api.defaults.baseURL || "Not Set");

    const checkHealth = async () => {
      try {
        const response = await api.get('/health');
        setStatus({ ok: true, data: response.data });
      } catch (err: any) {
        setStatus({ 
          ok: false, 
          error: err.message, 
          status: err.response?.status,
          isHtml: err.response?.data?.toString().includes("<!doctype html>")
        });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="p-8 text-white font-mono max-w-4xl mx-auto">
      <h1 className="text-3xl text-cyan-400 mb-8 border-b border-cyan-500/20 pb-4">SYSTEM DIAGNOSTICS</h1>
      
      <div className="space-y-6">
        <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10">
          <h3 className="text-neutral-500 uppercase text-xs mb-2">Current Backend Target</h3>
          <p className="text-xl text-white">{backendUrl}</p>
          {backendUrl.includes("vercel.app") && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              ❌ ERROR: Your target is a Vercel URL. It MUST be a Railway URL ending in .up.railway.app
            </div>
          )}
        </div>

        <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10">
          <h3 className="text-neutral-500 uppercase text-xs mb-2">Health Check</h3>
          {loading ? (
            <p className="animate-pulse">Pinging backend...</p>
          ) : status?.ok ? (
            <div className="text-green-400">
              <p className="font-bold">✅ ONLINE</p>
              <pre className="mt-2 text-xs bg-black/40 p-3 rounded">{JSON.stringify(status.data, null, 2)}</pre>
            </div>
          ) : (
            <div className="text-red-400">
              <p className="font-bold">❌ OFFLINE / MISCONFIGURED</p>
              <p className="mt-1">Error: {status?.error}</p>
              {status?.status === 405 && <p className="mt-1 text-xs opacity-70">Server rejected the method (405). Check your URL path.</p>}
              {status?.isHtml && <p className="mt-2 text-xs bg-yellow-500/10 p-3 rounded text-yellow-500">
                ⚠️ WARNING: The backend returned an HTML page. This means your <b>VITE_API_URL</b> is pointing to a website (like Vercel) instead of an API.
              </p>}
            </div>
          )}
        </div>

        <div className="p-6 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
          <h4 className="text-cyan-400 font-bold mb-2 uppercase text-xs">How to fix:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-400">
            <li>Find your Railway URL (Networking tab in Railway).</li>
            <li>Add <code className="bg-black px-1">VITE_API_URL</code> to Vercel Settings.</li>
            <li><b>REDEPLOY</b> the project on Vercel.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
