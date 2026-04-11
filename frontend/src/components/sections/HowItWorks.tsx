import { useTranslation } from "react-i18next";
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Search,
  ShoppingCart,
  Payment,
  LocalShipping,
  CheckCircle,
} from "@mui/icons-material";
import { tokens } from "../../theme/theme";

interface StepItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface HowItWorksProps {
  title?: string;
  description?: string;
  steps?: StepItem[];
}

const DEFAULT_STEPS: StepItem[] = [
  {
    icon: <Search sx={{ fontSize: 40 }} />,
    title: "common.howItWorks.step1.title",
    description: "common.howItWorks.step1.desc",
    color: tokens.primary,
  },
  {
    icon: <ShoppingCart sx={{ fontSize: 40 }} />,
    title: "common.howItWorks.step2.title",
    description: "common.howItWorks.step2.desc",
    color: tokens.accent,
  },
  {
    icon: <Payment sx={{ fontSize: 40 }} />,
    title: "common.howItWorks.step3.title",
    description: "common.howItWorks.step3.desc",
    color: tokens.secondary,
  },
  {
    icon: <LocalShipping sx={{ fontSize: 40 }} />,
    title: "common.howItWorks.step4.title",
    description: "common.howItWorks.step4.desc",
    color: tokens.success,
  },
  {
    icon: <CheckCircle sx={{ fontSize: 40 }} />,
    title: "common.howItWorks.step5.title",
    description: "common.howItWorks.step5.desc",
    color: tokens.info,
  },
];

const HowItWorks: React.FC<HowItWorksProps> = ({
  title = "common.howItWorksTitle",
  description = "common.howItWorksDesc",
  steps = DEFAULT_STEPS,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ bgcolor: tokens.gray50, py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{ color: "text.primary", mb: 1 }}
          >
            {t(title)}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
          >
            {t(description)}
          </Typography>
        </Box>

        {/* Stepper view for medium screens only */}
        <Box sx={{ display: { xs: "none", md: "block", lg: "none" }, mb: 6 }}>
          <Stepper
            activeStep={-1}
            sx={{
              "& .MuiStepConnector-line": {
                borderTopWidth: 3,
                borderColor: tokens.gray300,
              },
            }}
          >
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel sx={{ color: "text.primary" }}>
                  {step.title}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Card view for all screens */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: { xs: 3, md: 2, lg: 2.5 },
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={index}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                p: { xs: 3, md: 2.5, lg: 2.5 },
                border: `2px solid ${tokens.gray200}`,
                borderRadius: 2,
                transition: "all 0.25s",
                position: "relative",
                "&:hover": {
                  borderColor: step.color,
                  boxShadow: `0 8px 24px ${step.color}22`,
                  transform: "translateY(-4px)",
                },
              }}
            >
              {/* Step Number Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: { xs: 32, lg: 32 },
                  height: { xs: 32, lg: 32 },
                  borderRadius: "50%",
                  bgcolor: step.color,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                }}
              >
                {index + 1}
              </Box>

              <Box sx={{ pt: 2 }}>
                <Box
                  sx={{
                    color: step.color,
                    mb: 2,
                    "& svg": {
                      fontSize: { xs: 40, lg: 40 },
                    },
                  }}
                >
                  {step.icon}
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{
                    color: "text.primary",
                    mb: 1,
                    fontSize: { xs: "1rem", lg: "1rem" },
                  }}
                >
                  {t(step.title)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.6,
                    fontSize: { xs: "0.875rem", lg: "0.875rem" },
                  }}
                >
                  {t(step.description)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
