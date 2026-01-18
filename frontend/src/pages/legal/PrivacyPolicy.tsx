import { Typography } from "@mui/material";
import LegalLayout from "./LegalLayout";

const PrivacyPolicy = () => {
  return (
    <LegalLayout title="Privacy Policy">
      <Typography paragraph>
        At Gadgify, we respect your privacy and are committed to protecting
        your personal information.
      </Typography>

      <Typography paragraph>
        We collect information such as name, phone number, email address,
        and shipping address only to process orders and provide customer
        support.
      </Typography>

      <Typography paragraph>
        We do not sell or share your personal data with third parties,
        except payment gateways and delivery partners required to fulfill
        your order.
      </Typography>

      <Typography paragraph>
        All payments are processed securely using trusted payment providers.
        By using our website, you agree to this Privacy Policy.
      </Typography>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
