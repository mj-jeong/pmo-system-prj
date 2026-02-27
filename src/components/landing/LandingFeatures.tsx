import { Users, FileText, History, ShieldCheck } from "lucide-react";

const featureList = [
  {
    icon: Users,
    title: "통합 인력 매니지먼트",
    desc: "에이전시 내부 인력뿐만 아니라 외부 파트너사까지 한눈에 관리하세요. 근태와 리소스 투입 현황을 실시간으로 파악합니다.",
    tag: "인력 관리",
  },
  {
    icon: FileText,
    title: "AI 주간 보고서 자동화",
    desc: "매주 월요일 아침, 지난주 데이터를 분석한 완벽한 보고서 초안이 준비됩니다. 당신은 검토하고 승인만 하면 됩니다.",
    tag: "자동화",
  },
  {
    icon: History,
    title: "투명한 변경 이력 추적",
    desc: "프로젝트의 모든 의사결정과 변경 사항을 타임라인으로 기록합니다. 나중에 문제가 생겨도 원인을 즉시 파악할 수 있습니다.",
    tag: "추적성",
  },
  {
    icon: ShieldCheck,
    title: "엔터프라이즈급 보안",
    desc: "데이터 격리, 역할 기반 접근 제어(RBAC), 상세 감사 로그를 통해 가장 엄격한 보안 요구사항을 충족합니다.",
    tag: "보안",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-32 px-6 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">강력한 엔터프라이즈 기능</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            단순한 관리를 넘어, 비즈니스 성장을 가속화하는 핵심 엔진입니다.
          </p>
        </div>

        <ul className="grid md:grid-cols-2 gap-8">
          {featureList.map((feature) => (
            <li
              key={feature.title}
              className="group p-10 rounded-[40px] bg-slate-800/40 border border-slate-700 hover:bg-slate-800/60 transition-all"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                  <feature.icon className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <span className="px-4 py-1.5 bg-slate-700 rounded-full text-[12px] font-bold uppercase tracking-wider text-slate-300">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
