import { useEffect, useRef, useState, type FormEvent } from "react";
import { BookOpen, CalendarDays, GitBranch, Palette, X } from "lucide-react";
import type { Task } from "../../features/tasks/entities/task";
import { createsCycle, dayNumber, isoDate, todayDate, weekLabel } from "../utils/roadmapModel";
import { DEFAULT_FEATURE_COLOR, FEATURE_COLORS, storyProgress } from "../utils/timelineModel";

export interface RoadmapFeatureValues {
  title: string;
  description: string;
  planned_start_date: string;
  due_date: string;
  blocked_by: number[];
  roadmap_color: string;
  story_ids: number[];
}
interface Props {
  feature: Task | null;
  tasks: Task[];
  initialStartDate?: string;
  onClose: () => void;
  onSave: (values: RoadmapFeatureValues) => Promise<void>;
}

export default function RoadmapFeatureDialog({
  feature,
  tasks,
  initialStartDate,
  onClose,
  onSave,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const start =
    feature?.planned_start_date ?? (!feature ? initialStartDate : undefined) ?? todayDate();
  const [values, setValues] = useState<RoadmapFeatureValues>({
    title: feature?.title ?? "",
    description: feature?.description ?? "",
    planned_start_date: start,
    due_date: feature?.due_date ?? isoDate(dayNumber(start)! + 4),
    blocked_by: feature?.blocked_by ?? [],
    roadmap_color: feature?.roadmap_color ?? DEFAULT_FEATURE_COLOR,
    story_ids: tasks
      .filter((task) => task.work_type === "story" && task.parent === feature?.id)
      .map((task) => task.id),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [storyQuery, setStoryQuery] = useState("");
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const options = tasks.filter(
    (task) => task.id !== feature?.id && task.title.toLowerCase().includes(query.toLowerCase()),
  );
  const stories = tasks.filter(
    (task) =>
      task.work_type === "story" && task.title.toLowerCase().includes(storyQuery.toLowerCase()),
  );
  const progress = storyProgress(tasks.filter((task) => values.story_ids.includes(task.id)));
  const field = (key: keyof RoadmapFeatureValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!values.title.trim()) {
      setError("Enter a feature name.");
      return;
    }
    if (
      dayNumber(values.planned_start_date) === null ||
      dayNumber(values.due_date) === null ||
      values.due_date < values.planned_start_date
    ) {
      setError("Choose a start date and a delivery date on or after it.");
      return;
    }
    if (feature && createsCycle(tasks, feature.id, values.blocked_by)) {
      setError("These dependencies create a cycle. A feature cannot depend on its own successor.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save feature.");
      setSaving(false);
    }
  }
  return (
    <dialog
      ref={dialogRef}
      className="roadmap-dialog"
      aria-labelledby="feature-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <form onSubmit={(event) => void submit(event)}>
        <header>
          <div>
            <p className="roadmap-eyebrow">PLAN YOUR NEXT DELIVERY</p>
            <h2 id="feature-dialog-title">{feature ? "Edit feature" : "Add feature"}</h2>
          </div>
          <button
            type="button"
            aria-label="Close feature editor"
            disabled={saving}
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>
        <fieldset disabled={saving} className="roadmap-form-fields">
          <label>
            Feature name
            <input
              autoFocus
              required
              maxLength={255}
              value={values.title}
              onChange={(event) => field("title", event.target.value)}
              placeholder="e.g. Customer self-service portal"
            />
          </label>
          <label>
            Description
            <textarea
              rows={2}
              value={values.description}
              onChange={(event) => field("description", event.target.value)}
              placeholder="What will this feature deliver?"
            />
          </label>
          <div className="roadmap-color-heading">
            <Palette size={15} />
            <b>Feature color</b>
            <label>
              Custom
              <input
                aria-label="Feature color"
                type="color"
                value={values.roadmap_color}
                onChange={(event) => field("roadmap_color", event.target.value)}
              />
            </label>
          </div>
          <div className="roadmap-color-swatches">
            {FEATURE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Use color ${color}`}
                aria-pressed={values.roadmap_color.toLowerCase() === color}
                style={{ background: color }}
                onClick={() => field("roadmap_color", color)}
              />
            ))}
          </div>
          <div className="roadmap-form-dates">
            <label>
              Planned start
              <input
                type="date"
                required
                value={values.planned_start_date}
                onChange={(event) => field("planned_start_date", event.target.value)}
              />
            </label>
            <label>
              Expected delivery
              <input
                type="date"
                required
                min={values.planned_start_date}
                value={values.due_date}
                onChange={(event) => field("due_date", event.target.value)}
              />
            </label>
          </div>
          <p className="roadmap-form-week">
            <CalendarDays size={15} />
            Expected in {weekLabel(values.due_date)}
            <span>Calendar days · ISO weeks start Monday</span>
          </p>
          <div className="roadmap-dependency-label">
            <GitBranch size={16} />
            <b>Depends on</b>
            <span>{values.blocked_by.length} selected</span>
          </div>
          <input
            aria-label="Search dependency options"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search features and work items…"
          />
          <div className="roadmap-dependency-options">
            {options.map((task) => (
              <label key={task.id}>
                <input
                  type="checkbox"
                  checked={values.blocked_by.includes(task.id)}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      blocked_by: event.target.checked
                        ? [...current.blocked_by, task.id]
                        : current.blocked_by.filter((id) => id !== task.id),
                    }))
                  }
                />
                <span>
                  <b>{task.title}</b>
                  <small>
                    #{task.id} · {weekLabel(task.due_date)}
                  </small>
                </span>
              </label>
            ))}
            {!options.length && <p>No matching work items.</p>}
          </div>
          {values.blocked_by.some((id) => !tasks.some((task) => task.id === id)) && (
            <p className="roadmap-muted">Dependencies outside this project will be preserved.</p>
          )}
          {(!feature || ["epic", "initiative", "enhancement"].includes(feature.work_type)) && (
            <>
              <div className="roadmap-dependency-label">
                <BookOpen size={16} />
                <b>Linked user stories</b>
                <span>
                  {progress.completed}/{progress.total} complete · {progress.percent}%
                </span>
              </div>
              <p className="roadmap-muted">
                Story completion fills the feature bar automatically. A story can belong to one
                feature.
              </p>
              <input
                aria-label="Search user stories to link"
                type="search"
                value={storyQuery}
                onChange={(event) => setStoryQuery(event.target.value)}
                placeholder="Search user stories…"
              />
              <div className="roadmap-dependency-options roadmap-story-options">
                {stories.map((story) => {
                  const unavailable = story.parent !== null && story.parent !== feature?.id;
                  return (
                    <label key={story.id}>
                      <input
                        type="checkbox"
                        disabled={unavailable}
                        checked={values.story_ids.includes(story.id)}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            story_ids: event.target.checked
                              ? [...current.story_ids, story.id]
                              : current.story_ids.filter((id) => id !== story.id),
                          }))
                        }
                      />
                      <span>
                        <b>{story.title}</b>
                        <small>
                          #{story.id} · {story.status === "done" ? "Complete" : "Open"}
                          {unavailable
                            ? ` · Linked to ${tasks.find((task) => task.id === story.parent)?.title ?? `feature #${story.parent}`}`
                            : ""}
                        </small>
                      </span>
                    </label>
                  );
                })}
                {!stories.length && (
                  <p>
                    No matching user stories. Save the feature, then add stories from its User
                    stories tab.
                  </p>
                )}
              </div>
            </>
          )}
        </fieldset>
        {error && (
          <p className="roadmap-error" role="alert">
            {error}
          </p>
        )}
        <footer>
          <button type="button" className="roadmap-button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="roadmap-button primary" disabled={saving}>
            {saving ? "Saving…" : "Save feature"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
