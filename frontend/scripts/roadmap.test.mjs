import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildRoadmap,
  createsCycle,
  dayNumber,
  isoDate,
  weekLabel,
} from "../src/roadmap/utils/roadmapModel.ts";
import {
  changeSchedule,
  contrastText,
  createPannableTimeAxis,
  createTimeAxis,
  featureColor,
  storyProgress,
  withStoryProgress,
} from "../src/roadmap/utils/timelineModel.ts";

const feature = (id, start, end, blocked_by = []) => ({
  id,
  title: `Feature ${id}`,
  rank: id,
  blocked_by,
  planned_start_date: start,
  due_date: end,
  status: "backlog",
});
const diamond = () => [
  feature(1, "2026-11-02", "2026-11-03"),
  feature(2, "2026-11-04", "2026-11-06", [1]),
  feature(3, "2026-11-04", "2026-11-08", [1]),
  feature(4, "2026-11-09", "2026-11-09", [2, 3]),
];

test("CPM follows the longer branch and calculates slack for a parallel feature", () => {
  const plan = buildRoadmap(diamond());
  assert.equal(plan.criticalDays, 8);
  assert.deepEqual(
    plan.nodes.filter((node) => node.critical).map((node) => node.task.id),
    [1, 3, 4],
  );
  assert.equal(plan.nodes.find((node) => node.task.id === 2).slack, 2);
  assert.equal(plan.edges.filter((edge) => edge.critical).length, 2);
  assert.equal(plan.conflicts, 0);
});
test("network layout separates parallel features and respects dependency direction", () => {
  const plan = buildRoadmap(diamond().reverse());
  const nodes = new Map(plan.nodes.map((node) => [node.task.id, node]));
  assert.equal(nodes.get(2).x, nodes.get(3).x);
  assert.notEqual(nodes.get(2).y, nodes.get(3).y);
  for (const edge of plan.edges) assert(nodes.get(edge.from).x < nodes.get(edge.to).x);
});
test("ISO delivery weeks use the correct year at New Year boundaries", () => {
  assert.equal(weekLabel("2021-01-01"), "W53 · 2020");
  assert.equal(weekLabel("2021-01-04"), "W01 · 2021");
  assert.equal(weekLabel("2027-01-01"), "W53 · 2026");
  assert.equal(weekLabel(null), "Unscheduled");
});
test("calendar durations remain stable across daylight-saving changes", () => {
  assert.equal(buildRoadmap([feature(1, "2026-03-28", "2026-03-30")]).criticalDays, 3);
  assert.equal(isoDate(dayNumber("2026-10-25") + 1), "2026-10-26");
});
test("unscheduled work does not produce invented critical-path estimates", () => {
  const plan = buildRoadmap([feature(1, null, "2026-11-03")]);
  assert.equal(plan.criticalDays, null);
  assert.equal(plan.nodes[0].duration, null);
  assert.equal(plan.nodes[0].critical, false);
});
test("external predecessors are counted and prevent incomplete CPM results", () => {
  const plan = buildRoadmap([feature(2, "2026-11-04", "2026-11-06", [99])]);
  assert.equal(plan.externalCount, 1);
  assert.equal(plan.completeSchedule, false);
});
test("existing cycles are detected without hanging or highlighting a false critical path", () => {
  const plan = buildRoadmap([
    feature(1, "2026-11-02", "2026-11-03", [2]),
    feature(2, "2026-11-04", "2026-11-06", [1]),
  ]);
  assert.equal(plan.hasCycle, true);
  assert.equal(plan.criticalDays, null);
  assert.equal(plan.nodes.length, 2);
});
test("editing dependencies rejects transitive cycles but permits independent predecessors", () => {
  assert.equal(createsCycle(diamond(), 1, [4]), true);
  assert.equal(createsCycle(diamond(), 1, [1]), true);
  assert.equal(createsCycle(diamond(), 3, [2]), false);
});
test("overlapping planned dates are flagged without silently rescheduling features", () => {
  const tasks = [
    feature(1, "2026-11-02", "2026-11-05"),
    feature(2, "2026-11-05", "2026-11-08", [1]),
  ];
  assert.equal(buildRoadmap(tasks).conflicts, 1);
  assert.equal(tasks[1].planned_start_date, "2026-11-05");
});

test("weekly axis snaps to ISO Mondays and converts positions back to dates", () => {
  const axis = createTimeAxis("weekly", dayNumber("2026-11-20"));
  assert.equal(isoDate(axis.first), "2026-11-16");
  assert.equal(isoDate(axis.last), "2027-01-11");
  assert.equal(axis.dayAt(axis.position(dayNumber("2026-12-31"))), dayNumber("2026-12-31"));
});
test("monthly scale respects month lengths and February in leap years", () => {
  const axis = createTimeAxis("monthly", dayNumber("2028-02-15"));
  assert.equal(axis.periods[0].end - axis.periods[0].start, 29);
  assert.equal(axis.position(dayNumber("2028-03-01")), axis.cellWidth);
  for (const date of ["2028-01-31", "2028-02-29", "2028-12-31"])
    assert.equal(axis.dayAt(axis.position(dayNumber(date))), dayNumber(date));
});
test("yearly axis accounts for leap years and preserves calendar boundaries", () => {
  const axis = createTimeAxis("yearly", dayNumber("2028-07-01"));
  assert.equal(axis.periods[0].end - axis.periods[0].start, 366);
  assert.equal(axis.position(dayNumber("2029-01-01")), axis.cellWidth);
  assert.equal(isoDate(createTimeAxis("yearly", dayNumber("2028-07-01"), -5).first), "2023-01-01");
});

