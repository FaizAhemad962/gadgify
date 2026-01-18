import { Container, Box, Typography } from "@mui/material";

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

const LegalLayout = ({ title, children }: LegalLayoutProps) => {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography
        variant="h4"
        fontWeight={800}
        gutterBottom
        sx={{ mb: 3 }}
      >
        {title}
      </Typography>
      <Box sx={{ color: "text.secondary", lineHeight: 1.9 }}>
        {children}
      </Box>
    </Container>
  );
};

export default LegalLayout;
