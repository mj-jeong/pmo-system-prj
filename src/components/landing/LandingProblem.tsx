import { Clock, AlertTriangle, Search } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "비효율적인 보고 체계",
    desc: "매주 반복되는 데이터 취합과 보고서 작성에 실무자의 시간 40%가 낭비됩니다.",
  },
  {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "파편화된 리스크 관리",
    desc: "중요한 이슈가 담당자 개인의 메신저나 이메일에 갇혀 전사 공유가 늦어집니다.",
  },
  {
    icon: Search,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    title: "데이터 기반 의사결정 부재",
    desc: "정확한 실시간 데이터가 아닌 주관적인 판단에 의존하여 프로젝트 방향을 결정합니다.",
  },
];

export function LandingProblem() {
  return (
    <section id="problem" className="py-32 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            수동적인 PMO의 한계를 넘어서
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            기존의 방식으로는 더 이상 복잡해지는 프로젝트 속도를 따라갈 수 없습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((item) => (
            <div
              key={item.title}
              className="p-10 bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-16 h-16 ${item.iconBg} rounded-2xl flex items-center justify-center mb-8`}>
                <item.icon className={`w-8 h-8 ${item.iconColor}`} aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
