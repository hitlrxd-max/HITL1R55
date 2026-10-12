import { asc } from 'drizzle-orm'
import { DashboardShell, PageHeading } from '@/components/dashboard-shell'
import { db } from '@/lib/db'
import { schoolStructure, students } from '@/lib/db/schema'
import { StudentsManager } from './students-manager'

export default async function StudentsPage() {
  const [studentRows, structures] = await Promise.all([
    db.select().from(students).orderBy(asc(students.fullName)).limit(1000),
    db.select().from(schoolStructure).orderBy(asc(schoolStructure.academicYear), asc(schoolStructure.grade), asc(schoolStructure.className)),
  ])

  const joinedStudents = studentRows.map((student) => {
    const structure = structures.find((item) => item.id === student.schoolStructureId)
    return { ...student, grade: structure?.grade ?? null, className: structure?.className ?? null }
  })

  return (
    <DashboardShell>
      <PageHeading
        eyebrow="دليل الطلاب"
        title="إدارة الطلاب"
        description="إضافة وتعديل وبحث ومراجعة بيانات الطلاب وسجلات حضورهم من قاعدة Neon الفعلية."
        action={<a href="/attendance" className="rounded-xl bg-[#16806d] px-4 py-3 text-sm font-bold text-white">تسجيل حضور</a>}
      />
      <StudentsManager initialStudents={joinedStudents} structures={structures} />
    </DashboardShell>
  )
}

