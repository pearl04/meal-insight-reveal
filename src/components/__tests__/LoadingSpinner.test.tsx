
import React from 'react';
import { render } from '@/utils/test-utils';
import LoadingSpinner from '../LoadingSpinner';
import { jest, expect, describe, test } from '@jest/globals';
import '@testing-library/jest-dom';

describe('LoadingSpinner', () => {
  test('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('div > div');
    
    // Check that the spinner has the medium size class
    expect(spinner).toHaveClass('h-8');
    expect(spinner).toHaveClass('w-8');
  });
  
  test('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinner = container.querySelector('div > div');
    
    // Check that the spinner has the small size class
    expect(spinner).toHaveClass('h-4');
    expect(spinner).toHaveClass('w-4');
  });
  
  test('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const spinner = container.querySelector('div > div');
    
    // Check that the spinner has the large size class
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });
  
  test('applies additional className', () => {
    const { container } = render(<LoadingSpinner className="test-class" />);
    const spinner = container.querySelector('div > div');
    
    // Check that the spinner has the additional class
    expect(spinner).toHaveClass('test-class');
  });
});
