export function WorkTaskTableHead() {
  return (
    <thead>
      <tr>
        <th scope="col">
          <span className="sr-only">Complete</span>
        </th>
        <th scope="col">Task</th>
        <th scope="col">Project</th>
        <th scope="col">Priority</th>
        <th scope="col">Due date</th>
        <th scope="col">Status</th>
      </tr>
    </thead>
  );
}
