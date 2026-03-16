import Link from "next/link";
import { ArrowRight, CheckCircle2, Github, LayoutDashboard, Zap } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative pt-40 pb-24 px-6 overflow-hidden">
      {/* Blob background */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30"
        aria-hidden="true"
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-[120px] animate-blob-drift" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-[150px] animate-blob-drift-delay" />
      </div>

      <div className="max-w-7xl mx-auto text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Badge chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[13px] font-semibold rounded-full mb-8 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500" aria-hidden="true" />
            <span>엔터프라이즈를 위한 차세대 PMO 시스템</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-8 tracking-tight leading-[1.05]">
            AI는 초안을 쓰고, <br />
            <span className="text-blue-600">결정은 사람이 합니다.</span>
          </h1>

          {/* Body */}
          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            에이전시의 복잡한 프로젝트 관리를 혁신합니다.{" "}
            <br className="hidden md:block" />
            AI가 데이터를 분석하고 보고서를 제안하면, 전문가는 승인만 하세요.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
            <Link href="/register" className="landing-btn-primary-lg w-full sm:w-auto group">
              무료 데모 시작하기{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
            <Link href="https://github.com/mj-jeong/pmo-system-prj" className="landing-btn-secondary-lg w-full sm:w-auto">
              <Github className="w-5 h-5" aria-hidden="true" /> GitHub 저장소
            </Link>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="relative mx-auto max-w-6xl">
          <div className="p-3 bg-white/50 backdrop-blur-sm rounded-[32px] border border-slate-200 shadow-2xl">
            <div
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 flex items-center justify-center"
              style={{ height: "480px" }}
              role="img"
              aria-label="Nexus PMO 대시보드 미리보기"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center mx-auto">
                  <LayoutDashboard className="w-8 h-8 text-slate-400" aria-hidden="true" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Dashboard Preview</p>
                <div className="flex gap-3 justify-center">
                  <div className="h-2 w-16 bg-slate-200 rounded-full" />
                  <div className="h-2 w-24 bg-slate-200 rounded-full" />
                  <div className="h-2 w-12 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification card */}
          <div className="absolute -top-10 -left-10 hidden xl:block">
            <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="text-emerald-600 w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">보고서 자동 생성 완료</div>
                <div className="text-xs text-slate-500">방금 전 AI 에이전트가 작성</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
