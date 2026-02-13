import { useState, useEffect, useRef } from 'react';

function generateSessionId() {
  const cryptoObj = (typeof window !== "undefined" && window.crypto)
    || (typeof self !== "undefined" && self.crypto);

  if (cryptoObj && cryptoObj.getRandomValues) {
    const bytes = new Uint32Array(3);
    cryptoObj.getRandomValues(bytes);
    const randomStr = Array.from(bytes)
      .map((n) => n.toString(36))
      .join('')
      .substr(0, 9);
    return "user-" + randomStr;
  }

  // Fallback: non-cryptographic, only used if crypto is unavailable
  return "user-" + Math.random().toString(36).substr(2, 9);
}

const SESSION_ID = generateSessionId();
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    age: "child",
    inventory: ["Kokiri Sword"],
    current_dungeon: "Kokiri Forest",
    medallions: []
  });
  const msgsEndRef = useRef(null);

  // Poll for state updates (for demo purposes if state changes server-side)
  // or just fetch on load.
  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      // In dev, we might need to proxy or hit localhost:8787 if CORS enabled
      const res = await fetch(`${API_BASE}/state`, {
        headers: { 'X-Session-ID': SESSION_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (e) {
      console.error("Failed to fetch state", e);
    }
  };

  const updateState = async (updates) => {
    const newState = { ...state, ...updates };
    setState(newState); // Optimistic update
    try {
      await fetch(`${API_BASE}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': SESSION_ID
        },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error("Failed to update state", e);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs,
          sessionId: SESSION_ID
        })
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: "assistant", content: data.response || "..." }]);

      // Refresh state in case of side-effects (e.g. Master Sword event)
      fetchState();
    } catch (e) {
      setMessages([...newMsgs, { role: "assistant", content: "Navi is tired (Error connecting)." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item) => {
    const hasItem = state.inventory.includes(item);
    let newInv;
    if (hasItem) {
      newInv = state.inventory.filter(i => i !== item);
    } else {
      newInv = [...state.inventory, item];
    }
    updateState({ inventory: newInv });
  };

  return (
    <div className="flex h-screen bg-zelda-dark text-zelda-gold font-retro selection:bg-zelda-green selection:text-white">
      {/* Sidebar - State Management */}
      <div className="w-1/3 border-r-2 border-zelda-gold p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-center border-b-2 border-zelda-gold pb-2 tracking-widest flex items-center justify-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-zelda-gold shrink-0">
            <path d="M12 2L2 22h20L12 2zm0 3l7.5 15h-15L12 5zM12 5l-5 10h10L12 5z" />
            <path d="M7 12l5 10 5-10H7z" />
          </svg>
          QUEST STATUS
        </h1>

        <div className="mb-8">
          <h2 className="text-xl mb-3 text-zelda-green">AGE</h2>
          <div className="flex gap-4">
            <button
              onClick={() => updateState({ age: "child" })}
              className={`flex-1 py-2 border-2 transition-all duration-300 ${state.age === "child"
                ? "bg-zelda-gold text-zelda-dark font-black shadow-[0_0_20px_rgba(200,169,71,0.8)] border-zelda-gold scale-105 z-10"
                : "bg-gray-300 text-gray-600 border-gray-400 hover:bg-gray-200"
                }`}
            >
              CHILD
            </button>
            <button
              onClick={() => updateState({ age: "adult" })}
              className={`flex-1 py-2 border-2 transition-all duration-300 ${state.age === "adult"
                ? "bg-zelda-gold text-zelda-dark font-black shadow-[0_0_20px_rgba(200,169,71,0.8)] border-zelda-gold scale-105 z-10"
                : "bg-gray-300 text-gray-600 border-gray-400 hover:bg-gray-200"
                }`}
            >
              ADULT
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl mb-3 text-zelda-green">INVENTORY</h2>
          <div className="grid grid-cols-1 gap-2">
            {["Kokiri Sword", "Master Sword", "Deku Shield", "Hylian Shield", "Slingshot", "Hookshot", "Longshot", "Bow", "Megaton Hammer", "Boomerang", "Bombs"].map(item => (
              <label key={item} className="flex items-center space-x-3 cursor-pointer group select-none">
                <div className={`w-5 h-5 border-2 border-zelda-gold flex items-center justify-center transition-colors ${state.inventory.includes(item) ? "bg-zelda-gold" : "bg-transparent"}`}>
                  {state.inventory.includes(item) && <span className="text-zelda-dark text-xs font-bold">✓</span>}
                </div>
                <input
                  type="checkbox"
                  checked={state.inventory.includes(item)}
                  onChange={() => toggleItem(item)}
                  className="hidden"
                />
                <span className={`group-hover:text-white transition-colors font-bold ${state.inventory.includes(item) ? "text-zelda-gold" : "text-gray-500"}`}>
                  {item.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-20 opacity-50">
              <p>NAVI IS LISTENING...</p>
              <p className="text-sm mt-2">ASK FOR HELP.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl p-4 border border-zelda-gold ${m.role === 'user' ? 'bg-zelda-green/20' : 'bg-zelda-gold/10'} shadow-[0_0_10px_rgba(200,169,71,0.2)]`}>
                <p className={m.role === 'assistant' ? 'text-navi-blue' : 'text-white'}>
                  {m.role === 'assistant' && <span className="block font-bold mb-1 text-xs tracking-widest">NAVI</span>}
                  {m.role === 'user' && <span className="block font-bold mb-1 text-xs tracking-widest text-right">LINK</span>}
                  {m.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={msgsEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-6 border-t border-zelda-gold bg-zelda-dark">
          <div className="flex gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="WHAT SHOULD I DO NEXT?"
              className="flex-1 bg-transparent border-b-2 border-zelda-gold p-2 text-zelda-gold placeholder-zelda-gold/50 focus:outline-none focus:border-zelda-green transition-colors font-bold"
              style={{ color: '#C8A947' }} // Force color
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 border-2 border-zelda-gold hover:bg-zelda-gold hover:text-zelda-dark font-bold transition-all disabled:opacity-50"
            >
              {loading ? "..." : "ASK"}
            </button>
          </div>
          <div className="text-right text-xs text-zelda-gold/30 mt-2">v1.10 - NAVI AI</div>
        </form>
      </div>
    </div>
  );
}

export default App;
