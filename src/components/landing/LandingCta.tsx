import Link from "next/link";

export function LandingCta() {
  return (
    <section className="py-40 px-6 text-center relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-blue-600/5 rounded-full blur-[120px] -z-10"
        aria-hidden="true"
      />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
          지금 바로 PMO의 미래를 경험하세요.
        </h2>
        <p className="text-2xl text-slate-500 mb-12 font-medium leading-relaxed">
          수동적인 업무에서 벗어나, 데이터 기반의 스마트한 프로젝트 관리를 시작할 때입니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/register" className="landing-btn-primary-lg w-full sm:w-auto">
            무료로 시작하기
          </Link>
          <Link href="/login" className="landing-btn-secondary-lg w-full sm:w-auto">
            영업팀에 문의하기
          </Link>
        </div>
        <p className="mt-10 text-slate-400 font-medium">
          별도의 신용카드 등록이 필요 없습니다. 14일간 모든 기능을 무료로 체험하세요.
        </p>
      </div>
    </section>
  );
}
