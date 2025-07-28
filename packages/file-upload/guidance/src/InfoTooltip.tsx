import type { ReactNode } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    fontSize: theme.typography.pxToRem(16),
    padding: '1rem 1.5rem',
  },
}));

export function InfoTooltip({children, color}: {children: ReactNode, color?: any}) {
  return (
    <CustomTooltip title={children} placement="top">
      <InfoIcon style={{ cursor: 'help' }} color={color || "action"} />
    </CustomTooltip>
  );
}