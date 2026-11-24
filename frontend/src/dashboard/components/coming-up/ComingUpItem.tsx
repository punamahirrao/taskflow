import { Link } from "react-router-dom";
import type { DeliverySnapshot } from "../../entities/delivery";
import { shortDate } from "../../utils/deliveryFormat";

const planPaths = { release: "/releases", goal: "/goals", milestone: "/planning/milestones" };

export function ComingUpItem({ item }: { item: DeliverySnapshot["milestones"][number] }) {
  return (
    <li>
      <div>
        <Link className="delivery-link" to={planPaths[item.kind]}>
          {item.name}
        </Link>
        <small className="capitalize">{item.kind}</small>
      </div>
      <time dateTime={item.target_date} className="delivery-list-meta">
        {shortDate(item.target_date)}
      </time>
    </li>
  );
}
