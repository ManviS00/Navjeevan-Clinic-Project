import type { ReactNode, CSSProperties } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
  once?: boolean;
}

const offsets: Record<Direction, string> = {
  up: 'translateY(28px)',
  down: 'translateY(-28px)',
  left: 'translateX(40px)',
  right: 'translateX(-40px)',
  scale: 'scale(0.92)',
  none: 'none',
};

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  as = 'div',
  once = true,
}: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ once });

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : offsets[direction],
    transition: `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
    willChange: 'opacity, transform',
  };

  const Tag = as as 'div';

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
