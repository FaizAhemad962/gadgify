import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Container,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
} from "@mui/material";
import { ExpandMore, HelpOutline } from "@mui/icons-material";
import { faqApi } from "../../api/faqs";
import { tokens } from "../../theme/theme";

interface FAQProps {
  title?: string;
  description?: string;
}

// Default FAQs - shown when API data is not available
const DEFAULT_FAQS = [
  {
    id: "faq-1",
    question: "What is the return policy?",
    answer:
      "We offer a 30-day return policy for all products. Products must be unused and in original packaging. Once we receive your returned item, we will process the refund within 5-7 business days.",
    category: "Returns & Refunds",
  },
  {
    id: "faq-2",
    question: "How long does delivery take?",
    answer:
      "We offer standard delivery within 3-5 business days and express delivery within 1-2 business days across Maharashtra. Delivery times may vary based on location and product availability.",
    category: "Delivery",
  },
  {
    id: "faq-3",
    question: "Do you ship outside Maharashtra?",
    answer:
      "Currently, we operate only in Maharashtra. We are planning to expand to other states soon. Stay tuned for updates!",
    category: "Delivery",
  },
  {
    id: "faq-4",
    question: "Is my payment information secure?",
    answer:
      "Yes, we use industry-standard SSL encryption and PCI-DSS compliance to protect your payment information. We never store your full credit card details.",
    category: "Payment & Security",
  },
  {
    id: "faq-5",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards, digital wallets (GPay, PhonePe, Paytm), UPI, and net banking. We also support EMI options for qualifying purchases.",
    category: "Payment & Security",
  },
  {
    id: "faq-6",
    question: "Do you provide GST invoices?",
    answer:
      "Yes, we provide GST-compliant invoices for all purchases. The invoice is sent to your registered email address and is available in your order history.",
    category: "Orders & Billing",
  },
  {
    id: "faq-7",
    question: "How do I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking link via email and SMS. You can also track it from your order details on our website.",
    category: "Orders & Billing",
  },
  {
    id: "faq-8",
    question: "Can I cancel my order?",
    answer:
      "You can cancel your order within 24 hours of placement if it hasn't shipped yet. Go to My Orders and click the Cancel button. You'll receive a full refund.",
    category: "Orders & Billing",
  },
  {
    id: "faq-9",
    question: "What if the product is damaged on arrival?",
    answer:
      "If your product arrives damaged, contact our support team immediately with photos. We'll arrange a replacement or refund right away at no extra cost.",
    category: "Returns & Refunds",
  },
];

const FAQ: React.FC<FAQProps> = ({
  title = "common.faqTitle",
  description = "common.faqDesc",
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | false>(false);

  // Fetch FAQs from API
  const { data: faqsData, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => faqApi.getAll({ limit: 12 }),
    staleTime: 10 * 60 * 1000,
  });

  // Use API data if available, otherwise use default FAQs
  const faqs =
    faqsData?.faqs && faqsData.faqs.length > 0 ? faqsData.faqs : DEFAULT_FAQS;

  const handleChange =
    (faqId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? faqId : false);
    };

  // Group FAQs by category
  const categories = [...new Set(faqs.map((faq) => faq.category))];

  // Loading skeleton
  if (isLoading) {
    return (
      <Box sx={{ bgcolor: tokens.white, py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Skeleton
              variant="text"
              width={300}
              height={40}
              sx={{ mx: "auto", mb: 2 }}
            />
            <Skeleton
              variant="text"
              width={500}
              height={20}
              sx={{ mx: "auto" }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 4,
            }}
          >
            {[0, 1].map((col) => (
              <Box key={col}>
                {[0, 1, 2].map((row) => (
                  <Skeleton
                    key={row}
                    variant="rounded"
                    height={60}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: tokens.white, py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <HelpOutline sx={{ color: tokens.primary, fontSize: 28 }} />
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{ color: "text.primary" }}
            >
              {t(title)}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
          >
            {t(description)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 4,
          }}
        >
          {categories.map((category) => {
            const categoryFaqs = faqs.filter(
              (faq) => faq.category === category,
            );
            return (
              <Box key={category}>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    sx={{
                      color: tokens.primary,
                      mb: 2,
                      pb: 1,
                      borderBottom: `2px solid ${tokens.gray200}`,
                    }}
                  >
                    {category}
                  </Typography>
                  {categoryFaqs.map((faq) => (
                    <Accordion
                      key={faq.id}
                      expanded={expanded === faq.id}
                      onChange={handleChange(faq.id)}
                      sx={{
                        mb: 1,
                        border: `1px solid ${tokens.gray200}`,
                        "&.Mui-expanded": {
                          borderColor: tokens.primary,
                          boxShadow: `0 2px 8px ${tokens.primary}20`,
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                          "&:hover": {
                            bgcolor: `${tokens.gray50}`,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: expanded === faq.id ? 700 : 600,
                            color:
                              expanded === faq.id
                                ? tokens.primary
                                : "text.primary",
                          }}
                        >
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails
                        sx={{
                          bgcolor: tokens.gray50,
                          color: "text.secondary",
                          lineHeight: 1.7,
                        }}
                      >
                        {faq.answer}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ;
