import { Typography } from "@mui/material";
import LegalLayout from "./LegalLayout";

const RefundPolicy = () => {
  return (
    <LegalLayout title="Refund & Return Policy">
      <Typography paragraph>
        At Gadgify, we accept returns only for damaged, defective, or wrong
        products.
      </Typography>

      <Typography paragraph>
        To be eligible for a return, you must raise a request within
        <strong> 48 hours </strong> of receiving the product. An unboxing
        video is mandatory for verification.
      </Typography>

      <Typography paragraph>
        Products that are used, damaged after delivery, or returned due to
        change of mind are not eligible for return.
      </Typography>

      <Typography paragraph>
        Once approved, refunds will be processed within 5–7 business days
        to the original payment method.
      </Typography>
    </LegalLayout>
  );
};

export default RefundPolicy;
    