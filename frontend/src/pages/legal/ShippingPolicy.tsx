import { Typography } from "@mui/material";
import LegalLayout from "./LegalLayout";

const ShippingPolicy = () => {
  return (
    <LegalLayout title="Shipping Policy">
      <Typography paragraph>
        Orders placed on Gadgify are processed within 1–2 business days.
      </Typography>

      <Typography paragraph>
        Delivery usually takes 4–7 business days depending on your location.
        Shipping charges (if any) will be displayed at checkout.
      </Typography>

      <Typography paragraph>
        Delays may occur due to courier issues, weather conditions, or
        unforeseen circumstances.
      </Typography>
    </LegalLayout>
  );
};

export default ShippingPolicy;
