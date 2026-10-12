import { DashboardShell, PageHeading } from '@/components/dashboard-shell'
import { getReportsContext } from './actions'
import { ReportsManager } from './reports-manager'

export default async function ReportsPage() {
  const { structures, roster } = await getReportsContext()
  return <DashboardShell><PageHeading eyebrow="المتابعة والتحليل" title="تقارير الحضور والغياب" description="استخرج تقارير دقيقة من السجلات المحفوظة فعليًا في Neon، مع إبقاء الأيام غير المسجلة خارج الحساب." /><ReportsManager structures={structures} roster={roster} /></DashboardShell>
}
