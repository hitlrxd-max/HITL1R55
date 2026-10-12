'use server'

import { db } from '@/lib/db'
import { schoolStructure, students } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export async function getReportsContext() {
  const [structures, roster] = await Promise.all([
    db.select({ id: schoolStructure.id, academicYear: schoolStructure.academicYear, grade: schoolStructure.grade, className: schoolStructure.className }).from(schoolStructure).orderBy(asc(schoolStructure.academicYear), asc(schoolStructure.grade), asc(schoolStructure.className)),
    db.select({ id: students.id, fullName: students.fullName, schoolStructureId: students.schoolStructureId, attendanceRecords: students.attendanceRecords }).from(students).orderBy(asc(students.fullName)),
  ])
  return { structures, roster }
}
