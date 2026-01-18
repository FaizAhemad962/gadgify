import { Typography } from "@mui/material";
import LegalLayout from "./LegalLayout";

const TermsConditions = () => {
  return (
    <LegalLayout title="Terms & Conditions">
      <Typography paragraph>
        By accessing and using Gadgify, you agree to comply with these terms
        and conditions.
      </Typography>

      <Typography paragraph>
        Product prices and availability are subject to change without
        notice. We reserve the right to cancel orders in case of pricing
        errors or stock unavailability.
      </Typography>

      <Typography paragraph>
        Users must provide accurate information while placing orders.
        Misuse of the website may result in account suspension.
      </Typography>

      <Typography paragraph>
        All content on this website belongs to Gadgify and may not be copied
        or reused without permission.
      </Typography>
    </LegalLayout>
  );
};

export default TermsConditions;
