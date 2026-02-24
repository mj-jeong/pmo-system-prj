import Link from "next/link";
import {
  BarChart3,
  ShieldCheck,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
  History,
  Search,
  Cpu,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";

// ============================================================================
// Navbar
// ============================================================================

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-bold text-xl tracking-tight">Nexus PMO</span>
        </div>

        <nav aria-label="주요 메뉴" className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#problem" className="hover:text-slate-900 transition-colors">해결 과제</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">작동 원리</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">주요 기능</a>
          <a href="#trust" className="hover:text-slate-900 transition-colors">신뢰 및 보안</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            로그인
          </Link>
          <Link href="/register" className="landing-btn-primary text-sm">
            지금 시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// Hero
// ============================================================================

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider mb-6">
            엔터프라이즈 PMO 솔루션
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 max-w-4xl mx-auto leading-[1.2]">
            AI는 초안을 작성하고, <br />
            <span className="text-blue-600">결정은 사람이 내립니다.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            외부 에이전시를 위한 신뢰할 수 있는 PMO 시스템. 프로젝트, 인력 및 규정 준수를 AI의 지원을 받아 관리하되, 최종 권한은 인간 전문가에게 둡니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="landing-btn-primary w-full sm:w-auto px-8 py-4 text-base">
              지금 시작하기 <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link href="/login" className="landing-btn-secondary w-full sm:w-auto px-8 py-4 text-base">
              로그인
            </Link>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="glass-card overflow-hidden shadow-2xl border-slate-300">
            <div
              className="w-full bg-slate-100 flex items-center justify-center"
              style={{ height: "450px" }}
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
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-slate-900/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Problem Statement
// ============================================================================

const painPoints = [
  {
    icon: Clock,
    title: "보고서 작성 피로도",
    desc: "주간 보고서를 위해 매주 4~6시간 동안 수동으로 데이터를 통합해야 합니다.",
  },
  {
    icon: AlertTriangle,
    title: "일관성 없는 상태 보고",
    desc: "주관적인 보고는 팀마다 일관성 없는 프로젝트 상태 지표로 이어집니다.",
  },
  {
    icon: Search,
    title: "뒤늦은 리스크 발견",
    desc: "중요한 리스크는 종종 일정에 영향을 미친 후에야 발견되곤 합니다.",
  },
];

const statusBars = [
  { label: "정상 진행", value: "65", widthClass: "w-[65%]", colorClass: "bg-emerald-500" },
  { label: "주의 필요", value: "25", widthClass: "w-[25%]", colorClass: "bg-amber-500" },
  { label: "지연 발생", value: "10", widthClass: "w-[10%]", colorClass: "bg-rose-500" },
];

function ProblemStatement() {
  return (
    <section id="problem" className="py-24 bg-slate-50 border-y border-slate-200 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">왜 기존의 PMO는 고위험 환경에서 실패할까요?</h2>
            <p className="text-lg text-slate-600 mb-8">
              외부 에이전시와 복잡한 프로젝트를 관리하는 것이 수동적인 고통이 되어서는 안 됩니다. 대부분의 팀은 동일하게 반복되는 마찰 지점으로 인해 어려움을 겪습니다.
            </p>
            <ul className="space-y-6">
              {painPoints.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-slate-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="glass-card p-8 bg-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">프로젝트 상태 분포</h3>
                <span className="text-xs font-mono text-slate-400">실시간 데이터</span>
              </div>
              <ul className="space-y-4">
                {statusBars.map((bar) => (
                  <li key={bar.label}>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span>{bar.label}</span>
                      <span>{bar.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${bar.widthClass} ${bar.colorClass} rounded-full`} role="progressbar" aria-valuenow={Number(bar.value)} aria-valuemin={0} aria-valuemax={100} aria-label={bar.label} />
                    </div>
                  </li>
                ))}
              </ul>
              <blockquote className="mt-8 pt-6 border-t border-slate-100 italic text-sm text-slate-500">
                &ldquo;예전에는 지난주에 무슨 일이 있었는지 파악하는 데만 월요일 오전 내내 보냈습니다. 이제는 이미 작성된 초안과 함께 월요일을 시작합니다.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// How It Works
// ============================================================================

const workflowSteps = [
  {
    icon: BarChart3,
    step: "01",
    title: "데이터 수집",
    desc: "프로젝트, 인력 및 근태 데이터를 통합합니다.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "로직 분석",
    desc: "규칙 기반 로직을 적용하여 이상 징후와 트렌드를 감지합니다.",
  },
  {
    icon: FileText,
    step: "03",
    title: "AI 초안 생성",
    desc: "에이전트가 시스템 활동 데이터를 기반으로 보고서 초안을 생성합니다.",
  },
  {
    icon: UserCheck,
    step: "04",
    title: "사람의 검토",
    desc: "PMO 리드가 내용을 검토, 조정 및 최종 승인합니다.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Nexus 워크플로우</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          프로젝트 인텔리전스를 위한 구조화된 접근 방식입니다. AI가 힘든 일을 처리하고, 당신은 최종 서명을 제공합니다.
        </p>
      </div>
      <div className="max-w-5xl mx-auto">
        <ol className="grid md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-slate-200 -translate-y-1/2 z-0" aria-hidden="true" />
          {workflowSteps.map((item) => (
            <li key={item.step} className="relative z-10 bg-white p-6 rounded-xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="text-xs font-bold text-blue-600 mb-1">{item.step}</div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ============================================================================
// Features
// ============================================================================

const featureList = [
  {
    icon: Users,
    title: "인력 관리",
    desc: "근태, 리소스 할당 및 에이전시 성과를 실시간으로 추적합니다.",
  },
  {
    icon: Cpu,
    title: "주간 보고 에이전트",
    desc: "실제 시스템 활동 데이터를 기반으로 상태 보고서를 자동 초안화합니다.",
  },
  {
    icon: History,
    title: "리스크 및 변경 이력",
    desc: "완전한 감사 가능성을 위해 모든 프로젝트 리스크와 범위 변경을 타임라인으로 기록합니다.",
  },
  {
    icon: ShieldCheck,
    title: "감사 로그 및 추적성",
    desc: "모든 결정, 수정 및 승인 사항은 영구적인 타임스탬프와 함께 기록됩니다.",
  },
];

function Features() {
  return (
    <section id="features" className="py-24 bg-slate-900 text-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-4">핵심 기능</h2>
            <p className="text-slate-400">
              엔터프라이즈 고객을 위해 높은 수준의 투명성과 책임성을 유지해야 하는 에이전시를 위해 설계되었습니다.
            </p>
          </div>
        </div>
        <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((feature) => (
            <li
              key={feature.title}
              className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-500 transition-colors"
            >
              <feature.icon className="w-8 h-8 text-blue-400 mb-6" aria-hidden="true" />
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ============================================================================
// Trust Section
// ============================================================================

const trustItems = [
  "AI 출력물에 데이터 소스 인용 포함",
  "모든 자동화된 작업에 사람의 승인 필요",
  "모든 보고서 초안에 대한 전체 버전 이력 관리",
  "각 프로젝트를 위한 엔터프라이즈급 데이터 격리",
];

const metrics = [
  { value: "100%", label: "추적성 보장" },
  { value: "No-Code", label: "로직 엔진" },
  { value: "SOC2", label: "컴플라이언스 준비" },
  { value: "API", label: "우선 아키텍처" },
];

function TrustSection() {
  return (
    <section id="trust" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-12 bg-slate-50 border-slate-200">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">책임감을 위한 설계</h2>
              <p className="text-slate-600 mb-8">
                B2B 환경에서 &ldquo;블랙박스&rdquo; AI는 리스크입니다. Nexus는 설명 가능한 인텔리전스 원칙에 따라 구축되었습니다.
              </p>
              <ul className="space-y-4">
                {trustItems.map((text) => (
                  <li key={text} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA Section
// ============================================================================

function CtaSection() {
  return (
    <section className="py-24 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-6">PMO의 구조를 잡을 준비가 되셨나요?</h2>
        <p className="text-xl text-slate-600 mb-10">
          수동적인 업무 부담 없이 고품질의 프로젝트 인텔리전스를 제공하기 위해 Nexus를 사용하는 선도적인 에이전시들과 함께하세요.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="landing-btn-primary px-10 py-4 text-lg">
            지금 시작하기
          </Link>
          <Link href="/login" className="landing-btn-secondary px-10 py-4 text-lg">
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Footer
// ============================================================================

const footerLinks = [
  { label: "개인정보 처리방침", href: "#" },
  { label: "이용 약관", href: "#" },
  { label: "문서", href: "#" },
  { label: "고객 지원", href: "#" },
];

function Footer() {
  return (
    <footer className="py-12 border-t border-slate-200 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
            <LayoutDashboard className="text-white w-4 h-4" aria-hidden="true" />
          </div>
          <span className="font-bold text-lg tracking-tight">Nexus PMO</span>
        </div>
        <nav aria-label="푸터 메뉴">
          <ul className="flex gap-8 text-sm text-slate-500">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-slate-900 transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-sm text-slate-400 font-mono">© 2026 Nexus Systems Inc.</p>
      </div>
    </footer>
  );
}

// ============================================================================
// Page (Server Component)
// ============================================================================

export default function LandingPage() {
  return (
    <div className="landing-root min-h-screen bg-white text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <ProblemStatement />
        <HowItWorks />
        <Features />
        <TrustSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
