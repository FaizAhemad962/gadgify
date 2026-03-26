import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const MAX_COMPARE = 4;

interface CompareContextType {
  compareIds: string[];
  addToCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const addToCompare = useCallback(
    (id: string): boolean => {
      if (compareIds.includes(id) || compareIds.length >= MAX_COMPARE)
        return false;
      setCompareIds((prev) => [...prev, id]);
      return true;
    },
    [compareIds],
  );

  const removeFromCompare = useCallback((id: string) => {
    setCompareIds((prev) => prev.filter((pid) => pid !== id));
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const isInCompare = useCallback(
    (id: string) => compareIds.includes(id),
    [compareIds],
  );

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isFull: compareIds.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};
