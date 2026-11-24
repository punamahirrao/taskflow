import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  GripVertical,
  Plus,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import Avatar from "../../../common/components/Avatar";
import type { Task } from "../../../features/tasks/entities/task";
import {
  dayNumber,
  isoDate,
  shortDate,
  todayDate,
  type RoadmapPlan,
} from "../../utils/roadmapModel";
import {
  changeSchedule,
  contrastText,
  createPannableTimeAxis,
  createTimeAxis,
  featureColor,
  ROADMAP_HEALTH,
  roadmapHealth,
  scheduleValues,
  TIMELINE_SCALES,
  type TimelineGesture,
  type TimelineScale,
} from "../../utils/timelineModel";

const ROW_HEIGHT = 50,
  YEAR_HEIGHT = 25,
  HEADER_HEIGHT = 38,
  MILESTONE_HEIGHT = 50;
interface Props {
  plan: RoadmapPlan;
  selectedId: number | null;
  onSelect: (id: number) => void;
  showCritical: boolean;
  canWrite: boolean;
  onSchedule: (
    task: Task,
    values: { planned_start_date: string; due_date: string },
  ) => Promise<void>;
  onAdd: (startDate?: string) => void;
  onEdit: (task: Task) => void;
  onExport: () => void;
  query: string;
  onQuery: (value: string) => void;
  allWork: boolean;
  onAllWork: (value: boolean) => void;
  onCritical: (value: boolean) => void;
}
interface DragState {
  task: Task;
  kind: TimelineGesture;
  originalStart: number;
  originalEnd: number;
  start: number;
  end: number;
  originX: number;
  originScroll: number;
  saving: boolean;
}
interface PanState {
  originX: number;
  originY: number;
  offset: number;
  moved: boolean;
}

