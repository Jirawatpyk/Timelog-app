import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Clock, BarChart3, Zap } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

describe('FeatureCard', () => {
  it('renders title and description', () => {
    render(
      <FeatureCard
        icon={Clock}
        title="Easy Time Logging"
        description="Record your work hours quickly and easily"
      />
    );

    expect(screen.getByText('Easy Time Logging')).toBeInTheDocument();
    expect(screen.getByText('Record your work hours quickly and easily')).toBeInTheDocument();
  });

  it('renders with Clock icon', () => {
    render(
      <FeatureCard
        icon={Clock}
        title="Test Feature"
        description="Test description"
      />
    );

    // The icon is rendered inside a div with specific styling
    const iconContainer = screen.getByText('Test Feature').closest('.flex')?.querySelector('svg');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders with BarChart3 icon', () => {
    render(
      <FeatureCard
        icon={BarChart3}
        title="Daily/Weekly Summary"
        description="Track your logged hours at a glance"
      />
    );

    expect(screen.getByText('Daily/Weekly Summary')).toBeInTheDocument();
    expect(screen.getByText('Track your logged hours at a glance')).toBeInTheDocument();
  });

  it('renders with Zap icon', () => {
    render(
      <FeatureCard
        icon={Zap}
        title="Quick Entry from Recent"
        description="Tap to auto-fill from previous entries"
      />
    );

    expect(screen.getByText('Quick Entry from Recent')).toBeInTheDocument();
    expect(screen.getByText('Tap to auto-fill from previous entries')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(
      <FeatureCard
        icon={Clock}
        title="Unique Title"
        description="Unique Description"
      />
    );

    // Find the main container by the unique title
    const container = screen.getByText('Unique Title').closest('.flex');
    expect(container).toHaveClass('items-start');
    expect(container).toHaveClass('gap-4');
  });
});
