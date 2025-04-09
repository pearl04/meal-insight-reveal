
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import FoodItemEditor from '../FoodItemEditor';

describe('FoodItemEditor', () => {
  const mockDetectedItems = [
    { id: '1', name: 'Apple' },
    { id: '2', name: 'Chicken' }
  ];
  
  const mockOnConfirm = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders detected food items correctly', () => {
    render(
      <FoodItemEditor 
        detectedItems={mockDetectedItems} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    // Check that the component title is rendered
    expect(screen.getByText(/We detected these food items/i)).toBeInTheDocument();
    
    // Check that all detected items are rendered
    mockDetectedItems.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
    
    // Check that the confirm button is present
    expect(screen.getByRole('button', { name: /Confirm Items/i })).toBeInTheDocument();
  });
  
  test('allows adding new food items', async () => {
    const { user } = render(
      <FoodItemEditor 
        detectedItems={mockDetectedItems} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    // Type a new food item name
    const input = screen.getByPlaceholderText(/Add another item/i);
    await user.type(input, 'Banana');
    
    // Click the Add button
    const addButton = screen.getByRole('button', { name: /Add/i });
    await user.click(addButton);
    
    // Check that the new item is added to the list
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });
  
  test('allows adding new food items with Enter key', async () => {
    const { user } = render(
      <FoodItemEditor 
        detectedItems={mockDetectedItems} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    // Type a new food item name and press Enter
    const input = screen.getByPlaceholderText(/Add another item/i);
    await user.type(input, 'Banana{enter}');
    
    // Check that the new item is added to the list
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });
  
  test('does not add empty food items', async () => {
    const { user } = render(
      <FoodItemEditor 
        detectedItems={mockDetectedItems} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    // Try to add an empty item
    const addButton = screen.getByRole('button', { name: /Add/i });
    await user.click(addButton);
    
    // Check that only the original items are present
    const foodItems = screen.getAllByText(/Apple|Chicken/i);
    expect(foodItems).toHaveLength(2);
  });
  
  test('allows removing food items', async () => {
    const { user } = render(
      <FoodItemEditor 
        detectedItems={mockDetectedItems} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    // Find the first item's delete button and click it
    const deleteButtons = screen.getAllByRole('button', { name: '' }); // X buttons have no accessible name
    await user.click(deleteButtons[0]);
    
    // Check that the item was removed
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.getByText('Chicken')).toBeInTheDocument();
  });
  
  test('sends confirmed food items on confirm button click', async () => {
    const { user } = render(
      <FoodItemEditor 
        detectedItems={mockDetectedItems} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    // Click the confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm Items/i });
    await user.click(confirmButton);
    
    // Check that onConfirm was called with the list of items
    expect(mockOnConfirm).toHaveBeenCalledWith(mockDetectedItems);
  });
  
  test('sends correct list after adding and removing items', async () => {
    const { user } = render(
      <FoodItemEditor 
        detectedItems={mockDetectedItems} 
        onConfirm={mockOnConfirm} 
      />
    );
    
    // Remove the first item
    const deleteButtons = screen.getAllByRole('button', { name: '' }); // X buttons
    await user.click(deleteButtons[0]);
    
    // Add a new item
    const input = screen.getByPlaceholderText(/Add another item/i);
    await user.type(input, 'Banana{enter}');
    
    // Click the confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm Items/i });
    await user.click(confirmButton);
    
    // The remaining list should have "Chicken" and the newly added "Banana"
    // We can't check the exact content of the mock call because the IDs will be different,
    // but we can check that it has 2 items
    expect(mockOnConfirm).toHaveBeenCalled();
    const calledWith = mockOnConfirm.mock.calls[0][0];
    expect(calledWith.length).toBe(2);
    expect(calledWith.some(item => item.name === 'Chicken')).toBe(true);
    expect(calledWith.some(item => item.name === 'Banana')).toBe(true);
  });
});
