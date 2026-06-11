"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Notif { id: number; msg: string; type: "success" | "error" }

interface NotifContextType {
  notify: (msg: string, type?: "success" | "error") => void;
}

const NotifContext = createContext<NotifContextType>({ notify: () => {} });

export function NotifProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notif[]>([]);

  const notify = useCallback((msg: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setItems((p) => [...p, { id, msg, type }]);
    setTimeout(() => setItems((p) => p.filter((n) => n.id !== id)), 3200);
  }, []);

  return (
    <NotifContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-[70px] right-4 z-[600] flex flex-col gap-2 pointer-events-none">
        {items.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white shadow-xl
              animate-slide-in pointer-events-auto
              ${n.type === "success" ? "bg-emerald-800" : "bg-red-900"}`}
          >
            {n.msg}
          </div>
        ))}
      </div>
    </NotifContext.Provider>
  );
}

export function useNotif() {
  return useContext(NotifContext);
}
