import React, { useState } from 'react';

export default function App() {
  const [code, setCode] = useState("function calculateTotal(items) {\n  return items.reduce((acc, item) => acc + item.price, 0);\n}");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAudit = () => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        score: "88 / 100",
        issues: 1,
        optimized: "function calculateTotal(items = []) {\n  // Optimized & safe array reduction with fallback\n  return items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);\n}"
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400">⚡ AI Code Refactor & Health Auditor</h1>
            <p className="text-sm text-slate-400">Instantly audit, refactor, and fix messy or AI-generated code snippets.</p>
          </div>
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-medium">Live Production Ready</span>
        </header>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Paste Your Code (AI Slop / Buggy Code)</label>
            <textarea 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows="10"
              className="w-full bg-slate-950 text-emerald-300 font-mono text-sm p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <button 
              onClick={handleAudit}
              disabled={analyzing}
              className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center cursor-pointer"
            >
              {analyzing ? "Analyzing Code Structure..." : "Run AI Code Audit 🚀"}
            </button>
          </div>

          {/* Output Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Clean Refactored Result</label>
            <div className="flex-1 bg-slate-950 text-cyan-300 font-mono text-sm p-3 rounded-lg border border-slate-800 overflow-x-auto">
              {analyzing ? (
                <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
                  Scanning for memory leaks & syntax flaws...
                </div>
              ) : result ? (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-2 border-b border-slate-800 pb-2">
                    <span>Health Score: <strong className="text-emerald-400">{result.score}</strong></span>
                    <span>Bugs Fixed: <strong className="text-amber-400">{result.issues}</strong></span>
                  </div>
                  <pre className="whitespace-pre-wrap">{result.optimized}</pre>
                </div>
              ) : (
                <span className="text-slate-600 italic">Click audit to view cleaned code output...</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Built for Fiverr Portfolio Showcase • React & Tailwind CSS
        </div>
      </div>
    </div>
  );
}