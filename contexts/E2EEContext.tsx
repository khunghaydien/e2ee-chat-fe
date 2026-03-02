"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type E2EEContextValue = {
  /** Private key (chỉ trong memory). Null nếu chưa dán key hoặc chưa đăng ký xong. */
  privateKey: CryptoKey | null;
  /** Xóa private key khỏi memory */
  lock: () => void;
  /** Set private key trực tiếp (sau khi dán JWK hoặc sau khi sign up). */
  setPrivateKey: (key: CryptoKey | null) => void;
};

const E2EEContext = createContext<E2EEContextValue | null>(null);

export function E2EEProvider({ children }: { children: ReactNode }) {
  const [privateKey, setPrivateKeyState] = useState<CryptoKey | null>(null);

  const lock = useCallback(() => {
    setPrivateKeyState(null);
  }, []);

  const setPrivateKey = useCallback((key: CryptoKey | null) => {
    setPrivateKeyState(key);
  }, []);

  const value: E2EEContextValue = {
    privateKey: privateKey ?? null,
    lock,
    setPrivateKey,
  };

  return (
    <E2EEContext.Provider value={value}>{children}</E2EEContext.Provider>
  );
}

export function useE2EE() {
  const ctx = useContext(E2EEContext);
  if (!ctx) throw new Error("useE2EE must be used within E2EEProvider");
  return ctx;
}
