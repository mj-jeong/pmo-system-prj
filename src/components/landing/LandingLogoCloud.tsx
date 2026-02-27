const brands = ["Google", "Microsoft", "Adobe", "Slack", "Figma", "Notion"];

export function LandingLogoCloud() {
  return (
    <section className="py-20 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-12">
          전 세계 500개 이상의 선도적인 에이전시가 신뢰합니다
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
          {brands.map((brand) => (
            <span key={brand} className="text-2xl font-black text-slate-900 tracking-tighter">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