test("quarter scale crosses year boundaries and respects varying quarter lengths", () => {
  const axis = createTimeAxis("quarterly", dayNumber("2026-11-20"));
  assert.equal(axis.periods[0].label, "Q4");
  assert.equal(axis.periods[1].label, "Q1");
  assert.equal(isoDate(axis.first), "2026-10-01");
  assert.equal(axis.position(dayNumber("2027-01-01")), axis.cellWidth);
  assert.equal(axis.dayAt(axis.position(dayNumber("2027-03-31"))), dayNumber("2027-03-31"));
});
test("moving preserves inclusive duration while resize handles cannot cross", () => {
  const start = dayNumber("2026-11-23"),
    end = dayNumber("2026-11-27");
  assert.deepEqual(changeSchedule(start, end, "move", 7), { start: start + 7, end: end + 7 });
  assert.deepEqual(changeSchedule(start, end, "start", 99), { start: end, end });
  assert.deepEqual(changeSchedule(start, end, "end", -99), { start, end: start });
  assert.equal(changeSchedule(start, end, "end", 3).end - start + 1, 8);
});
test("progress is derived from completed stories, including ten, ninety and one hundred percent", () => {
  const stories = Array.from({ length: 10 }, () => ({ status: "backlog" }));
  assert.equal(storyProgress([]).percent, 0);
  for (let index = 0; index < stories.length; index++) {
    stories[index].status = "done";
    assert.equal(storyProgress(stories).percent, (index + 1) * 10);
  }
});
test("only linked user stories contribute to feature progress", () => {
  const tasks = [
    { id: 1, work_type: "epic", status: "done", parent: null },
    { id: 2, work_type: "story", status: "done", parent: 1 },
    { id: 3, work_type: "story", status: "backlog", parent: 1 },
    { id: 4, work_type: "task", status: "done", parent: 1 },
    { id: 5, work_type: "story", status: "done", parent: null },
  ];
  const feature = withStoryProgress(tasks)[0];
  assert.deepEqual(feature.story_progress, { total: 2, completed: 1, percent: 50 });
  assert.deepEqual(
    feature.linked_stories.map((story) => story.id),
    [2, 3],
  );
});
test("assigned colors are preserved and solid fills use readable text", () => {
  assert.equal(featureColor({ roadmap_color: "#db2777" }), "#db2777");
  assert.equal(featureColor({ roadmap_color: "invalid" }), "#7c3aed");
  assert.equal(contrastText("#ffffff"), "#142238");
  assert.equal(contrastText("#000000"), "#ffffff");
});

test("calendar pans continuously in both directions with no fixed year boundary", () => {
  const anchor = dayNumber("2026-01-01");
  const future = createPannableTimeAxis("monthly", anchor, 36.5);
  const past = createPannableTimeAxis("monthly", anchor, -36.5);
  assert.equal(isoDate(future.first), "2029-01-16");
  assert.equal(isoDate(past.first), "2022-12-16");
  assert.equal(future.periods.length, future.count + 1);
  assert.equal(future.periods[0].left, -future.cellWidth / 2);
  assert.equal(future.periods.at(-1).left + future.cellWidth > future.width, true);
});
test("fractional panning keeps dates, grid columns and pointer date conversion aligned", () => {
  for (const scale of ["weekly", "monthly", "quarterly", "yearly"]) {
    const axis = createPannableTimeAxis(scale, dayNumber("2028-02-01"), -1.35);
    assert(Math.abs(axis.position(axis.first)) < 0.00001);
    assert(Math.abs(axis.position(axis.last) - axis.width) < 0.00001);
    for (const date of ["2027-12-31", "2028-02-29", "2028-03-01"])
      assert.equal(axis.dayAt(axis.position(dayNumber(date))), dayNumber(date));
  }
});
test("panning never changes the stored dates or durations of a feature", () => {
  const task = feature(1, "2026-11-23", "2026-11-27");
  const before = structuredClone(task);
  for (const offset of [-120.75, -1.2, 0, 1.2, 120.75]) {
    const axis = createPannableTimeAxis("monthly", dayNumber(task.planned_start_date), offset);
    assert.equal(
      axis.dayAt(axis.position(dayNumber(task.planned_start_date))),
      dayNumber(task.planned_start_date),
    );
  }
  assert.deepEqual(task, before);
});
