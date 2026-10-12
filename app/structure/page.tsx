import { DashboardShell, PageHeading } from '@/components/dashboard-shell'
import { getStructure } from './actions'
import { StructureManager } from './structure-manager'

export const dynamic = 'force-dynamic'

export default async function StructurePage() {
  const rows = await getStructure()
  return <DashboardShell><PageHeading eyebrow="تنظيم المدرسة" title="الصفوف والفصول" description="إدارة السنوات الدراسية والصفوف والفصول المرتبطة مباشرة بملفات الطلاب." /><StructureManager initialRows={rows.map((row) => ({ ...row, studentCount: Number(row.studentCount) }))} /></DashboardShell>
}
