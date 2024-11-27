import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { InferModel } from "drizzle-orm"; // Import InferModel from drizzle-orm

// Define the MockInterview table structure
export const MockInterview = pgTable("mockInterview", {
  id: serial("id").primaryKey(),
  jsonMockResp: text("jsonMockResp").notNull(),
  jobPosition: varchar("jobPosition").notNull(),
  jobDesc: varchar("jobDesc").notNull(),
  jobExperience: varchar("jobExperience").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt"),
  mockId: varchar("mockId").notNull(),
});

export const UserAnswer = pgTable('userAnswer', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mockIdRef').notNull(),
  question: varchar('question').notNull(),
  correctAns: text('correctAns'),
  userAns: text('userAns'),
  feedback: text('feedback'),
  rating: varchar('rating'),
  userEmail: varchar('userEmail'),
  createdAt: varchar('createdAt'),
});
// Infer the TypeScript type for MockInterview based on the pgTable structure
export type MockInterview = InferModel<typeof MockInterview>;
export type UserAnswer = InferModel<typeof UserAnswer>; // Correct type inference