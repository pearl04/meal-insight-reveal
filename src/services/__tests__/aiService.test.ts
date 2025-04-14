import { analyzeText, getNutritionInfo } from "../food";
import { FoodItem } from "@/types/nutrition";

describe("AI Service (Text Only)", () => {
  describe("analyzeText", () => {
    test("should return valid food items from text", async () => {
      const result = await analyzeText("chicken salad and brown rice");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      result.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("name");
        expect(item.nutrition).toBeDefined();
      });
    });
  });

  describe("getNutritionInfo", () => {
    test("returns nutrition info for valid food items", async () => {
      const foodItems: FoodItem[] = [
        { id: "1", name: "Apple" },
        { id: "2", name: "Chicken Breast" },
      ];

      const result = await getNutritionInfo(foodItems);
      expect(result.length).toBe(2);

      result.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("nutrition");
        expect(item.nutrition).toHaveProperty("calories");
        expect(item.nutrition).toHaveProperty("protein");
        expect(item.nutrition).toHaveProperty("carbs");
        expect(item.nutrition).toHaveProperty("fat");
      });
    });

    test("handles unknown food gracefully", async () => {
      const foodItems: FoodItem[] = [{ id: "1", name: "Mystery Dish" }];
      const result = await getNutritionInfo(foodItems);

      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty("nutrition");
    });

    test("handles timeouts properly", async () => {
      jest.useFakeTimers();

      const foodItems: FoodItem[] = [{ id: "1", name: "Banana" }];
      const promise = getNutritionInfo(foodItems);

      jest.advanceTimersByTime(1000);
      const result = await promise;

      expect(Array.isArray(result)).toBe(true);

      jest.useRealTimers();
    });
  });
});
