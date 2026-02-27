import { CheckCircle2, Lock, Globe, UserCheck, BarChart3 } from "lucide-react";

const trustItems = [
  { icon: Lock, title: "데이터 암호화", desc: "모든 데이터는 전송 및 저장 시 강력하게 암호화됩니다." },
  { icon: Globe, title: "글로벌 표준 준수", desc: "GDPR, SOC2 등 글로벌 보안 표준을 준수합니다." },
  { icon: UserCheck, title: "권한 세분화", desc: "프로젝트별, 역할별로 정교한 권한 관리가 가능합니다." },
  { icon: BarChart3, title: "투명한 리포팅", desc: "모든 AI 분석의 근거 데이터를 즉시 확인할 수 있습니다." },
];

export function LandingTrust() {
  return (
    <section id="trust" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-50 rounded-[64px] p-16 md:p-24 border border-slate-200 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent -z-10"
            aria-hidden="true"
          />

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: text + trust items */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
                신뢰할 수 있는 시스템, <br />검증된 프로세스.
              </h2>
              <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">
                Nexus는 단순한 소프트웨어가 아닙니다. 비즈니스의 연속성과 데이터의 무결성을 보장하는 가장 강력한
                파트너입니다.
              </p>

              <div className="grid sm:grid-cols-2 gap-8">
                {trustItems.map((item) => (
                  <div key={item.title}>
                    <item.icon className="w-6 h-6 text-blue-600 mb-4" aria-hidden="true" />
                    <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: testimonial + satisfaction card */}
            <div className="space-y-6">
              {/* Testimonial card */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>
                <blockquote className="text-slate-700 font-medium leading-relaxed italic mb-6">
                  &ldquo;Nexus 도입 후 주간 보고 업무 시간이 70% 단축되었습니다. 이제 우리 팀은 보고서 작성이 아니라,
                  실제 프로젝트 리스크를 해결하는 데 집중합니다.&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    KL
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">김철수 상무</div>
                    <div className="text-sm text-slate-500">글로벌 에이전시 A사 PMO 총괄</div>
                  </div>
                </div>
              </div>

              {/* 98% satisfaction card */}
              <div className="bg-blue-600 p-8 rounded-3xl shadow-xl text-white">
                <div className="text-4xl font-black mb-2">98%</div>
                <div className="font-bold text-blue-100 mb-3">고객 만족도 및 재계약률</div>
                <p className="text-blue-100 text-sm font-medium">
                  Nexus를 도입한 기업의 98%가 프로젝트 관리 효율성이 크게 향상되었다고 응답했습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
