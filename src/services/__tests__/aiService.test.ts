
import { analyzeImage, getNutritionInfo } from '../aiService';
import { FoodItem } from '@/components/FoodItemEditor';

describe('AI Service', () => {
  // Create a mock file for testing
  const createMockFile = (name: string = 'meal.jpg') => {
    return new File(['mock content'], name, { type: 'image/jpeg' });
  };
  
  describe('analyzeImage', () => {
    test('returns food items for a valid image', async () => {
      const file = createMockFile();
      const result = await analyzeImage(file);
      
      // The mock service should return some food items
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.length).toBeLessThanOrEqual(4);
      
      // Each item should have an id and name
      result.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
      });
    });
    
    test('returns different results for different files', async () => {
      const file1 = createMockFile('meal1.jpg');
      const file2 = createMockFile('meal2.jpg');
      
      const result1 = await analyzeImage(file1);
      const result2 = await analyzeImage(file2);
      
      // The mock service should return different items for different file names
      // This is based on our implementation which uses filename for randomization
      expect(JSON.stringify(result1)).not.toBe(JSON.stringify(result2));
    });
    
    test('handles timeouts properly', async () => {
      jest.useFakeTimers();
      
      const file = createMockFile();
      const promise = analyzeImage(file);
      
      // Fast-forward time to simulate network delay
      jest.advanceTimersByTime(1500);
      
      const result = await promise;
      expect(Array.isArray(result)).toBe(true);
      
      jest.useRealTimers();
    });
  });
  
  describe('getNutritionInfo', () => {
    test('returns nutrition info for valid food items', async () => {
      const foodItems: FoodItem[] = [
        { id: '1', name: 'Apple' },
        { id: '2', name: 'Chicken Breast' }
      ];
      
      const result = await getNutritionInfo(foodItems);
      
      // Should return nutrition info for each item
      expect(result.length).toBe(2);
      
      // Check structure of the returned data
      result.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('nutrition');
        expect(item.nutrition).toHaveProperty('calories');
        expect(item.nutrition).toHaveProperty('protein');
        expect(item.nutrition).toHaveProperty('carbs');
        expect(item.nutrition).toHaveProperty('fat');
      });
      
      // Check that we get expected values for known foods
      const apple = result.find(item => item.name === 'Apple');
      if (apple) {
        expect(apple.nutrition.calories).toBe(52);
      }
      
      const chicken = result.find(item => item.name === 'Chicken Breast');
      if (chicken) {
        expect(chicken.nutrition.calories).toBe(165);
      }
    });
    
    test('generates reasonable nutrition for unknown food items', async () => {
      const foodItems: FoodItem[] = [
        { id: '1', name: 'Unknown Food' }
      ];
      
      const result = await getNutritionInfo(foodItems);
      
      // Should still return nutrition info
      expect(result.length).toBe(1);
      
      // Check ranges of generated values
      const item = result[0];
      expect(item.nutrition.calories).toBeGreaterThanOrEqual(50);
      expect(item.nutrition.calories).toBeLessThanOrEqual(350);
      expect(item.nutrition.protein).toBeGreaterThanOrEqual(1);
      expect(item.nutrition.protein).toBeLessThanOrEqual(16);
      expect(item.nutrition.carbs).toBeGreaterThanOrEqual(5);
      expect(item.nutrition.carbs).toBeLessThanOrEqual(35);
      expect(item.nutrition.fat).toBeGreaterThanOrEqual(1);
      expect(item.nutrition.fat).toBeLessThanOrEqual(11);
    });
    
    test('handles timeouts properly', async () => {
      jest.useFakeTimers();
      
      const foodItems: FoodItem[] = [
        { id: '1', name: 'Apple' }
      ];
      
      const promise = getNutritionInfo(foodItems);
      
      // Fast-forward time to simulate network delay
      jest.advanceTimersByTime(1000);
      
      const result = await promise;
      expect(Array.isArray(result)).toBe(true);
      
      jest.useRealTimers();
    });
  });
});
