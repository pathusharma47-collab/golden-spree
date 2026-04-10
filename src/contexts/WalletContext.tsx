import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  addFunds: (amount: number) => void;
  withdraw: (amount: number) => boolean;
  deductForInvestment: (amount: number, metalType: string, grams: string) => boolean;
  isNewUser: boolean;
}

const WalletContext = createContext<WalletContextType>({
  balance: 0,
  transactions: [],
  addFunds: () => {},
  withdraw: () => false,
  deductForInvestment: () => false,
  isNewUser: false,
});

export const useWallet = () => useContext(WalletContext);

const getStorageKey = (email: string) => `wallet_${email}`;
const getTxKey = (email: string) => `wallet_tx_${email}`;
const getBonusKey = (email: string) => `wallet_bonus_${email}`;

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user ? getStorageKey(user.email) : "";
  const txKey = user ? getTxKey(user.email) : "";
  const bonusKey = user ? getBonusKey(user.email) : "";

  const [isNewUser, setIsNewUser] = useState(false);

  const [balance, setBalance] = useState<number>(() => {
    if (!storageKey) return 0;
    return parseFloat(localStorage.getItem(storageKey) || "0");
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    if (!txKey) return [];
    const stored = localStorage.getItem(txKey);
    return stored ? JSON.parse(stored) : [];
  });

  // Re-sync when user changes + apply welcome bonus for new users
  useEffect(() => {
    if (!storageKey) { setBalance(0); setTransactions([]); setIsNewUser(false); return; }

    const existingBal = localStorage.getItem(storageKey);
    const bonusApplied = localStorage.getItem(bonusKey);

    if (!existingBal && !bonusApplied) {
      // New user — give ₹100 welcome bonus
      const tx: WalletTransaction = {
        id: Date.now().toString(),
        type: "credit",
        amount: 100,
        description: "🎁 Welcome Bonus",
        date: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, "100");
      localStorage.setItem(txKey, JSON.stringify([tx]));
      localStorage.setItem(bonusKey, "true");
      setBalance(100);
      setTransactions([tx]);
      setIsNewUser(true);
    } else {
      setBalance(parseFloat(localStorage.getItem(storageKey) || "0"));
      const stored = localStorage.getItem(txKey);
      setTransactions(stored ? JSON.parse(stored) : []);
      setIsNewUser(false);
    }
  }, [storageKey, txKey, bonusKey]);

  const persist = useCallback((newBal: number, newTx: WalletTransaction[]) => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, String(newBal));
    localStorage.setItem(txKey, JSON.stringify(newTx));
    setBalance(newBal);
    setTransactions(newTx);
  }, [storageKey, txKey]);

  const addTx = (txs: WalletTransaction[], tx: WalletTransaction) => [tx, ...txs].slice(0, 50);

  const addFunds = useCallback((amount: number) => {
    const newBal = balance + amount;
    const tx: WalletTransaction = {
      id: Date.now().toString(),
      type: "credit",
      amount,
      description: "Added funds to wallet",
      date: new Date().toISOString(),
    };
    persist(newBal, addTx(transactions, tx));
  }, [balance, transactions, persist]);

  const withdraw = useCallback((amount: number): boolean => {
    if (amount > balance) return false;
    const newBal = balance - amount;
    const tx: WalletTransaction = {
      id: Date.now().toString(),
      type: "debit",
      amount,
      description: "Withdrawn to bank",
      date: new Date().toISOString(),
    };
    persist(newBal, addTx(transactions, tx));
    return true;
  }, [balance, transactions, persist]);

  const deductForInvestment = useCallback((amount: number, metalType: string, grams: string): boolean => {
    if (amount > balance) return false;
    const newBal = balance - amount;
    const tx: WalletTransaction = {
      id: Date.now().toString(),
      type: "debit",
      amount,
      description: `Invested in ${metalType} (${grams}g)`,
      date: new Date().toISOString(),
    };
    persist(newBal, addTx(transactions, tx));
    return true;
  }, [balance, transactions, persist]);

  return (
    <WalletContext.Provider value={{ balance, transactions, addFunds, withdraw, deductForInvestment, isNewUser }}>
      {children}
    </WalletContext.Provider>
  );
};