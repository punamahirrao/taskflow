import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(254, "Email must be 254 characters or fewer");
const nonEmpty = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);
export const loginSchema = z.object({ email, password: z.string().min(1, "Password is required") });
export const registerSchema = z
  .object({
    email,
    organizationName: nonEmpty("Organization name", 100),
    jobTitle: nonEmpty("Job title", 100),
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export const projectSchema = z
  .object({
    name: nonEmpty("Project name"),
    status: z.enum(["in_progress", "upcoming", "archived"]),
    expectedStartDate: z.string(),
    endDate: z.string(),
  })
  .refine(
    (data) => !data.expectedStartDate || !data.endDate || data.endDate >= data.expectedStartDate,
    { path: ["endDate"], message: "End date must be on or after the start date" },
  );
export const boardSchema = z.object({
  name: nonEmpty("Board name", 100),
  description: z.string().max(2000, "Description must be 2000 characters or fewer"),
  project: z.string().min(1, "Choose a project"),
  type: z.enum(["scrum", "kanban"]),
  members: z.array(z.number()),
});
export const taskSchema = z.object({
  title: nonEmpty("Title", 255),
  description: z.string().max(10000, "Description is too long"),
  dueDate: z.string().optional(),
});
export const profileSchema = z.object({
  firstName: nonEmpty("First name", 150),
  lastName: nonEmpty("Last name", 150),
  jobTitle: nonEmpty("Job title", 100),
  department: z.string().max(100),
  aboutMe: z.string().max(5000),
});
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must contain at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export const userSchema = z.object({
  firstName: nonEmpty("First name", 150),
  lastName: nonEmpty("Last name", 150),
  email,
  jobTitle: nonEmpty("Job title", 100),
  password: z.string().min(8, "Password must contain at least 8 characters").optional(),
});
export const nameSchema = z.object({ name: nonEmpty("Name", 100) });
export const documentFolderSchema = z.object({ name: nonEmpty("Folder name", 100) });
export const resourceLinkSchema = z.object({
  name: nonEmpty("Resource name", 255),
  url: z.string().trim().url("Enter a valid resource URL"),
});
export const commentSchema = z.object({ text: nonEmpty("Comment", 10000) });
export const sprintSchema = z
  .object({
    name: nonEmpty("Sprint name", 100),
    goal: z.string().max(255, "Goal must be 255 characters or fewer"),
    startDate: z.string(),
    endDate: z.string(),
    capacity: z.string(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "End date must be on or after the start date",
  })
  .refine(
    (data) => !data.capacity || (/^\d+$/.test(data.capacity) && Number(data.capacity) <= 32767),
    { path: ["capacity"], message: "Capacity must be a whole number from 0 to 32767" },
  );

export function firstValidationError<T>(schema: z.ZodType<T>, values: unknown): string | null {
  const parsed = schema.safeParse(values);
  return parsed.success
    ? null
    : (parsed.error.issues[0]?.message ?? "Check the form values and try again.");
}
