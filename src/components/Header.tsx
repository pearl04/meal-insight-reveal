
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background border-b py-4">
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          MealSnap
        </Link>
        <Link to="/meal-history">
          <Button variant="outline" size="sm">
            <Utensils className="mr-2 h-4 w-4" />
            Meal History
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
