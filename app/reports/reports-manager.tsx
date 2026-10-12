'use client'

import { useMemo, useState } from 'react'

type Structure = { id: string; academicYear: string; grade: string; className: string }
type RecordItem = { date: string; status: 'present' | 'absent' | 'late' | 'excused'; note?: string; updatedAt?: string }
type Student = { id: string; fullName: string; schoolStructureId: string; attendanceRecords: unknown }

function recordsOf(value: unknown): RecordItem[] {
  return Array.isArray(value) ? value.filter((item): item is RecordItem => Boolean(item && typeof item === 'object' && typeof (item as RecordItem).date === 'string' && typeof (item as RecordItem).status === 'string')) : []
}

const statusLabel: Record<RecordItem['status'], string> = { present: 'حاضر', absent: 'غائب', late: 'متأخر', excused: 'معذور' }

export function ReportsManager({ structures, roster }: { structures: Structure[]; roster: Student[] }) {
  const [year, setYear] = useState('الكل')
  const [grade, setGrade] = useState('الكل')
  const [className, setClassName] = useState('الكل')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [studentId, setStudentId] = useState('الكل')
  const [scope, setScope] = useState<'class' | 'grade' | 'student'>('class')

  const years = useMemo(() => [...new Set(structures.map((item) => item.academicYear))], [structures])
  const grades = useMemo(() => [...new Set(structures.filter((item) => year === 'الكل' || item.academicYear === year).map((item) => item.grade))], [structures, year])
  const classes = useMemo(() => [...new Set(structures.filter((item) => (year === 'الكل' || item.academicYear === year) && (grade === 'الكل' || item.grade === grade)).map((item) => item.className))], [structures, year, grade])
  const selectedStructures = useMemo(() => structures.filter((item) => (year === 'الكل' || item.academicYear === year) && (grade === 'الكل' || item.grade === grade) && (className === 'الكل' || item.className === className)), [structures, year, grade, className])
  const selectedIds = useMemo(() => new Set(selectedStructures.map((item) => item.id)), [selectedStructures])
  const students = useMemo(() => roster.filter((item) => selectedIds.has(item.schoolStructureId) && (scope !== 'student' || studentId === 'الكل' || item.id === studentId)), [roster, selectedIds, scope, studentId])
  const rows = useMemo(() => students.map((student) => {
    const records = recordsOf(student.attendanceRecords).filter((record) => record.date.startsWith(month))
    const present = records.filter((record) => record.status === 'present').length
    const absent = records.filter((record) => record.status === 'absent').length
    const late = records.filter((record) => record.status === 'late').length
    const excused = records.filter((record) => record.status === 'excused').length
    const total = records.length
    return { student, records, present, absent, late, excused, total, percentage: total ? Math.round((present / total) * 100) : null }
  }), [students, month])
  const hasRecords = rows.some((row) => row.total > 0)
  const filterText = [year !== 'الكل' && year, grade !== 'الكل' && grade, className !== 'الكل' && className, month].filter(Boolean).join(' · ')

  const exportCsv = () => {
    const lines = [['الطالب', 'الحضور', 'الغياب', 'التأخر', 'المعذور', 'النسبة', 'التاريخ', 'الحالة', 'الملاحظة'], ...rows.flatMap((row) => row.records.map((record) => [row.student.fullName, String(row.present), String(row.absent), String(row.late), String(row.excused), row.percentage === null ? '' : `${row.percentage}%`, record.date, statusLabel[record.status], record.note ?? '']))]
    const csv = '\ufeff' + lines.map((line) => line.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `تقرير-الحضور-${month}.csv`; link.click(); URL.revokeObjectURL(url)
  }

  return <section className="reports-area">
    <div className="report-controls print:hidden">
      <div className="report-scope" role="group" aria-label="نوع التقرير"><button className={scope === 'class' ? 'active' : ''} onClick={() => setScope('class')}>فصل كامل</button><button className={scope === 'grade' ? 'active' : ''} onClick={() => setScope('grade')}>صف دراسي</button><button className={scope === 'student' ? 'active' : ''} onClick={() => setScope('student')}>طالب محدد</button></div>
      <div className="report-filters"><label>السنة الدراسية<select value={year} onChange={(e) => { setYear(e.target.value); setGrade('الكل'); setClassName('الكل') }}><option>الكل</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label><label>الصف<select value={grade} onChange={(e) => { setGrade(e.target.value); setClassName('الكل') }}><option>الكل</option>{grades.map((item) => <option key={item}>{item}</option>)}</select></label><label>الفصل<select value={className} onChange={(e) => setClassName(e.target.value)}><option>الكل</option>{classes.map((item) => <option key={item}>{item}</option>)}</select></label><label>الشهر<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>{scope === 'student' && <label>الطالب<select value={studentId} onChange={(e) => setStudentId(e.target.value)}><option value="الكل">اختر طالبًا</option>{roster.filter((item) => selectedIds.has(item.schoolStructureId)).map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label>}</div>
      <div className="report-actions"><button onClick={() => window.print()}>طباعة التقرير</button><button onClick={exportCsv} disabled={!hasRecords}>تصدير CSV</button></div>
    </div>
    <div className="report-meta"><div><span>الفلاتر المستخدمة</span><strong>{filterText || 'كل البيانات'} </strong></div><div><span>تاريخ إنشاء التقرير</span><strong>{new Date().toLocaleString('ar-SA')}</strong></div></div>
    {!hasRecords ? <div className="report-empty">{students.length ? 'لا توجد سجلات حضور أو غياب للفترة المختارة.' : 'لا يوجد طلاب مطابقون للفلاتر المختارة.'}</div> : <div className="report-table-wrap"><table><thead><tr><th>الطالب</th><th>حضور</th><th>غياب</th><th>تأخر</th><th>معذور</th><th>نسبة الحضور</th><th>تفاصيل السجلات</th></tr></thead><tbody>{rows.map((row) => <tr key={row.student.id}><td>{row.student.fullName}</td><td>{row.present}</td><td>{row.absent}</td><td>{row.late}</td><td>{row.excused}</td><td>{row.percentage === null ? '—' : `${row.percentage}%`}</td><td><div className="record-list">{row.records.map((record) => <span key={`${row.student.id}-${record.date}`} className={record.status === 'absent' ? 'absent' : 'present'}>{record.date}: {statusLabel[record.status]}{record.note ? ` — ${record.note}` : ''}</span>)}</div></td></tr>)}</tbody></table></div>}
  </section>
}
