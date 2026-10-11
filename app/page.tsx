import { count, eq } from 'drizzle-orm'
import { ArrowLeft, CalendarCheck2, ClipboardList, Users } from 'lucide-react'
import { DashboardCard, DashboardShell, PageHeading, StatCard, EmptyState } from '@/components/dashboard-shell'
import { db } from '@/lib/db'
import { schoolStructure, students } from '@/lib/db/schema'

async function getDashboardData() {
  const [studentCount, structureCount, recentStudents] = await Promise.all([
    db.select({ value: count() }).from(students),
    db.select({ value: count() }).from(schoolStructure),
    db.select({ id: students.id, fullName: students.fullName, grade: schoolStructure.grade, className: schoolStructure.className, attendanceRecords: students.attendanceRecords }).from(students).leftJoin(schoolStructure, eq(students.schoolStructureId, schoolStructure.id)).limit(6),
  ])
  const records = recentStudents.reduce((sum, student) => sum + (Array.isArray(student.attendanceRecords) ? student.attendanceRecords.length : 0), 0)
  return { studentCount: Number(studentCount[0]?.value ?? 0), structureCount: Number(structureCount[0]?.value ?? 0), records, recentStudents }
}

export default async function Page() {
  const data = await getDashboardData()
  return <DashboardShell><PageHeading eyebrow="نظرة عامة" title="مرحبًا بك في سجل المدرسة" description="تابع كثافة الطلاب وسجلات الحضور من مساحة عمل واحدة واضحة." action={<a href="/attendance" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16806d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#126b5c]"><CalendarCheck2 className="size-4" /> تسجيل حضور اليوم</a>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><StatCard label="إجمالي الطلاب" value={data.studentCount} detail="طالب مسجل في المدرسة" /><StatCard label="الصفوف والفصول" value={data.structureCount} detail="تركيب مدرسي معرف" tone="blue" /><StatCard label="سجلات الحضور" value={data.records} detail="سجل محفوظ ضمن ملفات الطلاب" tone="gold" /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]"><DashboardCard title="آخر الطلاب المضافين" action={<a href="/students" className="text-sm font-semibold text-[#16806d]">عرض الكل <ArrowLeft className="mr-1 inline size-4" /></a>}>{data.recentStudents.length === 0 ? <EmptyState>لا توجد بيانات طلاب حتى الآن.</EmptyState> : <div className="flex flex-col gap-3">{data.recentStudents.map((student) => <div key={student.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="font-semibold">{student.fullName}</p><p className="mt-1 text-xs text-slate-500">{student.grade ?? 'غير محدد'} · {student.className ?? 'غير محدد'}</p></div><span className="rounded-full bg-[#d9f3ed] px-3 py-1 text-xs font-semibold text-[#167d6d]">{Array.isArray(student.attendanceRecords) ? student.attendanceRecords.length : 0} سجل</span></div>)}</div>}</DashboardCard><DashboardCard title="اختصارات سريعة"><div className="grid gap-3"><a href="/students" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#43c6ac]"><Users className="text-[#16806d]" /><span className="font-semibold">إدارة قائمة الطلاب</span></a><a href="/reports" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#43c6ac]"><ClipboardList className="text-[#29618e]" /><span className="font-semibold">مراجعة التقارير</span></a></div></DashboardCard></div>
  </DashboardShell>
}
