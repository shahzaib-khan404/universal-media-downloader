import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressRing } from '../../features/download/components/progress-ring';

describe('ProgressRing', () => {
  it('renders the progress percentage', () => {
    render(<ProgressRing progress={42} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('clamps progress above 100', () => {
    render(<ProgressRing progress={120} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows 0% when progress is 0', () => {
    render(<ProgressRing progress={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders an SVG with two circles', () => {
    const { container } = render(<ProgressRing progress={50} />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });

  it('applies correct strokeDashoffset for 50%', () => {
    const { container } = render(<ProgressRing progress={50} size={200} strokeWidth={14} />);
    const circles = container.querySelectorAll('circle');
    const progressCircle = circles[1];
    const offset = parseFloat(progressCircle.getAttribute('stroke-dashoffset') ?? '0');
    const r = (200 - 14) / 2;
    const circumference = 2 * Math.PI * r;
    expect(offset).toBeCloseTo(circumference * 0.5, 1);
  });
});
