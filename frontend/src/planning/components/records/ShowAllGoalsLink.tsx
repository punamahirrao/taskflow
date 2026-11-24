import { Link } from "react-router-dom";
export function ShowAllGoalsLink() {
  return (
    <Link to="/goals" className="ml-3 text-sm underline">
      Show all goals
    </Link>
  );
}
