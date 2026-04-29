import { Avatar, type AvatarProps, styled } from "@mui/material";
import { tokens } from "@/theme/theme";

const StyledAvatar = styled(Avatar)<AvatarProps>(() => ({
  backgroundColor: tokens.gray100,
  color: tokens.primary,
  fontWeight: 600,
  border: `1px solid ${tokens.gray200}`,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    borderColor: tokens.accent,
    transform: "scale(1.05)",
  },
}));

export const CustomAvatar = (props: AvatarProps) => {
  return <StyledAvatar {...props} />;
};
