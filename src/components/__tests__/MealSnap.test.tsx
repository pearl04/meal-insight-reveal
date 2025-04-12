
import React from 'react';
import { render, screen, waitFor } from '@/utils/test-utils';
import MealSnap from '../MealSnap';
import { analyzeImage, getNutritionInfo } from '@/services/aiService';
import { createMockFile } from '@/utils/test-utils';
import { FoodItem } from '@/types/nutrition';
import { FoodWithNutrition } from '@/types/nutrition';

// Mock the AI service module
jest.mock('@/services/aiService', () => ({
  analyzeImage: jest.fn(),
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
  const mockAnalyzeImage = analyzeImage as jest.MockedFunction<typeof analyzeImage>;
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
    mockAnalyzeImage.mockResolvedValue(mockDetectedItems);
    mockGetNutritionInfo.mockResolvedValue(mockNutritionResults);
  });
  
  test('renders upload step initially', () => {
    render(<MealSnap />);
    
    expect(screen.getByText(/Upload your meal photo/i)).toBeInTheDocument();
  });
  
  test('transitions to analyzing state after image upload', async () => {
    const { user } = render(<MealSnap />);
    
    // Mock FileReader for image upload
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Find image input and upload a file
    const file = createMockFile();
    const input = document.querySelector('input[type="file"]')!;
    
    // Upload file
    Object.defineProperty(input, 'files', {
      value: [file]
    });
    await user.click(input);
    
    // Trigger FileReader onload
    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({} as any);
    }
    
    // Check transition to analyzing state
    await waitFor(() => {
      expect(screen.getByText(/Analyzing your meal/i)).toBeInTheDocument();
    });
    
    // Restore FileReader
    global.FileReader = originalFileReader;
  });
  
  test('transitions to edit state after successful analysis', async () => {
    const { user } = render(<MealSnap />);
    
    // Mock FileReader for image upload
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Find image input and upload a file
    const file = createMockFile();
    const input = document.querySelector('input[type="file"]')!;
    
    // Upload file
    Object.defineProperty(input, 'files', {
      value: [file]
    });
    await user.click(input);
    
    // Trigger FileReader onload
    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({} as any);
    }
    
    // Check transition to edit state after analysis completes
    await waitFor(() => {
      expect(screen.getByText(/We detected these food items/i)).toBeInTheDocument();
    });
    
    // Check that detected items are displayed
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Chicken')).toBeInTheDocument();
    
    // Restore FileReader
    global.FileReader = originalFileReader;
  });
  
  test('shows error toast when analysis fails', async () => {
    // Mock analysis to fail
    mockAnalyzeImage.mockRejectedValue(new Error('Analysis failed'));
    
    const mockToast = jest.fn();
    jest.spyOn(require('@/components/ui/use-toast'), 'useToast').mockImplementation(() => ({
      toast: mockToast
    }));
    
    const { user } = render(<MealSnap />);
    
    // Mock FileReader for image upload
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Find image input and upload a file
    const file = createMockFile();
    const input = document.querySelector('input[type="file"]')!;
    
    // Upload file
    Object.defineProperty(input, 'files', {
      value: [file]
    });
    await user.click(input);
    
    // Trigger FileReader onload
    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({} as any);
    }
    
    // Check that error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Analysis failed'
        })
      );
    });
    
    // Check that we're back to upload state
    await waitFor(() => {
      expect(screen.getByText(/Upload your meal photo/i)).toBeInTheDocument();
    });
    
    // Restore FileReader
    global.FileReader = originalFileReader;
  });
  
  test('transitions to calculating state after confirming food items', async () => {
    // Pre-set the component to be in edit state
    mockAnalyzeImage.mockResolvedValue(mockDetectedItems);
    
    const { user } = render(<MealSnap />);
    
    // Mock FileReader for image upload
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Upload file to get to edit state
    const file = createMockFile();
    const input = document.querySelector('input[type="file"]')!;
    Object.defineProperty(input, 'files', { value: [file] });
    await user.click(input);
    if (mockFileReaderInstance.onload) mockFileReaderInstance.onload({} as any);
    
    // Wait for edit state
    await waitFor(() => {
      expect(screen.getByText(/We detected these food items/i)).toBeInTheDocument();
    });
    
    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm Items/i });
    await user.click(confirmButton);
    
    // Check transition to calculating state
    await waitFor(() => {
      expect(screen.getByText(/Calculating nutrition info/i)).toBeInTheDocument();
    });
    
    // Restore FileReader
    global.FileReader = originalFileReader;
  });
  
  test('shows error toast when no food items are confirmed', async () => {
    // Pre-set the component to be in edit state with empty items
    mockAnalyzeImage.mockResolvedValue([]);
    
    const mockToast = jest.fn();
    jest.spyOn(require('@/components/ui/use-toast'), 'useToast').mockImplementation(() => ({
      toast: mockToast
    }));
    
    const { user } = render(<MealSnap />);
    
    // Mock FileReader for image upload
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Upload file to get to edit state
    const file = createMockFile();
    const input = document.querySelector('input[type="file"]')!;
    Object.defineProperty(input, 'files', { value: [file] });
    await user.click(input);
    if (mockFileReaderInstance.onload) mockFileReaderInstance.onload({} as any);
    
    // Wait for edit state
    await waitFor(() => {
      expect(screen.getByText(/We detected these food items/i)).toBeInTheDocument();
    });
    
    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm Items/i });
    await user.click(confirmButton);
    
    // Check error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'No food items'
        })
      );
    });
    
    // Restore FileReader
    global.FileReader = originalFileReader;
  });
  
  test('transitions to results state after successful nutrition calculation', async () => {
    // Pre-set the component to be in edit state
    mockAnalyzeImage.mockResolvedValue(mockDetectedItems);
    
    const { user } = render(<MealSnap />);
    
    // Mock FileReader for image upload
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Upload file to get to edit state
    const file = createMockFile();
    const input = document.querySelector('input[type="file"]')!;
    Object.defineProperty(input, 'files', { value: [file] });
    await user.click(input);
    if (mockFileReaderInstance.onload) mockFileReaderInstance.onload({} as any);
    
    // Wait for edit state
    await waitFor(() => {
      expect(screen.getByText(/We detected these food items/i)).toBeInTheDocument();
    });
    
    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm Items/i });
    await user.click(confirmButton);
    
    // Check transition to results state after calculation completes
    await waitFor(() => {
      expect(screen.getByText(/Nutrition Analysis/i)).toBeInTheDocument();
    });
    
    // Check that nutrition results are displayed
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('52 kcal')).toBeInTheDocument();
    
    // Restore FileReader
    global.FileReader = originalFileReader;
  });
  
  test('shows error toast when nutrition calculation fails', async () => {
    // Pre-set the component to be in edit state but make nutrition calculation fail
    mockAnalyzeImage.mockResolvedValue(mockDetectedItems);
    mockGetNutritionInfo.mockRejectedValue(new Error('Calculation failed'));
    
    const mockToast = jest.fn();
    jest.spyOn(require('@/components/ui/use-toast'), 'useToast').mockImplementation(() => ({
      toast: mockToast
    }));
    
    const { user } = render(<MealSnap />);
    
    // Mock FileReader for image upload
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Upload file to get to edit state
    const file = createMockFile();
    const input = document.querySelector('input[type="file"]')!;
    Object.defineProperty(input, 'files', { value: [file] });
    await user.click(input);
    if (mockFileReaderInstance.onload) mockFileReaderInstance.onload({} as any);
    
    // Wait for edit state
    await waitFor(() => {
      expect(screen.getByText(/We detected these food items/i)).toBeInTheDocument();
    });
    
    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm Items/i });
    await user.click(confirmButton);
    
    // Check error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Calculation failed'
        })
      );
    });
    
    // Check we're back to the edit state
    await waitFor(() => {
      expect(screen.getByText(/We detected these food items/i)).toBeInTheDocument();
    });
    
    // Restore FileReader
    global.FileReader = originalFileReader;
  });
  
  test('resets to initial state after clicking analyze another meal', async () => {
    // Pre-set the component to be in results state
    mockAnalyzeImage.mockResolvedValue(mockDetectedItems);
    mockGetNutritionInfo.mockResolvedValue(mockNutritionResults);
    
    const { user } = render(<MealSnap />);
    
    // Mock FileReader for image upload
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Upload file to get to results state
    const file = createMockFile();
    const input = document.querySelector('input[type="file"]')!;
    Object.defineProperty(input, 'files', { value: [file] });
    await user.click(input);
    if (mockFileReaderInstance.onload) mockFileReaderInstance.onload({} as any);
    
    // Wait for edit state and click confirm
    await waitFor(() => {
      expect(screen.getByText(/We detected these food items/i)).toBeInTheDocument();
    });
    const confirmButton = screen.getByRole('button', { name: /Confirm Items/i });
    await user.click(confirmButton);
    
    // Wait for results state
    await waitFor(() => {
      expect(screen.getByText(/Nutrition Analysis/i)).toBeInTheDocument();
    });
    
    // Click reset button
    const resetButton = screen.getByRole('button', { name: /Analyze Another Meal/i });
    await user.click(resetButton);
    
    // Check we're back to the initial upload state
    expect(screen.getByText(/Upload your meal photo/i)).toBeInTheDocument();
    
    // Restore FileReader
    global.FileReader = originalFileReader;
  });
});
