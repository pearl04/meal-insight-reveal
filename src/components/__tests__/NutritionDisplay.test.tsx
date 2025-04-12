
import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import NutritionDisplay from '../NutritionDisplay';
import { FoodWithNutrition } from '@/types/nutrition';

describe('NutritionDisplay', () => {
  const mockFoodItems: FoodWithNutrition[] = [
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
      name: 'Chicken Breast',
      nutrition: {
        calories: '165',
        protein: '31',
        carbs: '0',
        fat: '3.6'
      }
    }
  ];
  
  const mockOnReset = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders nutrition analysis title correctly', () => {
    render(
      <NutritionDisplay 
        foodItems={mockFoodItems}
        onReset={mockOnReset} 
      />
    );
    
    expect(screen.getByText(/Nutrition Analysis/i)).toBeInTheDocument();
  });
  
  test('displays correct average nutrition values', () => {
    render(
      <NutritionDisplay 
        foodItems={mockFoodItems}
        onReset={mockOnReset} 
      />
    );
    
    // Calculate expected averages - these should match what the component calculates
    const avgCalories = Math.round((52 + 165) / 2); // 109 (rounded average of calories)
    const avgProtein = Math.round(((0.3 + 31) / 2) * 10) / 10; // 15.7 (rounded to 1 decimal place)
    const avgCarbs = Math.round(((14 + 0) / 2) * 10) / 10; // 7.0 (rounded to 1 decimal place)
    const avgFat = Math.round(((0.2 + 3.6) / 2) * 10) / 10; // 1.9 (rounded to 1 decimal place)
    
    // Check if the averages are correctly displayed
    expect(screen.getByText(avgCalories.toString())).toBeInTheDocument();
    expect(screen.getByText(avgProtein.toString())).toBeInTheDocument();
    expect(screen.getByText(avgCarbs.toString())).toBeInTheDocument();
    expect(screen.getByText(avgFat.toString())).toBeInTheDocument();
  });
  
  test('displays list of food items with their calorie content', () => {
    render(
      <NutritionDisplay 
        foodItems={mockFoodItems}
        onReset={mockOnReset} 
      />
    );
    
    // Check if all food items are displayed
    mockFoodItems.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(`${item.nutrition.calories} kcal`)).toBeInTheDocument();
    });
  });
  
  test('calls onReset when Analyze Another Meal button is clicked', async () => {
    const { user } = render(
      <NutritionDisplay 
        foodItems={mockFoodItems}
        onReset={mockOnReset} 
      />
    );
    
    // Find and click the reset button
    const resetButton = screen.getByRole('button', { name: /Analyze Another Meal/i });
    await user.click(resetButton);
    
    // Check if onReset was called
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });
  
  test('handles empty food items array', () => {
    render(
      <NutritionDisplay 
        foodItems={[]}
        onReset={mockOnReset} 
      />
    );
    
    // Check that the component doesn't crash with empty data
    // All nutrition values should be 0
    expect(screen.getByText('0')).toBeInTheDocument(); // Calories
    
    // Should still render the reset button
    expect(screen.getByRole('button', { name: /Analyze Another Meal/i })).toBeInTheDocument();
  });
  
  test('handles single food item correctly', () => {
    const singleItem = [mockFoodItems[0]];
    
    render(
      <NutritionDisplay 
        foodItems={singleItem}
        onReset={mockOnReset} 
      />
    );
    
    // With a single item, the average should equal the item's values
    expect(screen.getByText('52')).toBeInTheDocument(); // Calories
    expect(screen.getByText('0.3')).toBeInTheDocument(); // Protein
    expect(screen.getByText('14')).toBeInTheDocument(); // Carbs
    expect(screen.getByText('0.2')).toBeInTheDocument(); // Fat
  });
});
