'use server'

import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { schoolStructure, students } from '@/lib/db/schema'

const clean = (value: string, label: string) => {
  const result = value.trim()
  if (result.length < 1 || result.length > 100) throw new Error(`يرجى إدخال ${label} بشكل صحيح.`)
  return result
}

export async function getStructure() {
  return db.select({ id: schoolStructure.id, academicYear: schoolStructure.academicYear, grade: schoolStructure.grade, className: schoolStructure.className, isActive: schoolStructure.isActive, studentCount: count(students.id) }).from(schoolStructure).leftJoin(students, eq(students.schoolStructureId, schoolStructure.id)).groupBy(schoolStructure.id).orderBy(desc(schoolStructure.isActive), asc(schoolStructure.academicYear), asc(schoolStructure.grade), asc(schoolStructure.className))
}

export async function createStructure(input: { academicYear: string; grade: string; className: string }) {
  const academicYear = clean(input.academicYear, 'السنة الدراسية')
  const grade = clean(input.grade, 'الصف')
  const className = clean(input.className, 'الفصل')
  const duplicate = await db.select({ id: schoolStructure.id }).from(schoolStructure).where(and(eq(schoolStructure.academicYear, academicYear), eq(schoolStructure.grade, grade), eq(schoolStructure.className, className))).limit(1)
  if (duplicate.length) throw new Error('هذا الصف والفصل موجودان مسبقًا في السنة الدراسية.')
  const [row] = await db.insert(schoolStructure).values({ academicYear, grade, className, isActive: false }).returning()
  revalidatePath('/structure'); revalidatePath('/students')
  return row
}

export async function updateStructure(id: string, input: { academicYear: string; grade: string; className: string }) {
  const academicYear = clean(input.academicYear, 'السنة الدراسية')
  const grade = clean(input.grade, 'الصف')
  const className = clean(input.className, 'الفصل')
  const duplicate = await db.select({ id: schoolStructure.id }).from(schoolStructure).where(and(eq(schoolStructure.academicYear, academicYear), eq(schoolStructure.grade, grade), eq(schoolStructure.className, className), sql`${schoolStructure.id} <> ${id}`)).limit(1)
  if (duplicate.length) throw new Error('يوجد عنصر مطابق بالفعل.')
  await db.update(schoolStructure).set({ academicYear, grade, className, updatedAt: new Date() }).where(eq(schoolStructure.id, id))
  revalidatePath('/structure'); revalidatePath('/students')
}

export async function setActiveYear(academicYear: string) {
  const year = clean(academicYear, 'السنة الدراسية')
  await db.transaction(async (tx) => {
    await tx.update(schoolStructure).set({ isActive: false, updatedAt: new Date() })
    await tx.update(schoolStructure).set({ isActive: true, updatedAt: new Date() }).where(eq(schoolStructure.academicYear, year))
  })
  revalidatePath('/structure'); revalidatePath('/')
}

export async function deleteStructure(id: string) {
  const linked = await db.select({ total: count(students.id) }).from(students).where(eq(students.schoolStructureId, id))
  if (Number(linked[0]?.total ?? 0) > 0) throw new Error('لا يمكن الحذف: يوجد طلاب مرتبطون بهذا الصف أو الفصل.')
  await db.delete(schoolStructure).where(eq(schoolStructure.id, id))
  revalidatePath('/structure'); revalidatePath('/students')
}

export async function getStructureStudents(id: string) {
  return db.select({ id: students.id, fullName: students.fullName, attendanceRecords: students.attendanceRecords }).from(students).where(eq(students.schoolStructureId, id)).orderBy(asc(students.fullName))
}

export async function createAcademicYear(academicYear: string) {
  const year = clean(academicYear, 'السنة الدراسية')
  const existing = await db.select({ id: schoolStructure.id }).from(schoolStructure).where(eq(schoolStructure.academicYear, year)).limit(1)
  if (existing.length) throw new Error('السنة الدراسية موجودة مسبقًا.')
  const [row] = await db.insert(schoolStructure).values({ academicYear: year, grade: 'عام', className: 'عام', isActive: false }).returning()
  revalidatePath('/structure')
  return row
}

export async function renameAcademicYear(oldYear: string, newYear: string) {
  const value = clean(newYear, 'السنة الدراسية')
  await db.update(schoolStructure).set({ academicYear: value, updatedAt: new Date() }).where(eq(schoolStructure.academicYear, oldYear))
  revalidatePath('/structure'); revalidatePath('/students')
}

export async function getAcademicYears() {
  return db.selectDistinct({ academicYear: schoolStructure.academicYear, isActive: schoolStructure.isActive }).from(schoolStructure).orderBy(desc(schoolStructure.isActive), asc(schoolStructure.academicYear))
}
