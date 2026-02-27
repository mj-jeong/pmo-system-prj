import { LayoutDashboard } from "lucide-react";

const footerProduct = [
  { label: "기능 소개", href: "#features" },
  { label: "요금제", href: "#" },
  { label: "보안", href: "#trust" },
  { label: "업데이트 소식", href: "#" },
];

const footerCompany = [
  { label: "회사 소개", href: "#" },
  { label: "채용 정보", href: "#" },
  { label: "블로그", href: "#" },
  { label: "문의하기", href: "#" },
];

const footerLegal = [
  { label: "개인정보 처리방침", href: "#" },
  { label: "이용 약관", href: "#" },
  { label: "쿠키 설정", href: "#" },
];

export function LandingFooter() {
  return (
    <footer className="py-20 border-t border-slate-100 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="text-white w-4 h-4" aria-hidden="true" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Nexus PMO</span>
            </div>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
              AI 기반의 차세대 PMO 시스템으로 에이전시의 프로젝트 관리를 혁신합니다.{" "}
              <br />
              구조화된 데이터와 지능형 분석으로 더 나은 의사결정을 지원합니다.
            </p>
          </div>

          <nav aria-label="제품 메뉴">
            <h2 className="font-bold text-slate-900 mb-6">제품</h2>
            <ul className="space-y-4 text-slate-500 font-medium">
              {footerProduct.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-slate-900 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="회사 메뉴">
            <h2 className="font-bold text-slate-900 mb-6">회사</h2>
            <ul className="space-y-4 text-slate-500 font-medium">
              {footerCompany.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-slate-900 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm font-medium">© 2026 Nexus Systems Inc. All rights reserved.</p>
          <nav aria-label="법적 고지 메뉴">
            <ul className="flex gap-8 text-slate-400 text-sm font-medium">
              {footerLegal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-slate-900 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
