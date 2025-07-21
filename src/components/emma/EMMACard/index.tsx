/**
 * EMMA Card Component
 * 
 * Healthcare-optimized card component built on Material UI Card
 * with medical data layouts and EMMA design system styling.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardActions, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { EMMACardProps, EMMACardVariant, StatusChip } from '@/types/emma';

// Healthcare-specific card styling
interface EMMACardRootProps {
  emmaVariant?: EMMACardVariant;
  elevation?: number;
}

const EMMACardRoot = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'emmaVariant',
})<EMMACardRootProps>(({ theme, emmaVariant, elevation }) => ({
  borderRadius: 12,
  border: `1px solid ${theme.palette.grey[200]}`,
  transition: 'all 0.3s ease-in-out',
  
  // Healthcare-specific card variants
  ...(emmaVariant === 'patient-info' && {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    '&:hover': {
      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
      transform: 'translateY(-2px)',
    },
  }),

  ...(emmaVariant === 'evaluation-card' && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
    backgroundColor: '#ecfdf5',
  }),

  ...(emmaVariant === 'urgent-card' && {
    borderLeft: `4px solid ${theme.palette.error.main}`,
    backgroundColor: '#fef2f2',
  }),

  ...(emmaVariant === 'warning-card' && {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
    backgroundColor: '#fffbeb',
  }),

  ...(emmaVariant === 'resident-card' && {
    borderRadius: 16,
    overflow: 'hidden',
    '&:hover': {
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-4px)',
    },
  }),

  ...(emmaVariant === 'dashboard-metric' && {
    textAlign: 'center',
    padding: theme.spacing(3),
    background: `linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)`,
    '&:hover': {
      background: `linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)`,
    },
  }),
}));

const EMMACard: React.FC<EMMACardProps> = ({
  children,
  title,
  subtitle,
  emmaVariant = 'default',
  statusChip,
  pgyLevel,
  actions,
  elevation = 1,
  onClick,
  ...props
}) => {
  // Generate PGY level indicator
  const renderPGYIndicator = (): React.ReactElement | null => {
    if (!pgyLevel) return null;
    
    return (
      <Chip
        label={`PGY-${pgyLevel}`}
        size="small"
        sx={{
          backgroundColor: `var(--emma-pgy-${pgyLevel})`,
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      />
    );
  };

  // Generate status chip
  const renderStatusChip = (): React.ReactElement | null => {
    if (!statusChip) return null;

    const { status, label } = statusChip;
    
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: `var(--emma-evaluation-${status})`,
          color: '#ffffff',
          fontWeight: 500,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
        }}
      />
    );
  };

  return (
    <EMMACardRoot
      emmaVariant={emmaVariant}
      elevation={elevation}
      onClick={onClick}
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      {(title || subtitle || pgyLevel || statusChip) && (
        <CardHeader
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {title && (
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  {title}
                </Typography>
              )}
              {renderPGYIndicator()}
              {renderStatusChip()}
            </div>
          }
          subheader={
            subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )
          }
          sx={{ paddingBottom: title || subtitle ? 1 : 0 }}
        />
      )}

      <CardContent sx={{ paddingTop: title || subtitle ? 1 : 2 }}>
        {children}
      </CardContent>

      {actions && (
        <CardActions sx={{ justifyContent: 'flex-end', padding: 2 }}>
          {actions}
        </CardActions>
      )}
    </EMMACardRoot>
  );
};

export default EMMACard;