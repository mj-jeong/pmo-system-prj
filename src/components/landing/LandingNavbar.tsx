import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function LandingNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-200">
            <LayoutDashboard className="text-white w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Nexus PMO</span>
        </div>

        <nav aria-label="주요 메뉴" className="hidden lg:flex items-center gap-10 text-[15px] font-medium text-slate-500">
          <a href="#problem" className="hover:text-slate-900 transition-colors">해결 과제</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">작동 원리</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">주요 기능</a>
          <a href="#trust" className="hover:text-slate-900 transition-colors">신뢰 및 보안</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[15px] font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/register"
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[15px] font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
          >
            데모 보기
          </Link>
        </div>
      </div>
    </header>
  );
}
