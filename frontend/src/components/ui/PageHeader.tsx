import React from "react";
import { Box, Typography, Breadcrumbs, Link } from "@/mui/material";
import { Link as RouterLink } from "react-router-dom";
import { tokens } from "@/theme/theme";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  action,
}: PageHeaderProps) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && (
        <Breadcrumbs sx={{ mb: 2 }}>
          {breadcrumbs.map((item, index) =>
            item.path ? (
              <Link
                key={index}
                component={RouterLink}
                to={item.path}
                underline="hover"
                color="inherit"
                sx={{
                  color: tokens.secondary,
                  typography: "body2",
                  fontWeight: 600,
                  "&:hover": { color: tokens.primary },
                }}
              >
                {item.label}
              </Link>
            ) : (
              <Typography
                key={index}
                sx={{
                  color: tokens.gray700,
                  typography: "body2",
                  fontWeight: 700,
                }}
              >
                {item.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "flex-end" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h2"
            gutterBottom
            sx={{ color: tokens.gray900, fontWeight: 800 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: tokens.gray600 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
};
