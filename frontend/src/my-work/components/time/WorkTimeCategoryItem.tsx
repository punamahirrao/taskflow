import { duration } from "../../utils/workTime";
export function WorkTimeCategoryItem({
  category,
  minutes,
  color,
}: {
  category: string;
  minutes: number;
  color: string;
}) {
  return (
    <li>
      <span style={{ backgroundColor: color }} />
      <span>{category}</span>
      <b>{duration(minutes)}</b>
    </li>
  );
}
