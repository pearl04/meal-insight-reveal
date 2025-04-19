
import { Link } from "react-router-dom";
import UserProfile from "./UserProfile";

const Header = () => {
  return (
    <header className="bg-background border-b py-4">
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          MealCheck
        </Link>
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
