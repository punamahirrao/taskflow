import {
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  CalendarDays,
  ChartGantt,
  CheckCircle,
  Circle,
  ClipboardList,
  Clock,
  Columns3,
  Compass,
  Database,
  FileText,
  Flag,
  FolderKanban,
  GitBranch,
  Globe,
  Grid2X2,
  Heart,
  Home,
  Layers,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  Map,
  Milestone,
  Rocket,
  Search,
  Settings,
  Settings2,
  Shield,
  Sparkles,
  Star,
  Tag,
  Target,
  TrainFront,
  Trophy,
  User,
  Users,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import type { TranslationKey } from "../../entities/language";

export const NAVIGATION_ICONS = {
  "layout-dashboard": { name: "Dashboard", Icon: LayoutDashboard },
  "list-todo": { name: "Task list", Icon: ListTodo },
  "folder-kanban": { name: "Project folder", Icon: FolderKanban },
  layers: { name: "Layers", Icon: Layers },
  "train-front": { name: "Train", Icon: TrainFront },
  "columns-3": { name: "Board columns", Icon: Columns3 },
  flag: { name: "Flag", Icon: Flag },
  "file-text": { name: "Document", Icon: FileText },
  target: { name: "Target", Icon: Target },
  "chart-gantt": { name: "Gantt chart", Icon: ChartGantt },
  map: { name: "Map", Icon: Map },
  "bar-chart-3": { name: "Bar chart", Icon: BarChart3 },
  milestone: { name: "Milestone", Icon: Milestone },
  "git-branch": { name: "Branches", Icon: GitBranch },
  "calendar-days": { name: "Calendar", Icon: CalendarDays },
  sparkles: { name: "Sparkles", Icon: Sparkles },
  settings: { name: "Gear", Icon: Settings },
  "settings-2": { name: "Controls", Icon: Settings2 },
  home: { name: "Home", Icon: Home },
  briefcase: { name: "Briefcase", Icon: Briefcase },
  "building-2": { name: "Building", Icon: Building2 },
  users: { name: "Team", Icon: Users },
  user: { name: "Person", Icon: User },
  "clipboard-list": { name: "Clipboard", Icon: ClipboardList },
  "check-circle": { name: "Check circle", Icon: CheckCircle },
  circle: { name: "Circle", Icon: Circle },
  star: { name: "Star", Icon: Star },
  heart: { name: "Heart", Icon: Heart },
  bookmark: { name: "Bookmark", Icon: Bookmark },
  bell: { name: "Bell", Icon: Bell },
  clock: { name: "Clock", Icon: Clock },
  compass: { name: "Compass", Icon: Compass },
  globe: { name: "Globe", Icon: Globe },
  "grid-2x2": { name: "Grid", Icon: Grid2X2 },
  lightbulb: { name: "Lightbulb", Icon: Lightbulb },
  rocket: { name: "Rocket", Icon: Rocket },
  shield: { name: "Shield", Icon: Shield },
  tag: { name: "Tag", Icon: Tag },
  trophy: { name: "Trophy", Icon: Trophy },
  zap: { name: "Lightning", Icon: Zap },
  workflow: { name: "Workflow", Icon: Workflow },
  wrench: { name: "Wrench", Icon: Wrench },
  search: { name: "Search", Icon: Search },
  database: { name: "Database", Icon: Database },
} as const;

export type NavigationIconId = keyof typeof NAVIGATION_ICONS;
export const ICON_COLORS = {
  violet: { name: "Violet", value: "#7c3aed" },
  blue: { name: "Blue", value: "#2563eb" },
  teal: { name: "Teal", value: "#0f766e" },
  amber: { name: "Amber", value: "#b45309" },
  rose: { name: "Rose", value: "#be123c" },
  cyan: { name: "Cyan", value: "#0e7490" },
} as const;
export type IconColor = keyof typeof ICON_COLORS;
export function defaultIconColor(icon: NavigationIconId): IconColor {
  const colors = Object.keys(ICON_COLORS) as IconColor[];
  return colors[Object.keys(NAVIGATION_ICONS).indexOf(icon) % colors.length];
}
export interface NavigationItem {
  id: string;
  path: string;
  labelKey: TranslationKey;
  defaultIcon: NavigationIconId;
  section: "primary" | "planning-group" | "planning" | "utility";
}
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    labelKey: "app.dashboard",
    defaultIcon: "layout-dashboard",
    section: "primary",
  },
  {
    id: "my-work",
    path: "/my-work",
    labelKey: "app.myWork",
    defaultIcon: "list-todo",
    section: "primary",
  },
  {
    id: "projects",
    path: "/projects",
    labelKey: "app.projects",
    defaultIcon: "folder-kanban",
    section: "primary",
  },
  {
    id: "backlog",
    path: "/backlog",
    labelKey: "app.backlog",
    defaultIcon: "layers",
    section: "primary",
  },
  {
    id: "sprint-train",
    path: "/sprint-train",
    labelKey: "app.sprintTrain",
    defaultIcon: "train-front",
    section: "primary",
  },
  {
    id: "boards",
    path: "/boards",
    labelKey: "app.boards",
    defaultIcon: "columns-3",
    section: "primary",
  },
  {
    id: "releases",
    path: "/releases",
    labelKey: "app.releases",
    defaultIcon: "flag",
    section: "primary",
  },
  {
    id: "documents",
    path: "/documents",
    labelKey: "app.documents",
    defaultIcon: "file-text",
    section: "primary",
  },
  { id: "goals", path: "/goals", labelKey: "app.goals", defaultIcon: "target", section: "primary" },
  {
    id: "planning",
    path: "/planning",
    labelKey: "app.planning",
    defaultIcon: "chart-gantt",
    section: "planning-group",
  },
  {
    id: "roadmap",
    path: "/planning/roadmap",
    labelKey: "app.roadmap",
    defaultIcon: "map",
    section: "planning",
  },
  {
    id: "project-plans",
    path: "/planning/project-plans",
    labelKey: "app.projectPlans",
    defaultIcon: "folder-kanban",
    section: "planning",
  },
  {
    id: "milestones",
    path: "/planning/milestones",
    labelKey: "app.milestones",
    defaultIcon: "milestone",
    section: "planning",
  },
  {
    id: "dependencies",
    path: "/planning/dependencies",
    labelKey: "app.dependencies",
    defaultIcon: "git-branch",
    section: "planning",
  },
  {
    id: "calendar",
    path: "/calendar",
    labelKey: "app.calendar",
    defaultIcon: "calendar-days",
    section: "utility",
  },
  {
    id: "reports",
    path: "/reports",
    labelKey: "app.reports",
    defaultIcon: "bar-chart-3",
    section: "utility",
  },
  {
    id: "ai-estimator",
    path: "/ai-estimator",
    labelKey: "app.aiEstimator",
    defaultIcon: "sparkles",
    section: "utility",
  },
  {
    id: "settings",
    path: "/settings",
    labelKey: "app.settings",
    defaultIcon: "settings",
    section: "utility",
  },
];

export interface NavigationOverride {
  label?: string;
  icon?: NavigationIconId;
  color?: IconColor;
}
export type NavigationOverrides = Record<string, NavigationOverride>;
export interface NavigationPreferences {
  items: NavigationOverrides;
}
