import { boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

const generatedId = () => uuid('id').defaultRandom().primaryKey()
const createdTimestamp = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
const updatedTimestamp = () => timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()

export const schoolStructure = pgTable('school_structure', {
  id: generatedId(),
  academicYear: text('academic_year').notNull(),
  grade: text('grade').notNull(),
  className: text('class_name').notNull(),
  createdAt: createdTimestamp(),
  updatedAt: updatedTimestamp(),
  isActive: boolean('is_active').notNull().default(false),
})

export const students = pgTable('students', {
  id: generatedId(),
  fullName: text('full_name').notNull(),
  fatherName: text('father_name').notNull(),
  motherName: text('mother_name').notNull(),
  fatherPhone: text('father_phone'),
  motherPhone: text('mother_phone'),
  schoolStructureId: uuid('school_structure_id').notNull(),
  attendanceRecords: jsonb('attendance_records').$type<AttendanceRecord[]>().notNull(),
  createdAt: createdTimestamp(),
  updatedAt: updatedTimestamp(),
})

export type AttendanceRecord = {
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  note?: string
}

export type SchoolStructure = typeof schoolStructure.$inferSelect
export type Student = typeof students.$inferSelect
