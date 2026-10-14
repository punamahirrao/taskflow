export type Task = {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  project: number;
};

function TaskCard({ task }: { task: Task }) {
  return (
    <div 
    draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab active:cursor-grabbing border border-gray-200 bg-white rounded-xl p-4 hover:shadow-sm transition">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
       
      </div>

      <p className="text-gray-600 mt-2">{task.description}</p>
    </div>
  );
}

export default TaskCard;
