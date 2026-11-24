import { workTimeCategories } from "../../entities/workTime";
export function WorkTimeDetailsFields() {
  return (
    <>
      <label>
        Category
        <select name="category">
          {workTimeCategories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label>
        Note
        <input name="note" maxLength={160} placeholder="What did you work on?" />
      </label>
    </>
  );
}
