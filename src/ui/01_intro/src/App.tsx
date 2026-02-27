/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  BarChart3, 
  ShieldCheck, 
  Users, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Github, 
  Clock, 
  AlertTriangle, 
  History, 
  Search,
  Cpu,
  UserCheck,
  LayoutDashboard,
  Zap,
  Lock,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-200">
          <LayoutDashboard className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">Nexus PMO</span>
      </div>
      <div className="hidden lg:flex items-center gap-10 text-[15px] font-medium text-slate-500">
        <a href="#problem" className="hover:text-slate-900 transition-colors">해결 과제</a>
        <a href="#how-it-works" className="hover:text-slate-900 transition-colors">작동 원리</a>
        <a href="#features" className="hover:text-slate-900 transition-colors">주요 기능</a>
        <a href="#trust" className="hover:text-slate-900 transition-colors">신뢰 및 보안</a>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-[15px] font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">로그인</button>
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[15px] font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-200">
          데모 보기
        </button>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative pt-40 pb-24 px-6 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-[150px]" />
    </div>
    
    <div className="max-w-7xl mx-auto text-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[13px] font-semibold rounded-full mb-8 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          <span>엔터프라이즈를 위한 차세대 PMO 시스템</span>
        </div>
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-8 tracking-tight leading-[1.05]">
          AI는 초안을 쓰고, <br />
          <span className="text-blue-600">결정은 사람이 합니다.</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
          에이전시의 복잡한 프로젝트 관리를 혁신합니다. <br className="hidden md:block" />
          AI가 데이터를 분석하고 보고서를 제안하면, 전문가는 승인만 하세요.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
          <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl text-lg font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group">
            무료 데모 시작하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Github className="w-5 h-5" /> GitHub 저장소
          </button>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-6xl"
      >
        <div className="p-3 bg-white/50 backdrop-blur-sm rounded-[32px] border border-slate-200 shadow-2xl">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
            <img 
              src="https://picsum.photos/seed/pmo-app/1600/900" 
              alt="Nexus PMO 대시보드" 
              className="w-full h-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        {/* Floating elements */}
        <div className="absolute -top-10 -left-10 hidden xl:block">
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">보고서 자동 생성 완료</div>
              <div className="text-xs text-slate-500">방금 전 AI 에이전트가 작성</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const LogoCloud = () => (
  <section className="py-20 border-y border-slate-100">
    <div className="max-w-7xl mx-auto px-6">
      <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-12">전 세계 500개 이상의 선도적인 에이전시가 신뢰합니다</p>
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
        {['Google', 'Microsoft', 'Adobe', 'Slack', 'Figma', 'Notion'].map((brand) => (
          <span key={brand} className="text-2xl font-black text-slate-900 tracking-tighter">{brand}</span>
        ))}
      </div>
    </div>
  </section>
);

