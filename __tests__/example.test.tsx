import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// サンプルコンポーネント
function ExampleComponent({ name }: { name: string }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
    </div>
  );
}

describe('ExampleComponent', () => {
  it('renders the component with the provided name', () => {
    render(<ExampleComponent name="World" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('renders with different name', () => {
    render(<ExampleComponent name="Vitest" />);
    expect(screen.getByRole('heading')).toHaveTextContent('Hello, Vitest!');
  });
});

describe('Basic Math Tests', () => {
  it('adds two numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('multiplies two numbers correctly', () => {
    expect(2 * 3).toBe(6);
  });
});
