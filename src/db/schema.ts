import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  employeeId: text('employee_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dbEmployees = pgTable('employees', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  department: text('department').notNull(),
  avatar: text('avatar'),
  email: text('email').notNull(),
  color: text('color').notNull(),
  team: text('team'),
  position: text('position'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dbManualOverrides = pgTable('manual_overrides', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  date: text('date').notNull(),
  shiftTypeId: text('shift_type_id').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dbSwapRequests = pgTable('swap_requests', {
  id: text('id').primaryKey(),
  requesterId: text('requester_id').notNull(),
  requestedShiftId: text('requested_shift_id').notNull(),
  targetShiftId: text('target_shift_id'),
  receiverId: text('receiver_id'),
  status: text('status').notNull(),
  message: text('message'),
  createdAt: text('created_at').notNull(),
});
