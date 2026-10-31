export type LanguageCode = "en" | "sv";

export type TranslationKey =
  | "app.dashboard" | "app.projects" | "app.backlog" | "app.boards" | "app.portfolio"
  | "app.documents" | "app.team" | "app.calendar" | "app.reports" | "app.profile"
  | "app.settings" | "app.users" | "app.project" | "app.taskflow"
  | "nav.main" | "nav.administration" | "nav.searchProjects" | "nav.myProfile"
  | "settings.title" | "settings.subtitle" | "settings.appearance" | "settings.currentTheme"
  | "settings.chooseTheme" | "settings.themeDescription" | "settings.language" | "settings.languageDescription"
  | "language.english" | "language.swedish"
  | "theme.original" | "theme.professional" | "theme.night"
  | "theme.originalDescription" | "theme.professionalDescription" | "theme.nightDescription"
  | "dashboard.welcome" | "dashboard.viewAllProjects" | "dashboard.recentActivity" | "dashboard.viewAllActivity" | "common.tryAgain"
  | "stats.totalProjects" | "stats.totalProjectsDetail" | "stats.tasksCompleted" | "stats.tasksCompletedDetail"
  | "stats.pendingTasks" | "stats.pendingTasksDetail" | "stats.completionRate" | "stats.completionRateDetail"
  | "common.save" | "settings.languageSaved";
