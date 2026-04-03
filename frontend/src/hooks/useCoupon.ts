import { useEffect } from "react";
import { useCouponContext } from "../context/CouponContext";
import type { CouponValidation } from "../api/coupons";

interface UseCouponOptions {
  onApplySuccess?: (coupon: CouponValidation) => void;
  onApplyError?: (error: string) => void;
}

export const useCoupon = (options?: UseCouponOptions) => {
  const context = useCouponContext();

  useEffect(() => {
    if (options?.onApplySuccess && context.promo) {
      options.onApplySuccess(context.promo);
    }
  }, [context.promo, options]);

  useEffect(() => {
    if (options?.onApplyError && context.error) {
      options.onApplyError(context.error);
    }
  }, [context.error, options]);

  return {
    // State
    code: context.code,
    error: context.error,
    promo: context.promo,
    isValidatingPromo: context.isValidatingPromo,
    discount: context.discount,

    // Setters
    setCode: context.setCode,
    setError: context.setError,

    // Methods
    applyPromo: context.applyPromo,
    removePromo: context.removePromo,
  };
};
