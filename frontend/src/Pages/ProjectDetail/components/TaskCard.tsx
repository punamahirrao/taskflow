export type Task = {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  project: number;
};

// export const statusLabels: Record<Task["status"], string> = {
//   todo: "To Do",
//   in_progress: "In Progress",
//   done: "Done",
// };

// const statusStyles: Record<Task["status"], string> = {
//   todo: "bg-gray-100 text-gray-700",
//   in_progress: "bg-yellow-100 text-yellow-700",
//   done: "bg-green-100 text-green-700",
// };

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="border border-gray-200 bg-white rounded-xl p-4 hover:shadow-sm transition">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        {/* <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[task.status]}`}
        >
          {statusLabels[task.status]}
        </span> */}
      </div>

      <p className="text-gray-600 mt-2">{task.description}</p>
    </div>
  );
}

export default TaskCard;
