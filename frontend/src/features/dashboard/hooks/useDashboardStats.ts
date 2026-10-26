import { useEffect, useState } from "react";
import { getProjects } from "../../../api/projects";
import { getProjectTasks } from "../../../api/tasks";
import type { Task } from "../../../entities/task";

export type DashboardStats = {
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const projects = await getProjects();
        const groups = await Promise.all(projects.map((project) => getProjectTasks(project.id)));
        const tasks: Task[] = groups.flat();
        const completedTasks = tasks.filter((task) => task.status === "done").length;
        if (active) setStats({
          totalProjects: projects.length,
          completedTasks,
          pendingTasks: tasks.length - completedTasks,
          completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
        });
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [attempt]);

  const retry = () => {
    setError("");
    setStats(null);
    setLoading(true);
    setAttempt((value) => value + 1);
  };

  return { stats, loading, error, retry };
}
