import { DashboardShell, PageHeading } from '@/components/dashboard-shell'
import { db } from '@/lib/db'
import { schoolStructure, students } from '@/lib/db/schema'
import { AttendanceManager } from './attendance-manager'

export default async function AttendancePage() {
  const [structures, roster] = await Promise.all([
    db.select().from(schoolStructure).orderBy(schoolStructure.academicYear, schoolStructure.grade, schoolStructure.className),
    db.select({ id: students.id, fullName: students.fullName, schoolStructureId: students.schoolStructureId, attendanceRecords: students.attendanceRecords }).from(students).orderBy(students.fullName),
  ])
  return <DashboardShell><PageHeading eyebrow="السجل اليومي" title="تسجيل الحضور والغياب" description="حدّد الفصل واليوم، ثم اعتمد الحالات لحفظها فعليًا داخل سجل الطالب في Neon." /><AttendanceManager structures={structures} roster={roster} /></DashboardShell>
}
