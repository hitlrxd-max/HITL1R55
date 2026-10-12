'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { schoolStructure, students } from '@/lib/db/schema'

const attendanceInput = z.object({
  studentId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'التاريخ غير صالح'),
  status: z.enum(['present', 'absent']),
  note: z.string().trim().max(500, 'الملاحظة طويلة جدًا').default(''),
})

export type AttendanceInput = z.infer<typeof attendanceInput>

export async function getAttendanceContext() {
  const [structures, roster] = await Promise.all([
    db.select().from(schoolStructure).orderBy(schoolStructure.academicYear, schoolStructure.grade, schoolStructure.className),
    db.select({ id: students.id, fullName: students.fullName, schoolStructureId: students.schoolStructureId, attendanceRecords: students.attendanceRecords }).from(students).orderBy(students.fullName),
  ])
  return { structures, roster }
}

export async function saveAttendance(input: unknown) {
  const data = attendanceInput.parse(input)
  if (data.status === 'present' && data.note) throw new Error('الملاحظة تُستخدم مع حالة الغياب فقط')
  const record = { date: data.date, status: data.status, note: data.note || undefined, updatedAt: new Date().toISOString(), recordedBy: null }
  const result = await db.update(students).set({
    attendanceRecords: sql`(
      COALESCE((
        SELECT jsonb_agg(item)
        FROM jsonb_array_elements(${students.attendanceRecords}) AS item
        WHERE item->>'date' <> ${data.date}
      ), '[]'::jsonb) || ${JSON.stringify([record])}::jsonb
    )`,
    updatedAt: new Date(),
  }).where(and(eq(students.id, data.studentId), sql`${students.attendanceRecords} IS NOT NULL`)).returning({ id: students.id })
  if (!result[0]) throw new Error('الطالب غير موجود أو تعذر حفظ التعديل')
  revalidatePath('/attendance')
  revalidatePath('/')
  return { ok: true, studentId: data.studentId, date: data.date }
}

export async function saveAttendanceBatch(inputs: unknown) {
  const values = z.array(attendanceInput).min(1).max(500).parse(inputs)
  for (const value of values) await saveAttendance(value)
  return { ok: true, count: values.length }
}
