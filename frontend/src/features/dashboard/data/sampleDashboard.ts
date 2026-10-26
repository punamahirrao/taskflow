import { Monitor, Smartphone, UsersRound } from "lucide-react";

export const sampleProjects = [
  { name: "Website redesign", description: "Improve brand and user experience", progress: 78, due: "Due Apr 25, 2025", status: "On track", icon: Monitor, iconClass: "bg-blue-100 text-blue-600", barClass: "bg-blue-500", people: ["JD", "AM", "KL"], extraPeople: 2 },
  { name: "Mobile app launch", description: "v2.0 for iOS and Android", progress: 52, due: "Due Apr 18, 2025", status: "At risk", icon: Smartphone, iconClass: "bg-teal-100 text-teal-600", barClass: "bg-teal-500", people: ["MP", "SR", "TC"], extraPeople: 3 },
  { name: "Customer research", description: "Understand customer needs 2025", progress: 68, due: "Due May 2, 2025", status: "On track", icon: UsersRound, iconClass: "bg-violet-100 text-violet-600", barClass: "bg-indigo-500", people: ["KL", "JD"], extraPeople: 1 },
];

export const sampleActivity = [
  { initials: "DP", name: "Daniel Park", action: "updated the project timeline for", project: "Mobile app launch.", time: "2 hours ago", color: "bg-sky-100 text-sky-700" },
  { initials: "PS", name: "Priya Shah", action: "completed a task in", project: "Website redesign.", time: "4 hours ago", color: "bg-rose-100 text-rose-700" },
  { initials: "JL", name: "James Lee", action: "commented on", project: "Customer research.", note: "“These insights look great — let’s include them in the next update.”", time: "6 hours ago", color: "bg-amber-100 text-amber-700" },
  { initials: "SK", name: "Sara Kim", action: "added a new task to", project: "Mobile app launch.", time: "1 day ago", color: "bg-violet-100 text-violet-700" },
];
