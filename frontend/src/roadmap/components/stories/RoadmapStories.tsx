import { BookOpen, CheckCircle2, Link2, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Task } from "../../../features/tasks/entities/task";
import { featureColor, storyProgress } from "../../utils/timelineModel";

interface Props {
  feature: Task;
  features: Task[];
  tasks: Task[];
  canWrite: boolean;
  onSelect: (id: number) => void;
  onCreate: (feature: Task, title: string) => Promise<void>;
  onToggle: (story: Task, complete: boolean) => Promise<void>;
  onLink: () => void;
}
export default function RoadmapStories({
  feature,
  features,
  tasks,
  canWrite,
  onSelect,
  onCreate,
  onToggle,
  onLink,
}: Props) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState<number | "new" | null>(null);
  const [error, setError] = useState("");
  const stories = tasks.filter((task) => task.work_type === "story" && task.parent === feature.id);
  const progress = storyProgress(stories);
  async function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy("new");
    setError("");
    try {
      await onCreate(feature, title.trim());
      setTitle("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add user story.");
    } finally {
      setBusy(null);
    }
  }
  async function toggle(story: Task, done: boolean) {
    setBusy(story.id);
    setError("");
    try {
      await onToggle(story, done);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update user story.");
    } finally {
      setBusy(null);
    }
  }
  return (
    <section className="roadmap-stories" aria-label="Linked user stories">
      <header>
        <div>
          <h3>
            <BookOpen size={16} />
            User stories
          </h3>
          <p>Completed stories update the feature’s progress automatically.</p>
        </div>
        <label>
          Feature
          <select
            aria-label="User stories feature"
            value={feature.id}
            onChange={(event) => onSelect(Number(event.target.value))}
          >
            {features.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </header>
      <div className="roadmap-story-progress">
        <span>
          {progress.completed} of {progress.total} stories complete
        </span>
        <b>{progress.percent}%</b>
        <div
          role="progressbar"
          aria-label={`${feature.title} story completion`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
        >
          <i style={{ width: `${progress.percent}%`, background: featureColor(feature) }} />
        </div>
      </div>
      {error && (
        <p role="alert" className="roadmap-error">
          {error}
        </p>
      )}
      <div className="roadmap-story-list">
        {stories.map((story) => (
          <label key={story.id} className={story.status === "done" ? "complete" : ""}>
            <input
              type="checkbox"
              aria-label={`Complete story: ${story.title}`}
              checked={story.status === "done"}
              disabled={!canWrite || busy !== null}
              onChange={(event) => void toggle(story, event.target.checked)}
            />
            <span>
              <b>{story.title}</b>
              <small>
                #{story.id} · {story.status === "done" ? "Complete" : "Open"}
              </small>
            </span>
            {story.status === "done" && <CheckCircle2 size={15} />}
            {busy === story.id && <small>Saving…</small>}
          </label>
        ))}
        {!stories.length && (
          <p className="roadmap-story-empty">
            No user stories linked yet. Add a new story or link an existing one.
          </p>
        )}
      </div>
      {canWrite && (
        <form onSubmit={(event) => void add(event)} className="roadmap-story-create">
          <input
            aria-label="New user story name"
            placeholder="As a user, I want to…"
            maxLength={255}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={busy !== null}
            required
          />
          <button
            type="submit"
            className="roadmap-button primary"
            disabled={busy !== null || !title.trim()}
          >
            <Plus size={14} />
            {busy === "new" ? "Adding…" : "Add story"}
          </button>
          <button
            type="button"
            className="roadmap-button"
            disabled={busy !== null}
            onClick={onLink}
          >
            <Link2 size={14} />
            Link existing
          </button>
        </form>
      )}
    </section>
  );
}
