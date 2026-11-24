import { workTimeCategories } from "../../entities/workTime";
import { WorkTimeCategoryItem } from "./WorkTimeCategoryItem";
import { workTimeColors } from "./workTimeColors";
export function WorkTimeCategories({ totals }: { totals: number[] }) {
  return (
    <ul>
      {workTimeCategories.map((category, index) => (
        <WorkTimeCategoryItem
          key={category}
          category={category}
          minutes={totals[index]}
          color={workTimeColors[index]}
        />
      ))}
    </ul>
  );
}
