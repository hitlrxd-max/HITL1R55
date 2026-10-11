import { DashboardShell, EmptyState, PageHeading } from '@/components/dashboard-shell'
export default function ReportsPage() { return <DashboardShell><PageHeading eyebrow="المتابعة والتحليل" title="التقارير" description="مساحة التقارير جاهزة لعرض نسب الحضور والغياب حسب السنة والصف والفصل." /><EmptyState>لا توجد سجلات حضور كافية لإنشاء تقرير حاليًا.</EmptyState></DashboardShell> }
