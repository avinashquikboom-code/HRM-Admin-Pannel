'use client';

import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import { getInitials, isValidAvatarUrl } from '@/lib/avatarHelper';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  className?: string;
  imageClassName?: string;
  initialsClassName?: string;
  fallbackIconSize?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  firstName,
  lastName,
  className = 'w-10 h-10 rounded-full',
  imageClassName = 'w-full h-full object-cover rounded-full',
  initialsClassName = 'text-xs font-black text-primary select-none',
  fallbackIconSize = 20,
}) => {
  const [hasError, setHasError] = useState(false);
  const validSrc = isValidAvatarUrl(src);
  const initials = getInitials({ name, firstName, lastName });

  const showImage = validSrc && !hasError;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-primary/10 select-none ${className}`}>
      {showImage ? (
        <img
          src={src!}
          alt={name || 'Avatar'}
          className={imageClassName}
          onError={() => setHasError(true)}
        />
      ) : initials ? (
        <span className={initialsClassName}>{initials}</span>
      ) : (
        <UserIcon size={fallbackIconSize} className="text-primary/70" />
      )}
    </div>
  );
};
