'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { schoolStructure, students } from '@/lib/db/schema'

const phone = z.string().trim().regex(/^[+\d][\d\s().-]{6,29}$/, 'رقم الهاتف غير صالح').or(z.literal('')).transform((value) => value || null)
const studentSchema = z.object({
  fullName: z.string().trim().min(2, 'الاسم الكامل مطلوب').max(160),
  fatherName: z.string().trim().min(2, 'اسم الأب مطلوب').max(120),
  motherName: z.string().trim().min(2, 'اسم الأم مطلوب').max(120),
  fatherPhone: phone,
  motherPhone: phone,
  schoolStructureId: z.string().uuid('اختر صفًا وفصلًا صحيحين'),
})

async function validateStructure(id: string) {
  const [structure] = await db.select({ id: schoolStructure.id }).from(schoolStructure).where(eq(schoolStructure.id, id)).limit(1)
  if (!structure) throw new Error('الصف والفصل المختاران غير موجودين في هيكل المدرسة')
}

export async function createStudent(input: unknown) {
  const data = studentSchema.parse(input)
  await validateStructure(data.schoolStructureId)
  const now = new Date()
  const [student] = await db.insert(students).values({ id: crypto.randomUUID(), ...data, attendanceRecords: [], createdAt: now, updatedAt: now }).returning({ id: students.id })
  revalidatePath('/students')
  return { ok: true, id: student.id }
}

export async function updateStudent(id: string, input: unknown) {
  const data = studentSchema.parse(input)
  const studentId = z.string().uuid().parse(id)
  await validateStructure(data.schoolStructureId)
  const [updated] = await db.update(students).set({ ...data, updatedAt: new Date() }).where(eq(students.id, studentId)).returning({ id: students.id })
  if (!updated) throw new Error('الطالب غير موجود')
  revalidatePath('/students')
  return { ok: true, id: updated.id }
}

export async function deleteStudent(id: string) {
  const studentId = z.string().uuid().parse(id)
  const [student] = await db.select({ id: students.id, attendanceRecords: students.attendanceRecords }).from(students).where(eq(students.id, studentId)).limit(1)
  if (!student) throw new Error('الطالب غير موجود')
  if (student.attendanceRecords.length > 0) throw new Error('لا يمكن حذف طالب لديه سجل حضور أو غياب. احفظ السجل ولا تحذفه بالخطأ.')
  await db.delete(students).where(and(eq(students.id, studentId), eq(students.attendanceRecords, [])))
  revalidatePath('/students')
  return { ok: true }
}

export async function getStudent(id: string) {
  const studentId = z.string().uuid().parse(id)
  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1)
  return student ?? null
}
'}},{
