import React from 'react';
import { render, screen, waitFor } from '@/utils/test-utils';
import MealSnap from '../MealSnap';
import { getNutritionInfo } from '@/services/aiService';
import { createMockFile } from '@/utils/test-utils';
import { FoodItem } from '@/types/nutrition';
import { FoodWithNutrition } from '@/types/nutrition';

// Mock the AI service module
jest.mock('@/services/aiService', () => ({
  getNutritionInfo: jest.fn(),
  analyzeText: jest.fn(),
  saveMealLog: jest.fn()
}));

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('MealSnap', () => {
  const mockGetNutritionInfo = getNutritionInfo as jest.MockedFunction<typeof getNutritionInfo>;
  
  const mockDetectedItems: FoodItem[] = [
    { id: '1', name: 'Apple' },
    { id: '2', name: 'Chicken' }
  ];
  
  const mockNutritionResults: FoodWithNutrition[] = [
    {
      id: '1',
      name: 'Apple',
      nutrition: {
        calories: '52',
        protein: '0.3',
        carbs: '14',
        fat: '0.2'
      }
    },
    {
      id: '2',
      name: 'Chicken',
      nutrition: {
        calories: '165',
        protein: '31',
        carbs: '0',
        fat: '3.6'
      }
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementations
    mockGetNutritionInfo.mockResolvedValue(mockNutritionResults);
  });
  
  test('renders upload step initially', () => {
    render(<MealSnap />);
    
    expect(screen.getByText(/Enter Food Items to Analyze/i)).toBeInTheDocument();
  });
  
  test('transitions to analyzing state after text input', async () => {
    const { user } = render(<MealSnap />);
    
    // Open the text input modal
    const addButton = screen.getByRole('button', { name: /Add Food to Analyse/i });
    await user.click(addButton);
    
    // Find the textarea and input some text
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Apple, Chicken');
    
    // Click the submit button
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);
    
    // Check transition to analyzing state
    await waitFor(() => {
      expect(screen.getByText(/Analyzing your input/i)).toBeInTheDocument();
    });
  });
  
  test('transitions to calculating state after successful analysis', async () => {
    const { user } = render(<MealSnap />);
    
    // Open the text input modal
    const addButton = screen.getByRole('button', { name: /Add Food to Analyse/i });
    await user.click(addButton);
    
    // Find the textarea and input some text
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Apple, Chicken');
    
    // Click the submit button
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);
    
    // Check transition to calculating state after analysis completes
    await waitFor(() => {
      expect(screen.getByText(/Calculating nutrition info/i)).toBeInTheDocument();
    });
  });
  
  test('shows error toast when analysis fails', async () => {
    // Mock analysis to fail
    jest.mock('@/services/aiService', () => ({
      getNutritionInfo: jest.fn(),
      analyzeText: jest.fn().mockRejectedValue(new Error('Analysis failed')),
      saveMealLog: jest.fn()
    }));
    
    const mockToast = jest.fn();
    jest.spyOn(require('@/components/ui/use-toast'), 'useToast').mockImplementation(() => ({
      toast: mockToast
    }));
    
    const { user } = render(<MealSnap />);
    
    // Open the text input modal
    const addButton = screen.getByRole('button', { name: /Add Food to Analyse/i });
    await user.click(addButton);
    
    // Find the textarea and input some text
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Apple, Chicken');
    
    // Click the submit button
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);
    
    // Check that error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'We couldn\'t analyze your text. Please try again.'
        })
      );
    });
    
    // Check that we're back to upload state
    await waitFor(() => {
      expect(screen.getByText(/Enter Food Items to Analyze/i)).toBeInTheDocument();
    });
  });
  
  test('transitions to results state after successful nutrition calculation', async () => {
    const { user } = render(<MealSnap />);
    
    // Open the text input modal
    const addButton = screen.getByRole('button', { name: /Add Food to Analyse/i });
    await user.click(addButton);
    
    // Find the textarea and input some text
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Apple, Chicken');
    
    // Click the submit button
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);
    
    // Check transition to results state after calculation completes
    await waitFor(() => {
      expect(screen.getByText(/Nutrition Analysis/i)).toBeInTheDocument();
    });
    
    // Check that nutrition results are displayed
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('52 kcal')).toBeInTheDocument();
  });
  
  test('shows error toast when nutrition calculation fails', async () => {
    // Mock nutrition calculation to fail
    mockGetNutritionInfo.mockRejectedValue(new Error('Calculation failed'));
    
    const mockToast = jest.fn();
    jest.spyOn(require('@/components/ui/use-toast'), 'useToast').mockImplementation(() => ({
      toast: mockToast
    }));
    
    const { user } = render(<MealSnap />);
    
    // Open the text input modal
    const addButton = screen.getByRole('button', { name: /Add Food to Analyse/i });
    await user.click(addButton);
    
    // Find the textarea and input some text
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Apple, Chicken');
    
    // Click the submit button
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);
    
    // Check error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'We couldn\'t calculate nutrition information. Please try again.'
        })
      );
    });
    
    // Check we're back to the edit state
    await waitFor(() => {
      expect(screen.getByText(/Calculating nutrition info/i)).toBeInTheDocument();
    });
  });
  
  test('resets to initial state after clicking analyze another meal', async () => {
    // Mock successful analysis and nutrition calculation
    mockGetNutritionInfo.mockResolvedValue(mockNutritionResults);
    
    const { user } = render(<MealSnap />);
    
    // Open the text input modal
    const addButton = screen.getByRole('button', { name: /Add Food to Analyse/i });
    await user.click(addButton);
    
    // Find the textarea and input some text
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Apple, Chicken');
    
    // Click the submit button
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);
    
    // Wait for results state
    await waitFor(() => {
      expect(screen.getByText(/Nutrition Analysis/i)).toBeInTheDocument();
    });
    
    // Click reset button
    const resetButton = screen.getByRole('button', { name: /Analyze Another Meal/i });
    await user.click(resetButton);
    
    // Check we're back to the initial upload state
    expect(screen.getByText(/Enter Food Items to Analyze/i)).toBeInTheDocument();
  });
});
