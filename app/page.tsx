import { count, eq } from 'drizzle-orm'
import { ArrowLeft, CalendarCheck2, GraduationCap, LayoutGrid, Users } from 'lucide-react'
import { db } from '@/lib/db'
import { schoolStructure, students } from '@/lib/db/schema'

async function getDashboardData() {
  const [studentCount, structureCount, structures, recentStudents] = await Promise.all([
    db.select({ value: count() }).from(students),
    db.select({ value: count() }).from(schoolStructure),
    db.select().from(schoolStructure).limit(8),
    db
      .select({
        id: students.id,
        fullName: students.fullName,
        grade: schoolStructure.grade,
        className: schoolStructure.className,
        attendanceRecords: students.attendanceRecords,
      })
      .from(students)
      .leftJoin(schoolStructure, eq(students.schoolStructureId, schoolStructure.id))
      .limit(6),
  ])

  return {
    studentCount: Number(studentCount[0]?.value ?? 0),
    structureCount: Number(structureCount[0]?.value ?? 0),
    structures,
    recentStudents,
  }
}

export default async function Page() {
  const data = await getDashboardData()

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <GraduationCap aria-hidden="true" className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">مدرسة واحدة</p>
              <h1 className="mt-1 text-lg font-bold tracking-tight">سجل المدرسة</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground sm:flex">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" /> اتصال قاعدة البيانات نشط
          </div>
        </header>

        <section className="grid flex-1 content-start gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold text-muted-foreground">نظرة عامة على الحضور</p>
            <h2 className="max-w-xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-6xl">إدارة حضور الطلاب بوضوح وهدوء.</h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">مساحة عمل مركزية لسجل الطلاب، الهيكل المدرسي، وسجلات الحضور اليومية — مبنية على بيانات قاعدة Neon الفعلية.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#students" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                عرض الطلاب <ArrowLeft aria-hidden="true" className="size-4" />
              </a>
              <a href="#structure" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-accent">
                هيكل المدرسة
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard icon={<Users aria-hidden="true" />} label="إجمالي الطلاب" value={data.studentCount} />
            <MetricCard icon={<LayoutGrid aria-hidden="true" />} label="الفصول المعرفة" value={data.structureCount} />
            <div className="rounded-3xl border border-border bg-card p-5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-foreground"><CalendarCheck2 aria-hidden="true" className="size-5" /></div>
                  <div><p className="text-sm font-semibold">سجلات الحضور</p><p className="mt-1 text-xs text-muted-foreground">مخزنة ضمن ملف كل طالب</p></div>
                </div>
                <span className="text-2xl font-bold">JSONB</span>
              </div>
            </div>
          </div>
        </section>

        <section id="students" className="border-t border-border py-8">
          <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">STUDENTS</p><h3 className="mt-2 text-2xl font-bold">الطلاب المسجلون</h3></div><span className="text-sm text-muted-foreground">{data.studentCount} طالب</span></div>
          {data.recentStudents.length === 0 ? <EmptyState text="لا توجد بيانات طلاب بعد. ستظهر هنا عند التسجيل من خلال واجهة الإدارة." /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.recentStudents.map((student) => <article key={student.id} className="rounded-2xl border border-border bg-card p-4"><p className="font-semibold">{student.fullName}</p><p className="mt-2 text-sm text-muted-foreground">{student.grade ?? '—'} · {student.className ?? '—'}</p><p className="mt-4 text-xs text-muted-foreground">{Array.isArray(student.attendanceRecords) ? student.attendanceRecords.length : 0} سجل حضور</p></article>)}</div>}
        </section>

        <section id="structure" className="border-t border-border py-8"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">SCHOOL STRUCTURE</p><h3 className="mt-2 text-2xl font-bold">هيكل المدرسة</h3></div><p className="text-sm text-muted-foreground">مرتبط بكل طالب</p></div><div className="mt-5">{data.structures.length === 0 ? <EmptyState text="لا توجد سنوات أو فصول معرفة بعد. أضف الهيكل قبل تسجيل الطلاب لضمان تقارير دقيقة." /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.structures.map((item) => <article key={item.id} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{item.academicYear}</p><p className="mt-2 font-semibold">{item.grade}</p><p className="mt-1 text-sm text-muted-foreground">{item.className}</p></article>)}</div>}</div></section>
      </div>
    </main>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-3xl border border-border bg-card p-5"><div className="flex size-10 items-center justify-center rounded-xl bg-accent text-foreground">{icon}</div><p className="mt-8 text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-8 text-center text-sm leading-7 text-muted-foreground">{text}</div>
}