const ProblemSection = () => (
  <section id="problem" className="py-32 px-6 bg-slate-50">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">수동적인 PMO의 한계를 넘어서</h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">기존의 방식으로는 더 이상 복잡해지는 프로젝트 속도를 따라갈 수 없습니다.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { 
            icon: Clock, 
            title: "비효율적인 보고 체계", 
            desc: "매주 반복되는 데이터 취합과 보고서 작성에 실무자의 시간 40%가 낭비됩니다.",
            color: "text-blue-600",
            bg: "bg-blue-50"
          },
          { 
            icon: AlertTriangle, 
            title: "파편화된 리스크 관리", 
            desc: "중요한 이슈가 담당자 개인의 메신저나 이메일에 갇혀 전사 공유가 늦어집니다.",
            color: "text-amber-600",
            bg: "bg-amber-50"
          },
          { 
            icon: Search, 
            title: "데이터 기반 의사결정 부재", 
            desc: "정확한 실시간 데이터가 아닌 주관적인 판단에 의존하여 프로젝트 방향을 결정합니다.",
            color: "text-rose-600",
            bg: "bg-rose-50"
          }
        ].map((item, i) => (
          <div key={i} className="p-10 bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-8`}>
              <item.icon className={`w-8 h-8 ${item.color}`} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="how-it-works" className="py-32 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">AI가 돕고, <br />사람이 완성합니다.</h2>
          <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">
            Nexus는 AI가 인간을 대체하는 것이 아니라, 인간의 의사결정을 더 빠르고 정확하게 할 수 있도록 돕는 도구입니다.
          </p>
          
          <div className="space-y-10">
            {[
              { step: "01", title: "데이터 자동 수집", desc: "근태, 프로젝트 진행률, 리소스 현황을 실시간으로 통합합니다." },
              { step: "02", title: "지능형 분석", desc: "수집된 데이터를 바탕으로 AI가 잠재적 리스크와 트렌드를 분석합니다." },
              { step: "03", title: "보고서 초안 제안", desc: "분석 결과를 바탕으로 주간/월간 보고서 초안을 즉시 생성합니다." },
              { step: "04", title: "최종 검토 및 승인", desc: "전문가가 내용을 확인하고 수정하여 최종 승인합니다." }
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="text-2xl font-black text-blue-600/20 font-mono">{item.step}</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-500 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative">
          <div className="aspect-square bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl flex items-center justify-center p-12">
            <div className="w-full space-y-6">
              <div className="h-4 w-3/4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '75%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-blue-500" 
                />
              </div>
              <div className="h-4 w-1/2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '45%' }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                  className="h-full bg-indigo-500" 
                />
              </div>
              <div className="h-4 w-5/6 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '85%' }}
                  transition={{ duration: 1.5, delay: 0.9 }}
                  className="h-full bg-emerald-500" 
                />
              </div>
              <div className="pt-8 flex justify-center">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                  <Cpu className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                  <div className="text-white font-bold">AI 분석 엔진 가동 중</div>
                  <div className="text-slate-400 text-xs mt-1">실시간 리스크 감지 활성화</div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] -z-10" />
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" className="py-32 px-6 bg-slate-900 text-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">강력한 엔터프라이즈 기능</h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">단순한 관리를 넘어, 비즈니스 성장을 가속화하는 핵심 엔진입니다.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { 
            icon: Users, 
            title: "통합 인력 매니지먼트", 
            desc: "에이전시 내부 인력뿐만 아니라 외부 파트너사까지 한눈에 관리하세요. 근태와 리소스 투입 현황을 실시간으로 파악합니다.",
            tag: "인력 관리"
          },
          { 
            icon: FileText, 
            title: "AI 주간 보고서 자동화", 
            desc: "매주 월요일 아침, 지난주 데이터를 분석한 완벽한 보고서 초안이 준비됩니다. 당신은 검토하고 승인만 하면 됩니다.",
            tag: "자동화"
          },
          { 
            icon: History, 
            title: "투명한 변경 이력 추적", 
            desc: "프로젝트의 모든 의사결정과 변경 사항을 타임라인으로 기록합니다. 나중에 문제가 생겨도 원인을 즉시 파악할 수 있습니다.",
            tag: "추적성"
          },
          { 
            icon: ShieldCheck, 
            title: "엔터프라이즈급 보안", 
            desc: "데이터 격리, 역할 기반 접근 제어(RBAC), 상세 감사 로그를 통해 가장 엄격한 보안 요구사항을 충족합니다.",
            tag: "보안"
          }
        ].map((feature, i) => (
          <div key={i} className="group p-10 rounded-[40px] bg-slate-800/40 border border-slate-700 hover:bg-slate-800/60 transition-all">
            <div className="flex justify-between items-start mb-10">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <span className="px-4 py-1.5 bg-slate-700 rounded-full text-[12px] font-bold uppercase tracking-wider text-slate-300">{feature.tag}</span>
            </div>
            <h4 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{feature.title}</h4>
            <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TrustSection = () => (
  <section id="trust" className="py-32 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-slate-50 rounded-[64px] p-16 md:p-24 border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent -z-10" />
        
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">신뢰할 수 있는 시스템, <br />검증된 프로세스.</h2>
            <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">
              Nexus는 단순한 소프트웨어가 아닙니다. 비즈니스의 연속성과 데이터의 무결성을 보장하는 가장 강력한 파트너입니다.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: Lock, title: "데이터 암호화", desc: "모든 데이터는 전송 및 저장 시 강력하게 암호화됩니다." },
                { icon: Globe, title: "글로벌 표준 준수", desc: "GDPR, SOC2 등 글로벌 보안 표준을 준수합니다." },
                { icon: UserCheck, title: "권한 세분화", desc: "프로젝트별, 역할별로 정교한 권한 관리가 가능합니다." },
                { icon: BarChart3, title: "투명한 리포팅", desc: "모든 AI 분석의 근거 데이터를 즉시 확인할 수 있습니다." }
              ].map((item, i) => (
                <div key={i}>
                  <item.icon className="w-6 h-6 text-blue-600 mb-4" />
                  <h5 className="font-bold text-slate-900 mb-2">{item.title}</h5>
                  <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-full" />
                <div>
                  <div className="font-bold text-slate-900">김철수 상무</div>
                  <div className="text-sm text-slate-500">글로벌 에이전시 A사 PMO 총괄</div>
                </div>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed italic">
                "Nexus 도입 후 주간 보고 업무 시간이 70% 단축되었습니다. 이제 우리 팀은 보고서 작성이 아니라, 실제 프로젝트 리스크를 해결하는 데 집중합니다."
              </p>
            </div>
            <div className="bg-blue-600 p-8 rounded-3xl shadow-xl text-white">
              <div className="text-4xl font-black mb-2">98%</div>
              <div className="font-bold text-blue-100">고객 만족도 및 재계약률</div>
              <p className="mt-4 text-blue-100 text-sm font-medium">Nexus를 도입한 기업의 98%가 프로젝트 관리 효율성이 크게 향상되었다고 응답했습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-20 border-t border-slate-100 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Nexus PMO</span>
          </div>
          <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
            AI 기반의 차세대 PMO 시스템으로 에이전시의 프로젝트 관리를 혁신합니다. <br />
            구조화된 데이터와 지능형 분석으로 더 나은 의사결정을 지원합니다.
          </p>
        </div>
        <div>
          <h5 className="font-bold text-slate-900 mb-6">제품</h5>
          <ul className="space-y-4 text-slate-500 font-medium">
            <li><a href="#" className="hover:text-slate-900 transition-colors">기능 소개</a></li>
            <li><a href="#" className="hover:text-slate-900 transition-colors">요금제</a></li>
            <li><a href="#" className="hover:text-slate-900 transition-colors">보안</a></li>
            <li><a href="#" className="hover:text-slate-900 transition-colors">업데이트 소식</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-slate-900 mb-6">회사</h5>
          <ul className="space-y-4 text-slate-500 font-medium">
            <li><a href="#" className="hover:text-slate-900 transition-colors">회사 소개</a></li>
            <li><a href="#" className="hover:text-slate-900 transition-colors">채용 정보</a></li>
            <li><a href="#" className="hover:text-slate-900 transition-colors">블로그</a></li>
            <li><a href="#" className="hover:text-slate-900 transition-colors">문의하기</a></li>
          </ul>
        </div>
      </div>
      <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-slate-400 text-sm font-medium">© 2026 Nexus Systems Inc. All rights reserved.</div>
        <div className="flex gap-8 text-slate-400 text-sm font-medium">
          <a href="#" className="hover:text-slate-900 transition-colors">개인정보 처리방침</a>
          <a href="#" className="hover:text-slate-900 transition-colors">이용 약관</a>
          <a href="#" className="hover:text-slate-900 transition-colors">쿠키 설정</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <TrustSection />
        
        <section className="py-40 px-6 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-blue-600/5 rounded-full blur-[120px] -z-10" />
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tight">지금 바로 PMO의 미래를 경험하세요.</h2>
            <p className="text-2xl text-slate-500 mb-12 font-medium leading-relaxed">
              수동적인 업무에서 벗어나, 데이터 기반의 스마트한 프로젝트 관리를 시작할 때입니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white rounded-3xl text-xl font-bold hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200">
                무료로 시작하기
              </button>
              <button className="w-full sm:w-auto px-12 py-6 bg-white border border-slate-200 text-slate-700 rounded-3xl text-xl font-bold hover:bg-slate-50 transition-all">
                영업팀에 문의하기
              </button>
            </div>
            <p className="mt-10 text-slate-400 font-medium">별도의 신용카드 등록이 필요 없습니다. 14일간 모든 기능을 무료로 체험하세요.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
