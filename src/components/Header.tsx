
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background border-b py-4">
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          MealCheck
        </Link>
      </div>
    </header>
  );
};

export default Header;
