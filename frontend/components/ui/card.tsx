import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-[#FF6B00]/30 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-6 shadow-[0_10px_25px_-5px_rgba(255,107,0,0.15)]',
        className
      )}
      {...props}
    />
  );
}