export default function RoadmapTimeline({
  plan,
  selectedId,
  onSelect,
  showCritical,
  canWrite,
  onSchedule,
  onAdd,
  onEdit,
  onExport,
  query,
  onQuery,
  allWork,
  onAllWork,
  onCritical,
}: Props) {
  const [scale, setScale] = useState<TimelineScale>(() => {
    const saved = localStorage.getItem("taskflow:roadmap-scale");
    return TIMELINE_SCALES.includes(saved as TimelineScale) ? (saved as TimelineScale) : "monthly";
  });
  const [anchor, setAnchor] = useState(() => dayNumber(plan.startDate) ?? dayNumber(todayDate())!);
  const [offset, setOffset] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const activeDrag = useRef<DragState | null>(null);
  const activePan = useRef<PanState | null>(null);
  const [panning, setPanning] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [availableWidth, setAvailableWidth] = useState<number>();
  const [groupBy, setGroupBy] = useState("none");
  const [colorBy, setColorBy] = useState("feature");
  const [healthFilter, setHealthFilter] = useState("all");
  const [showDependencies, setShowDependencies] = useState(false);
  const today = todayDate();
  const calendarAnchor =
    scale === "monthly" || scale === "quarterly"
      ? dayNumber(`${new Date(anchor * 86400000).getUTCFullYear()}-01-01`)!
      : anchor;
  const axis = useMemo(
    () => createPannableTimeAxis(scale, calendarAnchor, offset, availableWidth),
    [scale, calendarAnchor, offset, availableWidth],
  );
  useEffect(() => {
    if (!viewport.current) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);
  const displayNodes = plan.nodes.filter(
    (node) => healthFilter === "all" || roadmapHealth(node.task, today) === healthFilter,
  );
  let bodyHeight = 0;
  const groups: { title: string; y: number }[] = [];
  const rows: { node: RoadmapPlan["nodes"][number]; y: number }[] = [];
  const groupKeys = groupBy === "status" ? Object.keys(ROADMAP_HEALTH) : ["all"];
  for (const key of groupKeys) {
    const nodes =
      groupBy === "status"
        ? displayNodes.filter((node) => roadmapHealth(node.task, today) === key)
        : displayNodes;
    if (!nodes.length) continue;
    if (groupBy === "status") {
      groups.push({
        title: `${ROADMAP_HEALTH[key as keyof typeof ROADMAP_HEALTH].label} · ${nodes.length}`,
        y: bodyHeight,
      });
      bodyHeight += 26;
    }
    for (const node of nodes) {
      rows.push({ node, y: bodyHeight });
      bodyHeight += ROW_HEIGHT;
    }
    if (groupBy === "status") bodyHeight += 10;
  }
  bodyHeight = Math.max(250, bodyHeight);
  const rowMap = new Map(rows.map((row) => [row.node.task.id, row]));
  const todayDay = dayNumber(today)!;
  const todayVisible = todayDay >= axis.first && todayDay < axis.last;
  const targets = plan.nodes
    .filter((node) => node.task.tags.includes("milestone") || /release/i.test(node.task.title))
    .map((node) => ({ name: node.task.title, date: node.task.due_date }));
  if (!targets.length && plan.endDate)
    targets.push({ name: "Delivery target", date: plan.endDate });
  const saving = Boolean(drag?.saving);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || activeDrag.current || activePan.current || saving)
        return;
      if (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      const delta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
      if (!delta) return;
      event.preventDefault();
      const multiplier =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
      setOffset((current) => current + (delta * multiplier) / axis.cellWidth);
      setHasNavigated(true);
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [axis.cellWidth, saving]);
  function centerOnDay(next: TimelineScale, day: number) {
    const canonical =
      next === "monthly" || next === "quarterly"
        ? dayNumber(`${new Date(day * 86400000).getUTCFullYear()}-01-01`)!
        : day;
    const base = createTimeAxis(next, canonical, 0, availableWidth);
    const width = viewport.current?.clientWidth ?? base.width;
    setAnchor(day);
    setOffset((base.position(day + 0.5) - width / 2) / base.cellWidth);
    if (viewport.current) viewport.current.scrollLeft = 0;
  }
  function selectScale(next: TimelineScale) {
    if (hasNavigated)
      centerOnDay(
        next,
        axis.dayAt(
          (viewport.current?.scrollLeft ?? 0) + (viewport.current?.clientWidth ?? axis.width) / 2,
        ),
      );
    else setOffset(0);
    setScale(next);
    localStorage.setItem("taskflow:roadmap-scale", next);
  }
  function goToToday() {
    centerOnDay(scale, todayDay);
    setHasNavigated(false);
  }
  function navigate(periods: number) {
    setOffset((current) => current + periods);
    setHasNavigated(true);
  }
  function addInView() {
    const day = hasNavigated
      ? axis.dayAt(
          (viewport.current?.scrollLeft ?? 0) + (viewport.current?.clientWidth ?? axis.width) / 2,
        )
      : todayDay;
    onAdd(isoDate(day));
  }
  function startPan(event: PointerEvent<HTMLDivElement>) {
    if (
      event.button !== 0 ||
      activeDrag.current ||
      saving ||
      (event.target instanceof Element &&
        event.target.closest("[data-feature-id], button, input, select, summary, a"))
    )
      return;
    activePan.current = { originX: event.clientX, originY: event.clientY, offset, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (event.pointerType !== "touch") event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    setPanning(true);
  }
  function pan(event: PointerEvent<HTMLDivElement>) {
    const current = activePan.current;
    if (!current) return;
    const x = event.clientX - current.originX,
      y = event.clientY - current.originY;
    if (
      !current.moved &&
      event.pointerType === "touch" &&
      Math.abs(y) > Math.abs(x) &&
      Math.abs(y) > 6
    ) {
      stopPan(event);
      return;
    }
    if (!current.moved && Math.abs(x) < 3) return;
    current.moved = true;
    event.preventDefault();
    setOffset(current.offset - x / axis.cellWidth);
    setHasNavigated(true);
  }
  function stopPan(event: PointerEvent<HTMLDivElement>) {
    if (!activePan.current) return;
    activePan.current = null;
    setPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function calendarKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || saving) return;
    if (event.key === "Home") {
      event.preventDefault();
      goToToday();
    }
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      navigate((event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? axis.count : 1));
    }
  }
  function addAtDate(event: MouseEvent<HTMLDivElement>) {
    if (
      !canWrite ||
      saving ||
      (event.target instanceof Element &&
        event.target.closest(
          "[data-feature-id], button, input, select, .roadmap-calendar-year, .product-roadmap-periods, .roadmap-calendar-milestones",
        ))
    )
      return;
    const body = event.currentTarget
      .querySelector(".roadmap-calendar-body")
      ?.getBoundingClientRect();
    if (!body || event.clientY < body.top || event.clientY > body.bottom) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    onAdd(isoDate(axis.dayAt(event.clientX - bounds.left + event.currentTarget.scrollLeft)));
  }
  function dates(task: Task) {
    return drag?.task.id === task.id
      ? { start: drag.start, end: drag.end }
      : { start: dayNumber(task.planned_start_date), end: dayNumber(task.due_date) };
  }
  function begin(event: PointerEvent<HTMLElement>, task: Task, kind: TimelineGesture) {
    if (!canWrite || saving || activeDrag.current || event.button !== 0) return;
    const start = dayNumber(task.planned_start_date),
      end = dayNumber(task.due_date);
    if (start === null || end === null) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    const state = {
      task,
      kind,
      originalStart: start,
      originalEnd: end,
      start,
      end,
      originX: event.clientX,
      originScroll: viewport.current?.scrollLeft ?? 0,
      saving: false,
    };
    activeDrag.current = state;
    setDrag(state);
    setError("");
    onSelect(task.id);
  }
  function move(event: PointerEvent<HTMLElement>) {
    const current = activeDrag.current;
    if (!current) return;
    const delta =
      event.clientX - current.originX + (viewport.current?.scrollLeft ?? 0) - current.originScroll;
    const original = current.kind === "end" ? current.originalEnd + 1 : current.originalStart;
    const days = axis.dayAt(axis.position(original) + delta) - original;
    const changed = changeSchedule(current.originalStart, current.originalEnd, current.kind, days);
    activeDrag.current = { ...current, ...changed };
    setDrag(activeDrag.current);
  }
  async function commit(state: DragState) {
    if (state.start === state.originalStart && state.end === state.originalEnd) {
      setDrag(null);
      return;
    }
    setDrag({ ...state, saving: true });
    try {
      await onSchedule(state.task, scheduleValues(state.start, state.end));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The schedule could not be saved. Previous dates were restored.",
      );
    } finally {
      setDrag(null);
    }
  }
  function finish(event: PointerEvent<HTMLElement>) {
    const current = activeDrag.current;
    activeDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (current) void commit(current);
  }
  function cancel() {
    if (activeDrag.current) {
      activeDrag.current = null;
      setDrag(null);
    }
  }
  function keyboard(event: KeyboardEvent<HTMLElement>, task: Task, kind: TimelineGesture) {
    if (event.key === "Escape") {
      cancel();
      return;
    }
    if (kind === "move" && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      onSelect(task.id);
      return;
    }
    if (!canWrite || saving || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const start = dayNumber(task.planned_start_date),
      end = dayNumber(task.due_date);
    if (start === null || end === null) return;
    event.preventDefault();
    event.stopPropagation();
    setError("");
    onSelect(task.id);
    const changed = changeSchedule(
      start,
      end,
      kind,
      (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 7 : 1),
    );
    void commit({
      task,
      kind,
      originalStart: start,
      originalEnd: end,
      ...changed,
      originX: 0,
      originScroll: 0,
      saving: false,
    });
  }
  const pointerHandlers = {
    onPointerMove: move,
    onPointerUp: finish,
    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
  };
  const scaleNames = { weekly: "Week", monthly: "Month", quarterly: "Quarter", yearly: "Year" };
  const firstYear = new Date(axis.first * 86400000).getUTCFullYear(),
    lastYear = new Date((axis.last - 0.000001) * 86400000).getUTCFullYear();
  return (
    <section className="roadmap-timeline product-roadmap" aria-label="Interactive feature timeline">
      <header className="product-roadmap-heading">
        <div>
          <h2>Product roadmap</h2>
          <p>Plan features and releases. Drag and drop to adjust timelines.</p>
        </div>
        <div className="product-roadmap-time-controls">
          <div className="roadmap-scale-segments" role="group" aria-label="Timeline time scale">
            {TIMELINE_SCALES.map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${scaleNames[value]} scale`}
                aria-pressed={scale === value}
                disabled={Boolean(drag) || panning}
                onClick={() => selectScale(value)}
              >
                {scaleNames[value]}
              </button>
            ))}
          </div>
          <span className="roadmap-control-divider" />
          <button
            type="button"
            className="roadmap-button"
            disabled={Boolean(drag) || panning}
            onClick={goToToday}
          >
            Today
          </button>
          <button
            type="button"
            className="roadmap-button icon-only"
            aria-label="Previous time period"
            disabled={Boolean(drag) || panning}
            onClick={() => navigate(-axis.count)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="roadmap-button icon-only"
            aria-label="Next time period"
            disabled={Boolean(drag) || panning}
            onClick={() => navigate(axis.count)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>
      <div className="product-roadmap-toolbar">
        <button
          type="button"
          className="roadmap-button primary"
          disabled={!canWrite || saving}
          onClick={addInView}
        >
          <Plus size={14} />
          Add feature
        </button>
        <details className="roadmap-calendar-filter">
          <summary>
            <Filter size={14} />
            Filter
            <ChevronDown size={12} />
          </summary>
          <div>
            <label>
              Find a feature
              <input
                type="search"
                aria-label="Search roadmap features"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                placeholder="Name, ID or delivery week…"
              />
            </label>
            <label>
              Status
              <select
                aria-label="Filter roadmap status"
                value={healthFilter}
                onChange={(event) => setHealthFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                {Object.entries(ROADMAP_HEALTH).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="roadmap-calendar-check">
              <input
                type="checkbox"
                checked={showDependencies}
                onChange={(event) => setShowDependencies(event.target.checked)}
              />
              Show dependency lines
            </label>
            <label className="roadmap-calendar-check">
              <input
                type="checkbox"
                checked={showCritical}
                onChange={(event) => onCritical(event.target.checked)}
              />
              Highlight critical dependencies
            </label>
            <label className="roadmap-calendar-check">
              <input
                type="checkbox"
                checked={allWork}
                onChange={(event) => onAllWork(event.target.checked)}
              />
              Include other work items
            </label>
            <button
              type="button"
              className="roadmap-button"
              onClick={() => {
                onQuery("");
                setHealthFilter("all");
              }}
            >
              Clear filters
            </button>
          </div>
        </details>
        <label className="roadmap-calendar-select">
          Group by:
          <select
            aria-label="Group roadmap features"
            value={groupBy}
            disabled={Boolean(drag) || panning}
            onChange={(event) => setGroupBy(event.target.value)}
          >
            <option value="none">None</option>
            <option value="status">Status</option>
          </select>
        </label>
        <label className="roadmap-calendar-select">
          Color by:
          <select
            aria-label="Color roadmap features"
            value={colorBy}
            onChange={(event) => setColorBy(event.target.value)}
          >
            <option value="feature">Feature color</option>
            <option value="status">Status</option>
          </select>
        </label>
        <button type="button" className="roadmap-button roadmap-calendar-export" onClick={onExport}>
          <Download size={13} />
          Export
        </button>
      </div>
      {error && (
        <p role="alert" className="roadmap-error">
          {error}
        </p>
      )}
      <div
        ref={viewport}
        className={`roadmap-timeline-scroll product-roadmap-scroll ${panning ? "is-panning" : ""}`}
        role="region"
        aria-label="Roadmap calendar"
        aria-describedby="timeline-instructions"
        tabIndex={0}
        onPointerDown={startPan}
        onPointerMove={pan}
        onPointerUp={stopPan}
        onPointerCancel={stopPan}
        onLostPointerCapture={stopPan}
        onKeyDown={calendarKeyboard}
        onDoubleClick={addAtDate}
        onScroll={(event) => {
          if (event.currentTarget.scrollLeft > 0) setHasNavigated(true);
        }}
      >
        <div className="roadmap-timeline-inner" style={{ width: axis.width }}>
          <div className="roadmap-calendar-year" style={{ height: YEAR_HEIGHT }}>
            {firstYear === lastYear ? firstYear : `${firstYear} – ${lastYear}`}
          </div>
          <div
            className="roadmap-week-header product-roadmap-periods"
            style={{ height: HEADER_HEIGHT }}
          >
            {axis.periods.map((period) => (
              <span
                key={period.start}
                style={{
                  width: axis.cellWidth,
                  left: period.left,
                  position: "absolute",
                  height: "100%",
                }}
              >
                <b>{period.label}</b>
                {scale !== "monthly" && <small>{period.subtitle}</small>}
              </span>
            ))}
          </div>
          <div
            className="roadmap-calendar-milestones"
            style={{
              height: MILESTONE_HEIGHT,
              backgroundSize: `${axis.cellWidth}px 100%`,
              backgroundPositionX: axis.gridOffset,
            }}
          >
            {targets.map((target) => {
              const day = dayNumber(target.date);
              if (day === null || day < axis.first || day >= axis.last) return null;
              const x = axis.position(day + 0.5);
              return (
                <span
                  key={`${target.name}-${target.date}`}
                  role="img"
                  aria-label={`${target.name}, ${shortDate(target.date)}`}
                  title={`${target.name} · ${shortDate(target.date)}`}
                  className={`roadmap-calendar-target ${x > axis.width - 180 ? "reverse" : ""}`}
                  style={{ left: x }}
                >
                  <i />
                  <span>
                    <b>{target.name}</b>
                    <small>{shortDate(target.date)}</small>
                  </span>
                </span>
              );
            })}
          </div>
          {todayVisible && (
            <div
              className="roadmap-today-overlay"
              aria-label={`Today, ${shortDate(today)}`}
              style={{
                left: axis.position(todayDay + 0.5),
                top: YEAR_HEIGHT + HEADER_HEIGHT,
                height: MILESTONE_HEIGHT + bodyHeight,
              }}
            >
              <b>Today</b>
              <span />
            </div>
          )}
          <div
            className="roadmap-calendar-body"
            style={{
              height: bodyHeight,
              backgroundSize: `${axis.cellWidth}px 100%`,
              backgroundPositionX: axis.gridOffset,
            }}
          >
            {groups.map((group) => (
              <div key={group.title} className="roadmap-calendar-group" style={{ top: group.y }}>
                {group.title}
              </div>
            ))}
            {showDependencies && (
              <svg
                width={axis.width}
                height={bodyHeight}
                className="roadmap-timeline-edges product-roadmap-edges"
                aria-label="Timeline dependencies"
              >
                {plan.edges.map((edge) => {
                  const from = rowMap.get(edge.from),
                    to = rowMap.get(edge.to);
                  if (!from || !to) return null;
                  const end = dates(from.node.task).end,
                    start = dates(to.node.task).start;
                  if (
                    end === null ||
                    start === null ||
                    end < axis.first ||
                    end >= axis.last ||
                    start < axis.first ||
                    start >= axis.last
                  )
                    return null;
                  const x1 = axis.position(end + 1),
                    x2 = axis.position(start),
                    y1 = from.y + ROW_HEIGHT / 2,
                    y2 = to.y + ROW_HEIGHT / 2;
                  return (
                    <path
                      key={`${edge.from}-${edge.to}`}
                      className={`roadmap-edge ${end >= start ? "conflict" : showCritical && edge.critical ? "critical" : "normal"}`}
                      d={`M${x1},${y1} C${x1 + 16},${y1} ${x2 - 16},${y2} ${x2},${y2}`}
                    />
                  );
                })}
              </svg>
            )}
            {rows.map(({ node, y }) => {
              const { start, end } = dates(node.task),
                progress = node.task.story_progress ?? { total: 0, completed: 0, percent: 0 };
              const visible =
                start !== null && end !== null && start < axis.last && end + 1 > axis.first;
              const color =
                  colorBy === "status"
                    ? ROADMAP_HEALTH[roadmapHealth(node.task, today)].color
                    : featureColor(node.task),
                inMotion = drag?.task.id === node.task.id;
              const label = `${node.task.title}, ${progress.percent}% complete, ${shortDate(start === null ? null : isoDate(start))} to ${shortDate(end === null ? null : isoDate(end))}`;
              const left = visible ? axis.position(Math.max(start!, axis.first)) : 0;
              const barWidth = visible
                ? Math.max(12, axis.position(Math.min(end! + 1, axis.last)) - left - 2)
                : 0;
              const style = {
                left,
                width: barWidth,
                "--feature-color": color,
                "--feature-text":
                  progress.percent === 100 ? contrastText(color) : "var(--theme-text)",
              } as CSSProperties;
              return (
                <div
                  className="roadmap-timeline-row product-roadmap-row"
                  key={node.task.id}
                  style={{ top: y, height: ROW_HEIGHT, width: axis.width }}
                >
                  <div className="roadmap-week-cells" style={{ width: axis.width }}>
                    {visible ? (
                      <div
                        className={`roadmap-timeline-bar interactive ${barWidth < 152 ? "compact" : ""} ${showDependencies && showCritical && node.critical ? "critical" : ""} ${progress.percent === 100 ? "complete" : ""} ${selectedId === node.task.id ? "selected" : ""} ${inMotion ? "is-dragging" : ""}`}
                        data-feature-id={node.task.id}
                        data-progress={progress.percent}
                        style={style}
                        title={label}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={label}
                          aria-pressed={selectedId === node.task.id}
                          aria-describedby="timeline-instructions"
                          data-movable={canWrite}
                          className="roadmap-bar-body"
                          onClick={() => onSelect(node.task.id)}
                          onDoubleClick={() => {
                            if (canWrite) onEdit(node.task);
                          }}
                          onPointerDown={(event) => begin(event, node.task, "move")}
                          onKeyDown={(event) => keyboard(event, node.task, "move")}
                          {...pointerHandlers}
                        >
                          <span
                            className="roadmap-progress-fill"
                            aria-hidden="true"
                            style={{ width: `${progress.percent}%` }}
                          />
                          <span className="roadmap-bar-title">
                            {node.task.title} <em>({progress.percent}%)</em>
                          </span>
                          {barWidth >= 70 && node.task.assignee_name && (
                            <span className="roadmap-bar-assignees">
                              <Avatar
                                name={node.task.assignee_name}
                                photoUrl={node.task.assignee_photo_url}
                                size={20}
                              />
                            </span>
                          )}
                        </div>
                        <span
                          className={`roadmap-bar-compact-caption ${left > axis.width - 270 ? "reverse" : ""}`}
                          aria-hidden="true"
                        >
                          <span>{node.task.title}</span>
                          <b>({progress.percent}%)</b>
                        </span>
                        {canWrite && start! >= axis.first && (
                          <button
                            type="button"
                            className="roadmap-resize-handle start"
                            aria-label={`Resize start of ${node.task.title}`}
                            disabled={saving}
                            onPointerDown={(event) => begin(event, node.task, "start")}
                            onKeyDown={(event) => keyboard(event, node.task, "start")}
                            {...pointerHandlers}
                          >
                            <GripVertical size={11} />
                          </button>
                        )}
                        {canWrite && end! + 1 <= axis.last && (
                          <button
                            type="button"
                            className="roadmap-resize-handle end"
                            aria-label={`Resize end of ${node.task.title}`}
                            disabled={saving}
                            onPointerDown={(event) => begin(event, node.task, "end")}
                            onKeyDown={(event) => keyboard(event, node.task, "end")}
                            {...pointerHandlers}
                          >
                            <GripVertical size={11} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="roadmap-unscheduled">
                        {start === null || end === null ? (
                          <button
                            type="button"
                            disabled={!canWrite}
                            onClick={() => onEdit(node.task)}
                          >
                            {node.task.title} · Set dates
                          </button>
                        ) : (
                          `${node.task.title} · Outside this date range`
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {!rows.length && (
              <p className="roadmap-calendar-no-results">
                {query.trim()
                  ? "No features match your search."
                  : plan.nodes.length
                    ? "No features match this status filter."
                    : "Drag the calendar to choose a date, then add your first feature."}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="product-roadmap-legend">
        {colorBy === "status" ? (
          Object.entries(ROADMAP_HEALTH).map(([key, value]) => (
            <span key={key}>
              <i style={{ background: value.color }} />
              {value.label}
            </span>
          ))
        ) : (
          <>
            <span>
              <i style={{ background: "#8b5cf6" }} />
              Feature color
            </span>
            <span>
              <i className="progress" />
              Story completion
            </span>
          </>
        )}
        <span>
          <i className="diamond" />
          Delivery target
        </span>
        <span>
          <i className="today" />
          Today
        </span>
        <small>{rows.length} features</small>
      </div>
      <p id="timeline-instructions" className="roadmap-timeline-note">
        {canWrite
          ? "Drag empty space to browse past/future · Double-click a date to add a feature · Drag bars or edges to reschedule. "
          : "Drag empty space to browse past/future. This roadmap is read-only. "}
        Shift + scroll also pans. Arrow keys browse a focused calendar or adjust a focused bar; Home
        returns to today. Progress follows linked stories.
        {drag && (
          <b className="roadmap-drag-dates">
            {drag.saving
              ? "Saving…"
              : `${shortDate(isoDate(drag.start))} → ${shortDate(isoDate(drag.end))}`}
          </b>
        )}
      </p>
    </section>
  );
}
