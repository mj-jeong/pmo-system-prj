import { Cpu } from "lucide-react";

const workflowSteps = [
  {
    step: "01",
    title: "데이터 자동 수집",
    desc: "근태, 프로젝트 진행률, 리소스 현황을 실시간으로 통합합니다.",
  },
  {
    step: "02",
    title: "지능형 분석",
    desc: "수집된 데이터를 바탕으로 AI가 잠재적 리스크와 트렌드를 분석합니다.",
  },
  {
    step: "03",
    title: "보고서 초안 제안",
    desc: "분석 결과를 바탕으로 주간/월간 보고서 초안을 즉시 생성합니다.",
  },
  {
    step: "04",
    title: "최종 검토 및 승인",
    desc: "전문가가 내용을 확인하고 수정하여 최종 승인합니다.",
  },
];

const statusBars = [
  { label: "정상 진행", value: 75, colorClass: "bg-blue-500" },
  { label: "주의 필요", value: 45, colorClass: "bg-indigo-500" },
  { label: "완료율", value: 85, colorClass: "bg-emerald-500" },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Left: steps */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
              AI가 돕고, <br />사람이 완성합니다.
            </h2>
            <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">
              Nexus는 AI가 인간을 대체하는 것이 아니라, 인간의 의사결정을 더 빠르고 정확하게 할 수 있도록 돕는 도구입니다.
            </p>

            <ol className="space-y-10">
              {workflowSteps.map((item) => (
                <li key={item.step} className="flex gap-6">
                  <div className="text-2xl font-black text-blue-600/20 font-mono flex-shrink-0">{item.step}</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Right: dark card with progress bars */}
          <div className="relative">
            <div className="aspect-square bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl flex items-center justify-center p-12">
              <div className="w-full space-y-6">
                {statusBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-200">{bar.label}</span>
                      <span className="text-slate-400 font-mono">{bar.value}%</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${bar.colorClass} rounded-full animate-progress-fill`}
                        style={{ "--progress-target": `${bar.value}%` } as React.CSSProperties}
                        role="progressbar"
                        aria-valuenow={bar.value}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={bar.label}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-8 flex justify-center">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                    <Cpu className="w-10 h-10 text-blue-400 mx-auto mb-4" aria-hidden="true" />
                    <div className="text-white font-bold">AI 분석 엔진 가동 중</div>
                    <div className="text-slate-400 text-xs mt-1">실시간 리스크 감지 활성화</div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] -z-10"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
