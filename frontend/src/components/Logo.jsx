
import React from 'react';

export default function Logo({ compact = false, dashboard = false }) {
  const logoSrc = dashboard
    ? '/corex-logo-dashboard.svg'
    : '/corex-logo.svg';

  return (
    <img
      className={`corex-logo ${compact ? 'compact' : ''}`}
      src={logoSrc}
      alt="CoreX Fitness"
    />
  );
}
