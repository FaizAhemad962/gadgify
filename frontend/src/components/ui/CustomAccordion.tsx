import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  type AccordionProps,
  styled,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { tokens } from "@/theme/theme";

const StyledAccordion = styled(Accordion)<AccordionProps>(() => ({
  backgroundColor: tokens.white,
  borderRadius: "12px !important",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  border: `1px solid ${tokens.gray200}`,
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    margin: "16px 0",
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(() => ({
  padding: "8px 20px",
  "& .MuiAccordionSummary-content": {
    margin: "12px 0",
    "&.Mui-expanded": {
      margin: "12px 0",
    },
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    color: tokens.primary,
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(() => ({
  padding: "0 20px 20px",
  borderTop: `1px solid ${tokens.gray100}`,
}));

export const CustomAccordion = ({
  title,
  children,
  ...props
}: AccordionProps & { title: React.ReactNode }) => {
  return (
    <StyledAccordion {...props}>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        {title}
      </StyledAccordionSummary>
      <StyledAccordionDetails>{children}</StyledAccordionDetails>
    </StyledAccordion>
  );
};
