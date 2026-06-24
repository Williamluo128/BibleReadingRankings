import React from 'react';
import type { UserRole } from '@bible-rankings/shared';

const roleLabels: Record<UserRole, string> = {
  USER: '普通用户',
  ADMIN: '管理员',
  SUPER_ADMIN: '超级管理员',
};

interface RoleBadgeProps {
  role: UserRole;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const elevated = role === 'ADMIN' || role === 'SUPER_ADMIN';

  return (
    <span
      className={`inline-block text-xs uppercase tracking-wider px-2 py-1 border ${
        elevated
          ? 'border-ink text-ink bg-surface'
          : 'border-border-warm text-muted bg-bone'
      }`}
    >
      {roleLabels[role]}
    </span>
  );
};
