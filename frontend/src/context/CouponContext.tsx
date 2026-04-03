import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { couponsApi, type CouponValidation } from "../api/coupons";

interface CouponContextType {
  code: string;
  error: string;
  promo: CouponValidation | null;
  isValidatingPromo: boolean;
  discount: number;
  setCode: (code: string) => void;
  setError: (error: string) => void;
  applyPromo: (subtotal: number) => Promise<void>;
  removePromo: () => void;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider = ({ children }: { children: ReactNode }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [promo, setPromo] = useState<CouponValidation | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const applyPromo = useCallback(
    async (subtotal: number) => {
      if (!code.trim()) {
        setError("Coupon code is required");
        return;
      }

      // If coupon is already applied with the same code, don't apply again
      if (promo && promo.code.toUpperCase() === code.trim().toUpperCase()) {
        setError("This coupon is already applied");
        return;
      }

      setError("");
      setIsValidatingPromo(true);

      try {
        const result = await couponsApi.validate(code.trim(), subtotal);
        setPromo(result);
        setError("");
        setCode(""); // Clear input after successful apply
      } catch (err: unknown) {
        const message =
          err instanceof Error && "response" in err
            ? (err as any).response?.data?.message || "Invalid coupon code"
            : "Invalid coupon code";
        setError(message);
        setPromo(null);
      } finally {
        setIsValidatingPromo(false);
      }
    },
    [code, promo],
  );

  const removePromo = useCallback(() => {
    setPromo(null);
    setCode("");
    setError("");
  }, []);

  const discount = promo?.discount || 0;

  const value: CouponContextType = {
    code,
    error,
    promo,
    isValidatingPromo,
    discount,
    setCode,
    setError,
    applyPromo,
    removePromo,
  };

  return (
    <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
  );
};

export const useCouponContext = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error("useCouponContext must be used within a CouponProvider");
  }
  return context;
};
