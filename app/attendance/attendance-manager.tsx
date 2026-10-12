'use client'

import { useMemo, useState, useTransition } from 'react'
import { saveAttendance } from './actions'

type Structure = { id: string; academicYear: string; grade: string; className: string }
type Student = { id: string; fullName: string; schoolStructureId: string; attendanceRecords: unknown }
type RecordItem = { date: string; status: 'present' | 'absent'; note?: string; updatedAt?: string; recordedBy?: string | null }

function recordsOf(value: unknown): RecordItem[] { return Array.isArray(value) ? value.filter((item): item is RecordItem => Boolean(item && typeof item === 'object' && 'date' in item && 'status' in item)) : [] }

export function AttendanceManager({ structures, roster }: { structures: Structure[]; roster: Student[] }) {
  const [structureId, setStructureId] = useState(structures[0]?.id ?? '')
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [drafts, setDrafts] = useState<Record<string, { status: 'present' | 'absent'; note: string }>>({})
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const students = roster.filter((student) => student.schoolStructureId === structureId)
  const days = useMemo(() => { const [year, m] = month.split('-').map(Number); return Array.from({ length: new Date(year, m, 0).getDate() }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`) }, [month])
  const existing = (student: Student, date: string) => recordsOf(student.attendanceRecords).find((record) => record.date === date)
  const setDraft = (studentId: string, status: 'present' | 'absent', note = '') => setDrafts((current) => ({ ...current, [studentId]: { status, note } }))
  const submit = () => {
    const entries = Object.entries(drafts)
    if (!entries.length) { setError('حدد حالة طالب واحد على الأقل قبل الحفظ'); return }
    setError(''); setMessage('')
    startTransition(async () => {
      try {
        for (const [studentId, draft] of entries) await saveAttendance({ studentId, date: selectedDate, ...draft })
        setDrafts({}); setMessage(`تم حفظ ${entries.length} سجل بنجاح في Neon`); window.location.reload()
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر حفظ السجلات') }
    })
  }
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
    <div className="grid gap-4 md:grid-cols-3">
      <label className="flex flex-col gap-2 text-sm font-semibold">السنة والصف والفصل<select className="rounded-xl border border-slate-200 bg-white p-3" value={structureId} onChange={(e) => setStructureId(e.target.value)}>{structures.map((item) => <option key={item.id} value={item.id}>{item.academicYear} — {item.grade} — {item.className}</option>)}</select></label>
      <label className="flex flex-col gap-2 text-sm font-semibold">الشهر<input className="rounded-xl border border-slate-200 p-3" type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
      <label className="flex flex-col gap-2 text-sm font-semibold">يوم التسجيل<input className="rounded-xl border border-slate-200 p-3" type="date" value={selectedDate} min={`${month}-01`} max={days.at(-1)} onChange={(e) => setSelectedDate(e.target.value)} /></label>
    </div>
    <div className="mt-6 flex flex-wrap gap-2">{days.map((day) => <button key={day} type="button" onClick={() => setSelectedDate(day)} className={`rounded-lg px-3 py-2 text-sm ${day === selectedDate ? 'bg-[#1d5c56] text-white' : 'bg-slate-100 text-slate-700'}`}>{Number(day.slice(-2))}</button>)}</div>
    {message && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="mt-6 flex flex-col gap-3">{students.length ? students.map((student) => { const record = existing(student, selectedDate); const draft = drafts[student.id]; const status = draft?.status ?? record?.status; return <div key={student.id} className="grid gap-3 rounded-2xl border border-slate-100 p-4 md:grid-cols-[1fr_auto_auto_1fr] md:items-center"><strong>{student.fullName}</strong><span className="text-xs text-slate-500">{record ? `محفوظ ${record.updatedAt ? new Date(record.updatedAt).toLocaleTimeString('ar') : ''}` : 'غير مسجل'}</span><div className="flex gap-2"><button type="button" onClick={() => setDraft(student.id, 'present')} className={`rounded-xl px-4 py-2 text-sm ${status === 'present' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'}`}>حاضر</button><button type="button" onClick={() => setDraft(student.id, 'absent')} className={`rounded-xl px-4 py-2 text-sm ${status === 'absent' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800'}`}>غائب</button></div><input aria-label={`ملاحظة غياب ${student.fullName}`} disabled={status !== 'absent'} value={draft?.note ?? record?.note ?? ''} onChange={(e) => setDraft(student.id, 'absent', e.target.value)} placeholder="ملاحظة الغياب (اختيارية)" className="rounded-xl border border-slate-200 p-2 text-sm disabled:bg-slate-50" /></div>}) : <p className="py-10 text-center text-slate-500">لا يوجد طلاب في هذا الفصل.</p>}</div>
    <button type="button" disabled={pending || !Object.keys(drafts).length} onClick={() => window.confirm('سيتم اعتماد التعديلات المحددة وحفظها في Neon. هل تريد المتابعة؟') && submit()} className="mt-6 rounded-xl bg-[#1d5c56] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{pending ? 'جارٍ الحفظ...' : 'اعتماد التعديلات'}</button>
  </section>
}
