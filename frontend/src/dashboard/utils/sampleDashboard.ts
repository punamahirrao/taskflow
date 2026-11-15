import { Monitor, Smartphone, UsersRound } from "lucide-react";

export const sampleProjects = [
  { name: "Website redesign", description: "Improve brand and user experience", progress: 78, due: "Due Apr 25, 2025", status: "On track", icon: Monitor, tone: "info", people: ["JD", "AM", "KL"], extraPeople: 2 },
  { name: "Mobile app launch", description: "v2.0 for iOS and Android", progress: 52, due: "Due Apr 18, 2025", status: "At risk", icon: Smartphone, tone: "warning", people: ["MP", "SR", "TC"], extraPeople: 3 },
  { name: "Customer research", description: "Understand customer needs 2025", progress: 68, due: "Due May 2, 2025", status: "On track", icon: UsersRound, tone: "success", people: ["KL", "JD"], extraPeople: 1 },
] as const;

export const sampleActivity = [
  { initials: "DP", name: "Daniel Park", action: "updated the project timeline for", project: "Mobile app launch.", time: "2 hours ago", tone: "info" },
  { initials: "PS", name: "Priya Shah", action: "completed a task in", project: "Website redesign.", time: "4 hours ago", tone: "danger" },
  { initials: "JL", name: "James Lee", action: "commented on", project: "Customer research.", note: "“These insights look great — let’s include them in the next update.”", time: "6 hours ago", tone: "warning" },
  { initials: "SK", name: "Sara Kim", action: "added a new task to", project: "Mobile app launch.", time: "1 day ago", tone: "accent" },
] as const;
