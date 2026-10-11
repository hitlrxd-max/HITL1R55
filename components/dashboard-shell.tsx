'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarCheck2, ClipboardList, GraduationCap, LayoutDashboard, Menu, Settings2, Users, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/students', label: 'الطلاب', icon: Users },
  { href: '/structure', label: 'الصفوف والفصول', icon: GraduationCap },
  { href: '/attendance', label: 'تسجيل الحضور والغياب', icon: CalendarCheck2 },
  { href: '/reports', label: 'التقارير', icon: ClipboardList },
  { href: '/settings', label: 'إعدادات السنوات الدراسية', icon: Settings2 },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <div dir="rtl" className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 border-l border-slate-200 bg-[#102a43] p-5 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#43c6ac] text-[#102a43]"><GraduationCap /></div><div><p className="text-xs text-white/60">منظومة المدرسة</p><p className="font-bold">سجل الحضور</p></div></div>
          <button aria-label="إغلاق القائمة" onClick={() => setOpen(false)} className="lg:hidden"><X /></button>
        </div>
        <nav className="mt-7 flex flex-col gap-2" aria-label="التنقل الرئيسي">{navItems.map(({ href, label, icon: Icon }) => { const active = href === '/' ? pathname === '/' : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${active ? 'bg-white text-[#102a43] font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}><Icon className="size-5" />{label}</Link> })}</nav>
        <div className="absolute bottom-5 right-5 left-5 rounded-2xl bg-white/10 p-4 text-xs leading-6 text-white/70">البيانات متصلة بقاعدة Neon الفعلية<br /><span className="text-[#78e6cc]">● اتصال آمن من الخادم</span></div>
      </aside>
      {open && <button aria-label="إغلاق القائمة" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}
      <div className="lg:pr-72"><header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-[#f6f8fb]/90 px-5 backdrop-blur sm:px-8"><button aria-label="فتح القائمة" onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 lg:hidden"><Menu /></button><div className="mr-auto flex items-center gap-3"><div className="hidden text-left sm:block"><p className="text-xs text-slate-500">اليوم الدراسي</p><p className="text-sm font-semibold">لوحة الإدارة المدرسية</p></div><div className="size-10 rounded-full bg-[#d9f3ed] text-center leading-10 font-bold text-[#167d6d]">م</div></div></header><main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main></div>
    </div>
  )
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold text-[#16806d]">{eyebrow}</p><h1 className="text-3xl font-bold tracking-tight text-[#102a43] sm:text-4xl">{title}</h1><p className="mt-3 text-sm leading-7 text-slate-500">{description}</p></div>{action}</div> }

export function EmptyState({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">{children}</div> }

export function StatCard({ label, value, detail, tone = 'teal' }: { label: string; value: number; detail: string; tone?: 'teal' | 'blue' | 'gold' }) { const colors = { teal: 'bg-[#d9f3ed] text-[#167d6d]', blue: 'bg-[#e0ebf7] text-[#29618e]', gold: 'bg-[#fff1cf] text-[#9b6b16]' }; return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`mb-5 flex size-11 items-center justify-center rounded-xl ${colors[tone]}`}><span className="text-lg font-bold">{value}</span></div><p className="font-semibold text-slate-800">{label}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div> }

export function DashboardCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-800">{title}</h2>{action}</div><div className="p-5">{children}</div></section> }
