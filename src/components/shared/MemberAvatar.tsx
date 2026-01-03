// src/components/shared/MemberAvatar.tsx
import { cn } from '@/lib/utils';

interface MemberAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

// Generate consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-amber-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function MemberAvatar({ name, size = 'md', className }: MemberAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getAvatarColor(name);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-medium',
        sizeClasses[size],
        bgColor,
        className
      )}
    >
      {initial}
    </div>
  );
}
