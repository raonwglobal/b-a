'use client';
import { useState, useEffect, useRef } from 'react';

type Lang = 'KR' | 'EN' | 'VI' | 'JP';

const content = {
  KR: {
    eyebrow: "VIETNAM BUSINESS EXECUTION PLATFORM",
    heroTitle: "베트남 진출의 모든 과정을\n하나의 파트너와 함께",
    heroSub: "법인설립, 거래·M&A, 산업별 현지화, 보안·준법, 현지 운영을 통합 지원합니다. 시장조사부터 사업 실행과 운영관리까지 복잡한 절차를 체계적으로 연결해 빠르고 안전한 베트남 사업 진입을 지원합니다.",
    heroCTA1: "실행 상담하기",
    heroCTA2: "서비스 상품 보기",
    nav: ["서비스","거래·M&A","산업별","보안·준법","운영지원","절차"],
    servicesEyebrow: "주요 서비스",
    servicesTitle: "진출부터 운영까지, 하나의 프로젝트로",
  },
  EN: {
    eyebrow: "VIETNAM BUSINESS EXECUTION PLATFORM",
    heroTitle: "Your Entire Vietnam Entry\nWith One Execution Partner",
    heroSub: "From incorporation and M&A to localization, compliance and operations. We connect complex steps into one systematic flow for fast and secure market entry.",
    heroCTA1: "Start Execution Call",
    heroCTA2: "View Service Plans",
    nav: ["Services","Deals","Industries","Security","Operations","Process"],
    servicesEyebrow: "CORE SERVICES",
    servicesTitle: "From entry to operations as one project",
  },
  VI: {
    eyebrow: "VIETNAM BUSINESS EXECUTION PLATFORM",
    heroTitle: "Toàn bộ hành trình vào\nViệt Nam cùng một đối tác",
    heroSub: "Hỗ trợ tích hợp thành lập pháp nhân, M&A, bản địa hóa theo ngành, bảo mật/tuân thủ và vận hành. Kết nối hệ thống từ nghiên cứu đến thực thi.",
    heroCTA1: "Tư vấn thực thi",
    heroCTA2: "Xem gói dịch vụ",
    nav: ["Dịch vụ","M&A","Ngành","Bảo mật","Vận hành","Quy trình"],
    servicesEyebrow: "DỊCH VỤ CHÍNH",
    servicesTitle: "Từ gia nhập đến vận hành trong một dự án",
  },
  JP: {
    eyebrow: "VIETNAM BUSINESS EXECUTION PLATFORM",
    heroTitle: "ベトナム進出の全工程を\n一つのパートナーと共に",
    heroSub: "法人設立、M&A、産業別ローカライズ、セキュリティ・コンプライアンス、現地運営を統合支援。調査から実行・運用までを体系的に接続します。",
    heroCTA1: "実行相談する",
    heroCTA2: "サービスプランを見る",
    nav: ["サービス","取引·M&A","産業別","セキュリティ","運営支援","手順"],
    servicesEyebrow: "主要サービス",
    servicesTitle: "進出から運営まで一つのプロジェクトとして",
  }
};

export default function App() {
  const [lang, setLang] = useState<Lang>('KR');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [showInquiryPreview, setShowInquiryPreview] = useState(false);
  const [form, setForm] = useState({ company: '', name: '', email: '', industry: '', scale: '', region: '', need: '' });

  const t = content[lang];

  // scroll spy for services
  const serviceRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          const idx = Number((e.target as HTMLElement).dataset.idx);
          setActiveService(idx);
        }
      })
    }, { rootMargin: "-40% 0px -50% 0px"});
    serviceRefs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F5EB] text-[#101828] antialiased selection:bg-[#16A34A]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        *{font-family: 'Geist','Noto Sans KR',system-ui,sans-serif}
        html{scroll-behavior:smooth; scroll-padding-top: 88px;}
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] supports-[backdrop-filter]:bg-white/80" style={{top: 'var(--safe-area-inset-top,0px)', paddingTop: 'var(--safe-area-inset-top,0px)'}}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2.5">
              <div className="h-7 w-11 rounded-[8px] bg-[#101828] text-white flex items-center justify-center text-[13px] font-bold tracking-[-0.02em]">b/a</div>
              <span className="hidden sm:block text-[11px] leading-[1.1] font-medium tracking-wide text-[#475467] uppercase">Vietnam<br/>Execution Platform</span>
            </a>
            <nav className="hidden lg:flex items-center gap-1">
              {t.nav.map((n,i) => {
                const ids = ['svc','deal','industry','security','operation','process'];
                return (
                  <button key={n} onClick={()=>scrollTo(ids[i])} className="px-3 py-2 rounded-full text-[13.5px] font-medium text-[#344054] hover:bg-[#F3F4F6] hover:text-[#101828] transition">{n}</button>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center rounded-full bg-[#F3F4F6] p-1">
              {(["KR","EN","VI","JP"] as Lang[]).map(l => (
                <button key={l} onClick={()=>setLang(l)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition ${lang===l ? 'bg-[#101828] text-white' : 'text-[#667085] hover:text-[#101828]'}`}>{l}</button>
              ))}
            </div>
            <button onClick={()=>scrollTo('inquiry')} className="hidden sm:inline-flex h-9 px-4 rounded-full bg-[#16A34A] hover:bg-[#14532D] text-white text-[13.5px] font-semibold transition items-center gap-1.5">
              {t.heroCTA1} <span className="text-[16px] leading-none">↗</span>
            </button>
            <button onClick={()=>setMobileMenu(!mobileMenu)} className="lg:hidden h-9 w-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#101828]">☰</button>
          </div>
        </div>
        {mobileMenu && (
          <div className="lg:hidden border-t border-black/5 bg-white px-5 py-4 space-y-1">
            {t.nav.map((n,i)=>{
              const ids = ['svc','deal','industry','security','operation','process'];
              return <button key={n} onClick={()=>scrollTo(ids[i])} className="w-full text-left px-3 py-2.5 rounded-xl bg-[#F9FAFB] text-[14px] font-medium">{n}</button>
            })}
            <div className="flex gap-1 pt-2">
              {(["KR","EN","VI","JP"] as Lang[]).map(l => (
                <button key={l} onClick={()=>setLang(l)} className={`flex-1 py-2 rounded-full text-[12px] font-bold ${lang===l ? 'bg-[#101828] text-white' : 'bg-[#F3F4F6]'}`}>{l}</button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="bg-[#101828] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1D2939] to-[#101828]"/>
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[80%] rounded-full bg-[#16A34A]/[0.12] blur-[90px]"/>
          <div className="absolute top-[20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-[#F59E0B]/[0.08] blur-[80px]"/>
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '48px 48px'}}/>
        </div>

        <div className="relative mx-auto max-w-[1280px] px-5 lg:px-8 py-[56px] lg:py-[84px] grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] tracking-[0.14em] font-medium text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse"/>
              {t.eyebrow}
            </div>
            <h1 className="mt-6 text-[32px] lg:text-[52px] font-bold leading-[1.05] tracking-[-0.03em] whitespace-pre-line">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-[56ch] text-[15.5px] lg:text-[17px] leading-[1.7] text-white/70">
              {t.heroSub}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={()=>scrollTo('inquiry')} className="h-[48px] px-6 rounded-full bg-[#16A34A] hover:bg-[#22C55E] text-white font-semibold text-[14.5px] transition inline-flex items-center gap-2">
                {t.heroCTA1} <span>→</span>
              </button>
              <button onClick={()=>scrollTo('plans')} className="h-[48px] px-6 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium text-[14.5px] transition">
                {t.heroCTA2}
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-[520px] border-t border-white/10 pt-6">
              {[
                {k:"검증 기반", v:"사업성·권리·재무 단계별 확인"},
                {k:"통합 PMO", v:"조사·설립·거래·운영 연결"},
                {k:"지속 운영", v:"법인 설립 이후까지 관리"},
              ].map(item=>(
                <div key={item.k}>
                  <div className="text-[12px] font-semibold tracking-wide text-[#22C55E]">{item.k}</div>
                  <div className="mt-1 text-[12.5px] leading-[1.4] text-white/60">{item.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DIAGRAM */}
          <div className="relative lg:pl-8">
            <div className="relative mx-auto w-full max-w-[440px] aspect-[1/0.95] rounded-[28px] bg-[#1D2939] border border-white/10 p-6 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]">
              {/* grid */}
              <div className="absolute inset-0 rounded-[28px] opacity-[0.06]" style={{backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '28px 28px'}}/>
              {/* center */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="h-[86px] w-[86px] rounded-[20px] bg-white text-[#101828] flex flex-col items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-black/5">
                  <span className="text-[22px] font-black tracking-tight">[ b/a ]</span>
                  <span className="text-[9px] font-bold tracking-[0.18em] opacity-60 -mt-1">EXECUTION</span>
                </div>
              </div>
              {/* nodes */}
              {[
                {label:"법인설립", sub:"Incorporation", angle:-90, color:"bg-[#16A34A]"},
                {label:"거래·M&A", sub:"Transaction", angle:-18, color:"bg-[#F59E0B]"},
                {label:"현지화", sub:"Localization", angle:54, color:"bg-[#3B82F6]"},
                {label:"보안·준법", sub:"Security", angle:126, color:"bg-[#8B5CF6]"},
                {label:"운영지원", sub:"Operations", angle:198, color:"bg-[#F3F4F6] text-[#101828]"},
              ].map((node)=>{
                const r = 138;
                const rad = (node.angle * Math.PI)/180;
                const x = Math.cos(rad)*r;
                const y = Math.sin(rad)*r;
                return (
                  <div key={node.label} className="absolute left-1/2 top-1/2" style={{transform:`translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`}}>
                    {/* connector */}
                    <div className="absolute left-1/2 top-1/2 h-[1px] w-[68px] bg-gradient-to-r from-white/20 to-transparent origin-left -z-10" style={{transform:`translate(-50%,-50%) rotate(${node.angle+180}deg)`}}/>
                    <div className={`rounded-[14px] px-3 py-2.5 min-w-[92px] border border-white/10 shadow-lg text-center ${node.color.includes('text') ? node.color : `${node.color} text-white`}`}>
                      <div className="text-[12px] font-bold leading-none">{node.label}</div>
                      <div className={`text-[9px] font-medium tracking-wide mt-1 ${node.color.includes('text') ? 'text-black/50' : 'text-white/70'}`}>{node.sub}</div>
                    </div>
                  </div>
                )
              })}
              <div className="absolute bottom-3 left-3 right-3 rounded-[14px] bg-[#101828] border border-white/10 px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse"/>
                  <span className="text-[11px] text-white/70 font-medium tracking-wide">LIVE PROJECT SYNC</span>
                </div>
                <span className="text-[11px] text-white/40 font-mono">PMO • VDR • CHECK</span>
              </div>
            </div>
            {/* floating stats */}
            <div className="hidden lg:flex absolute -left-2 bottom-8 rounded-2xl bg-white text-[#101828] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-black/5 gap-3 items-center">
              <div className="h-9 w-9 rounded-full bg-[#F3F4F6] flex items-center justify-center">✓</div>
              <div>
                <div className="text-[11px] font-bold tracking-wide text-[#667085]">VERIFICATION LOG</div>
                <div className="text-[13px] font-semibold -mt-0.5">사업성·권리·재무 단계별 검토</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE ANCHOR NAV */}
      <div id="svc" className="sticky top-[64px] z-30 backdrop-blur-xl bg-[#F9F5EB]/80 border-b border-black/5">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 h-[52px] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            {id:"svc-a", label:"진출 실행지원"},
            {id:"deal", label:"거래·M&A"},
            {id:"industry", label:"산업별 현지화"},
            {id:"security", label:"보안·준법"},
            {id:"operation", label:"현지 운영지원"},
          ].map((s, idx)=>(
            <button key={s.id} onClick={()=>scrollTo(s.id)} className={`whitespace-nowrap h-8 px-4 rounded-full text-[13px] font-medium border transition ${activeService===idx ? 'bg-[#101828] text-white border-[#101828]' : 'bg-white border-black/5 text-[#475467] hover:bg-[#F3F4F6]'}`}>
              {s.label}
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 text-[11px] font-medium text-[#667085]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]"/> Execution Platform v2.0
          </div>
        </div>
      </div>

      {/* SERVICES WRAPPER */}
      <main className="mx-auto max-w-[1280px] px-5 lg:px-8 py-10 lg:py-14 space-y-16 lg:space-y-24">

        {/* SERVICE A */}
        <section id="svc-a" data-idx={0} ref={el=>{serviceRefs.current[0]=el}} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#16A34A]">01 / ENTRY EXECUTION</div>
            <h2 className="mt-3 text-[28px] lg:text-[34px] font-bold tracking-[-0.02em] leading-[1.15]">베트남 진출 실행지원</h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-[#475467] max-w-[52ch]">베트남 사업 진출에 필요한 주요 업무를 하나의 프로젝트로 관리합니다. 조사부터 정착까지 흩어진 과정을 연결해 실행 리스크를 줄입니다.</p>

            <div className="mt-8 rounded-[20px] bg-white border border-black/[0.06] p-6 lg:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="text-[12px] font-bold tracking-wide text-[#101828] mb-4">CHECKLIST</div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {[
                  "진출지역·업종 검토",
                  "법인설립 및 투자절차 지원",
                  "현지 로펌·회계법인 연결",
                  "공장·사무실·물류시설 탐색",
                  "현지 파트너 발굴",
                  "인력·노무·회계 운영 연결",
                  "본사와 현지법인 간 업무관리",
                  "사업 초기 운영지원",
                ].map(item=>(
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-[#344054]">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center text-[12px] font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl bg-[#F3F4F6] border border-black/5 px-4 py-3 text-[13px] leading-[1.6] text-[#344054]">
                <span className="font-semibold text-[#101828]">통합 메모:</span> 시장조사부터 법인설립과 운영 정착까지, 베트남 진출의 전 과정을 함께합니다.
              </div>
            </div>
          </div>
          <div className="lg:sticky lg:top-[132px]">
            <div className="rounded-[20px] bg-[#101828] text-white p-6 lg:p-7 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] tracking-[0.14em] font-medium text-white/50">EXECUTION BOARD</div>
                <div className="text-[11px] font-mono text-white/30">PMO-2026-04</div>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  {t:"법인 형태·지역 진단", s:"진행중", c:"bg-[#F59E0B]"},
                  {t:"투자등록·사업등록 절차", s:"대기", c:"bg-white/20"},
                  {t:"임대·파트너·인력 매칭", s:"검증중", c:"bg-[#16A34A]"},
                ].map(r=>(
                  <div key={r.t} className="flex items-center justify-between rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3">
                    <span className="text-[13px]">{r.t}</span>
                    <span className={`text-[10px] font-bold tracking-wide px-2 py-1 rounded-full ${r.c} ${r.c.includes('white')?'text-white/70':'text-black'}`}>{r.s}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-white text-[#101828] p-4">
                <div className="text-[12px] font-bold">법인설립 타임라인</div>
                <div className="mt-3 flex gap-2">
                  {[0,1,2,3].map(i=>(
                    <div key={i} className="flex-1">
                      <div className={`h-1.5 rounded-full ${i<2?'bg-[#16A34A]':'bg-[#E5E7EB]'}`}/>
                      <div className="mt-1.5 text-[10px] text-[#667085]">{["진단","설계","서류","등록"][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICE B */}
        <section id="deal" data-idx={1} ref={el=>{serviceRefs.current[1]=el}} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#F59E0B]">02 / TRANSACTION</div>
            <h2 className="mt-3 text-[28px] lg:text-[34px] font-bold tracking-[-0.02em] leading-[1.15]">기업·공장·부동산<br/>거래 및 M&A</h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-[#475467] max-w-[52ch]">기업, 공장, 물류창고, 호텔·리조트 등 베트남 사업자산 거래를 지원합니다. 모든 거래는 사업성, 권리관계, 재무상태, 인허가 여부를 단계별로 검토합니다.</p>

            <div className="mt-8 rounded-[20px] bg-white border border-black/[0.06] p-6 lg:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="text-[12px] font-bold tracking-wide mb-4">9단계 검증 플로우</div>
              <ol className="space-y-2.5">
                {[
                  "매수·매도 조건 분석",
                  "대상 기업·프로젝트 발굴",
                  "기업·법인 기본정보 확인",
                  "비밀유지계약 및 자료관리",
                  "현장방문과 예비검토",
                  "법률·세무·재무 실사 연계",
                  "거래조건 협상 지원",
                  "계약·승인·거래종결 관리",
                  "인수 후 운영 안정화 지원",
                ].map((it, idx)=>(
                  <li key={it} className="flex gap-3">
                    <span className="h-6 w-6 shrink-0 rounded-full bg-[#101828] text-white text-[11px] font-bold flex items-center justify-center">{idx+1}</span>
                    <span className="text-[13.5px] leading-[1.5] text-[#344054]">{it}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] px-4 py-3 text-[13px] leading-[1.6] text-[#92400E]">
                소개에 그치지 않고, 검토부터 거래 완료까지 체계적으로 관리합니다.
              </div>
            </div>
          </div>
          <div className="lg:sticky lg:top-[132px] space-y-4">
            <div className="rounded-[20px] bg-white border border-black/[0.06] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-bold tracking-wide">DEAL ROOM</div>
                <div className="text-[11px] px-2 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] font-semibold">VDR • Encrypted</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  {k:"사업성", v:"Checked", ok:true},
                  {k:"권리관계", v:"Review", ok:false},
                  {k:"재무상태", v:"Checked", ok:true},
                  {k:"인허가", v:"Pending", ok:false},
                ].map(c=>(
                  <div key={c.k} className="rounded-xl bg-[#F9FAFB] border border-black/5 p-3">
                    <div className="text-[11px] text-[#667085]">{c.k}</div>
                    <div className={`mt-1 text-[13px] font-semibold flex items-center gap-1.5 ${c.ok?'text-[#16A34A]':'text-[#D97706]'}`}>{c.ok?'●':'◐'} {c.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-[#101828] text-white p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-[14px]">◫</div>
                <div className="flex-1">
                  <div className="text-[12px] font-medium">NDA_Company_A_v3.pdf</div>
                  <div className="text-[10px] text-white/50">암호화 • 열람로그 • 다운로드 제한</div>
                </div>
                <div className="text-[10px] px-2 py-1 rounded-full bg-[#16A34A] font-bold">SECURE</div>
              </div>
            </div>
            <div className="rounded-[20px] bg-[#F9F5EB] border border-[#E5DCC3] p-5">
              <div className="text-[11px] font-bold tracking-wide">검증 원칙</div>
              <p className="mt-2 text-[13px] leading-[1.6] text-[#57534E]">소개가 아닌 검증. 매물 정보는 사업성, 권리, 재무, 인허가 4단계로 분리해 독립적으로 확인합니다.</p>
            </div>
          </div>
        </section>

        {/* SERVICE C */}
        <section id="industry" data-idx={2} ref={el=>{serviceRefs.current[2]=el}} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#2563EB]">03 / LOCALIZATION</div>
            <h2 className="mt-3 text-[28px] lg:text-[34px] font-bold tracking-[-0.02em] leading-[1.15]">산업별 현지화 솔루션</h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-[#475467] max-w-[52ch]">기업의 업종과 진출 단계에 맞춰 현지 사업 운영에 필요한 서비스를 구성합니다. 단순 진출이 아닌 현지에서 실제 운영 가능한 사업 구조를 설계합니다.</p>

            <div className="mt-8 rounded-[20px] bg-white border border-black/[0.06] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                <span className="text-[12px] font-bold tracking-wide">INDUSTRY MATRIX</span>
                <span className="text-[11px] text-[#667085] font-mono">6 verticals • modular</span>
              </div>
              <div className="divide-y divide-black/5">
                {[
                  {ind:"제조", en:"Manufacturing", tags:["공장","생산","품질","ERP","MES","인력"]},
                  {ind:"농업·식품", en:"Agri·Food", tags:["생산","가공","창고","품질","수출"]},
                  {ind:"물류", en:"Logistics", tags:["창고","운송","재고","통관"]},
                  {ind:"관광·서비스", en:"Tourism·Service", tags:["호텔·리조트","예약","운영","네트워크"]},
                  {ind:"유통", en:"Distribution", tags:["공급자","OEM·ODM","수입","재고"]},
                  {ind:"친환경 제조", en:"Eco Manufacturing", tags:["소재","생산","검사","수출"]},
                ].map(row=>(
                  <div key={row.ind} className="grid grid-cols-[108px_1fr] lg:grid-cols-[140px_1fr] gap-3 px-6 py-3.5 items-center hover:bg-[#F9FAFB]">
                    <div>
                      <div className="text-[13px] font-semibold leading-tight">{row.ind}</div>
                      <div className="text-[10px] tracking-wide text-[#667085] font-medium">{row.en}</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {row.tags.map(t=>(
                        <span key={t} className="px-2.5 py-1 rounded-full bg-[#F3F4F6] border border-black/5 text-[11.5px] font-medium text-[#344054]">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:sticky lg:top-[132px]">
            <div className="rounded-[20px] bg-[#F3F4F6] border border-black/5 p-6">
              <div className="text-[12px] font-bold tracking-wide">OPERATING BLUEPRINT</div>
              <div className="mt-4 rounded-xl bg-white border border-black/5 p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold"><span className="h-5 w-5 rounded-full bg-[#101828] text-white flex items-center justify-center text-[10px]">1</span> 업종·단계 진단</div>
                <div className="ml-2.5 my-2 h-4 w-px bg-black/10"/>
                <div className="flex items-center gap-2 text-[12px] font-semibold"><span className="h-5 w-5 rounded-full bg-[#101828] text-white flex items-center justify-center text-[10px]">2</span> 필요 파트너·기술 매핑</div>
                <div className="ml-2.5 my-2 h-4 w-px bg-black/10"/>
                <div className="flex items-center gap-2 text-[12px] font-semibold"><span className="h-5 w-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[10px]">3</span> 현지 운영 구조 설계</div>
                <div className="mt-4 rounded-lg bg-[#101828] text-white px-3 py-2.5 text-[12px] leading-[1.5]">사업에 필요한 전문 파트너와 기술을 연결해 운영 가능한 구조로 설계합니다.</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["ERP","MES","WMS","QMS","HR","SCM"].map(k=>(
                  <div key={k} className="rounded-lg bg-white border border-black/5 py-2 text-center text-[11px] font-bold tracking-wide text-[#475467]">{k}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SERVICE D */}
        <section id="security" data-idx={3} ref={el=>{serviceRefs.current[3]=el}} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#7C3AED]">04 / SECURITY & COMPLIANCE</div>
            <h2 className="mt-3 text-[28px] lg:text-[34px] font-bold tracking-[-0.02em] leading-[1.15]">보안·준법·데이터 관리</h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-[#475467] max-w-[52ch]">베트남 사업 과정에서 발생하는 기업정보, 계약자료, 재무자료, 개인정보를 안전하게 관리합니다. 중요한 정보는 안전하게, 주요 의사결정은 투명하게.</p>

            <div className="mt-8 rounded-[20px] bg-white border border-black/[0.06] p-6 lg:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="text-[12px] font-bold tracking-wide mb-4 flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-[#101828] text-white flex items-center justify-center text-[11px]">🛡</span> 10 SECURITY CONTROLS</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "고객·투자자 확인",
                  "실소유자 및 자금 출처 확인",
                  "기업·프로젝트 기본검증",
                  "계약·NDA 관리",
                  "가상 데이터룸",
                  "문서 암호화와 접근권한",
                  "열람·다운로드 로그",
                  "개인정보 보호",
                  "이해상충 관리",
                  "거래 후 준법 모니터링",
                ].map(item=>(
                  <div key={item} className="flex items-start gap-2.5 rounded-xl bg-[#F9FAFB] border border-black/5 px-3 py-2.5">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-[#101828] text-white flex items-center justify-center text-[10px]">✓</span>
                    <span className="text-[13px] leading-[1.4] text-[#344054] font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-[#101828] text-white px-4 py-3 flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">🔒</span>
                <span className="text-[13px] leading-[1.5]"><b>중요한 정보는 안전하게,</b> 주요 의사결정은 투명하게 관리합니다.</span>
              </div>
            </div>
          </div>
          <div className="lg:sticky lg:top-[132px] space-y-4">
            <div className="rounded-[20px] bg-[#101828] text-white p-5 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-bold tracking-wide">VDR ACCESS LOG</div>
                <div className="text-[10px] px-2 py-1 rounded-full bg-[#16A34A] font-bold">LIVE</div>
              </div>
              <div className="mt-4 space-y-2 font-mono text-[11px]">
                {[
                  {u:"partner@law.vn", a:"view", f:"CapTable_v2.xlsx", t:"09:42:11"},
                  {u:"cfo@client.co", a:"download", f:"SPA_draft.pdf", t:"09:38:04"},
                  {u:"admin@b-a.kr", a:"grant", f:"QA Room", t:"09:31:22"},
                ].map(l=>(
                  <div key={l.t} className="flex items-center justify-between rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2">
                    <span className="text-white/70">{l.u}</span>
                    <span className="text-white">{l.a} · {l.f}</span>
                    <span className="text-white/40">{l.t}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  {k:"암호화", v:"AES-256"},
                  {k:"권한", v:"RBAC"},
                  {k:"로그", v:"Immutable"},
                ].map(b=>(
                  <div key={b.k} className="rounded-xl bg-white/[0.06] border border-white/10 p-2.5 text-center">
                    <div className="text-[10px] text-white/50">{b.k}</div>
                    <div className="text-[12px] font-bold mt-0.5">{b.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SERVICE E */}
        <section id="operation" data-idx={4} ref={el=>{serviceRefs.current[4]=el}} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#475467]">05 / OPERATIONS</div>
            <h2 className="mt-3 text-[28px] lg:text-[34px] font-bold tracking-[-0.02em] leading-[1.15]">베트남 현지 운영지원</h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-[#475467] max-w-[52ch]">법인설립 이후 필요한 운영업무를 지속적으로 지원합니다. 일회성 컨설팅이 아니라, 현지법인이 안정적으로 운영될 수 있도록 관리합니다.</p>

            <div className="mt-8 rounded-[20px] bg-white border border-black/[0.06] p-6 lg:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="text-[12px] font-bold tracking-wide mb-4">CONTINUOUS OPERATIONS</div>
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {[
                  "회계·세무 일정관리",
                  "노무·급여 운영",
                  "계약·문서관리",
                  "현지 공급자 관리",
                  "물류·구매 파트너 관리",
                  "IT·클라우드·보안 운영",
                  "인허가·갱신 일정관리",
                  "현지 규제·정책 변화 모니터링",
                  "본사 보고자료 작성",
                  "긴급 현지 대응",
                ].map(item=>(
                  <li key={item} className="flex items-center gap-2.5 text-[13.5px] text-[#344054]">
                    <span className="h-5 w-5 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[11px]">↻</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:sticky lg:top-[132px]">
            <div className="rounded-[20px] bg-white border border-black/[0.06] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold tracking-wide">운영 캘린더</span>
                <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6]">2026 Q2</span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  {d:"04/15", t:"VAT 신고", c:"회계", col:"bg-[#DBEAFE] text-[#1D4ED8]"},
                  {d:"04/20", t:"사회보험 정산", c:"노무", col:"bg-[#D1FAE5] text-[#065F46]"},
                  {d:"04/28", t:"투자등록 갱신 검토", c:"인허가", col:"bg-[#FEF3C7] text-[#92400E]"},
                  {d:"05/05", t:"본사 월간 보고", c:"보고", col:"bg-[#F3F4F6] text-[#475467]"},
                ].map(r=>(
                  <div key={r.d+r.t} className="flex items-center gap-3 rounded-xl border border-black/5 px-3 py-2.5">
                    <div className="text-[12px] font-bold font-mono w-10">{r.d}</div>
                    <div className="flex-1 text-[13px] font-medium">{r.t}</div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${r.col}`}>{r.c}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-[#101828] text-white px-3 py-2.5 text-[12px]">지속 모니터링 • 본사 보고 자동화 • 긴급 대응 채널</div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="rounded-[28px] bg-[#101828] text-white p-6 lg:p-10 border border-white/5 overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage:`linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize:'32px 32px'}}/>
          <div className="relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] tracking-[0.16em] font-bold text-[#22C55E]">PROCESS</div>
                <h2 className="mt-2 text-[26px] lg:text-[34px] font-bold tracking-[-0.02em] leading-[1.15]">이용 절차 — 6단계 실행 흐름</h2>
                <p className="mt-2 text-[14px] leading-[1.6] text-white/60 max-w-[60ch]">상담부터 운영관리까지 각 단계의 산출물과 검증 포인트가 명확한 실행 구조.</p>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse"/> PMO FLOW
              </div>
            </div>

            {/* stepper */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-3 relative">
              {/* desktop connector */}
              <div className="hidden md:block absolute top-[28px] left-[8%] right-[8%] h-px bg-gradient-to-r from-white/10 via-white/20 to-white/10"/>
              {[
                {n:1, t:"사업 상담", d:"업종·규모·지역·목표 확인"},
                {n:2, t:"진출 진단", d:"시장성·규제·파트너·비용 검토"},
                {n:3, t:"실행계획 수립", d:"법인·거래·현지화·운영 설계"},
                {n:4, t:"전문기관 연결", d:"법률·세무·부동산·IT·인력"},
                {n:5, t:"현지 실행", d:"현장·계약·설립·시스템 구축"},
                {n:6, t:"운영관리", d:"회계·노무·문서·공급망·준법"},
              ].map(s=>(
                <div key={s.n} className="relative rounded-[16px] bg-white/[0.06] border border-white/10 p-4 hover:bg-white/[0.08] transition">
                  <div className="h-7 w-7 rounded-full bg-white text-[#101828] flex items-center justify-center text-[12px] font-bold">{s.n}</div>
                  <div className="mt-3 text-[13.5px] font-semibold leading-tight">{s.t}</div>
                  <div className="mt-1.5 text-[11.5px] leading-[1.5] text-white/60">{s.d}</div>
                  <div className="mt-3 hidden md:block text-[16px] text-white/20">→</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[12px] bg-black/30 border border-white/10 px-4 py-3 font-mono text-[12px] lg:text-[13px] text-white/70 flex flex-wrap gap-2 items-center">
              <span className="text-white/30">FLOW</span>
              <span className="px-2 py-1 rounded-full bg-white text-[#101828] font-bold text-[11px]">상담</span> <span className="opacity-40">→</span>
              <span className="px-2 py-1 rounded-full bg-white/[0.08] border border-white/10">진출진단</span> <span className="opacity-40">→</span>
              <span className="px-2 py-1 rounded-full bg-white/[0.08] border border-white/10">실행계획</span> <span className="opacity-40">→</span>
              <span className="px-2 py-1 rounded-full bg-white/[0.08] border border-white/10">전문기관 연결</span> <span className="opacity-40">→</span>
              <span className="px-2 py-1 rounded-full bg-white/[0.08] border border-white/10">현지 실행</span> <span className="opacity-40">→</span>
              <span className="px-2 py-1 rounded-full bg-[#16A34A] text-white font-bold">운영관리</span>
            </div>
          </div>
        </section>

        {/* TARGET + STRENGTH */}
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-12">
          <section>
            <div className="text-[11px] tracking-[0.16em] font-bold text-[#475467]">TARGET</div>
            <h3 className="mt-2 text-[22px] lg:text-[26px] font-bold tracking-[-0.02em]">이런 기업을 지원합니다</h3>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                "베트남 신규 진출을 준비하는 기업",
                "베트남 생산공장 설립을 검토하는 제조기업",
                "현지 기업·공장·물류시설 인수를 검토하는 투자자",
                "호텔·리조트·관광사업을 준비하는 기업",
                "베트남 현지 공급망을 확보하려는 기업",
                "현지법인의 회계·노무·IT 운영이 필요한 기업",
                "본사와 베트남 법인의 업무시스템 통합이 필요한 기업",
              ].map(it=>(
                <div key={it} className="rounded-[14px] bg-white border border-black/[0.06] px-4 py-3 flex gap-2.5 items-start shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <span className="h-6 w-6 rounded-full bg-[#101828] text-white flex items-center justify-center text-[11px] shrink-0">◫</span>
                  <span className="text-[13px] leading-[1.5] text-[#344054] font-medium">{it}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="text-[11px] tracking-[0.16em] font-bold text-[#475467]">STRENGTHS</div>
            <h3 className="mt-2 text-[22px] lg:text-[26px] font-bold tracking-[-0.02em]">우리의 강점</h3>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                {k:"통합 실행", d:"시장조사, 법인설립, 거래, 현지화, 운영을 하나의 프로젝트로 관리", i:"◍"},
                {k:"검증 중심", d:"기업·프로젝트·권리·허가·계약 정보를 단계적으로 확인", i:"◎"},
                {k:"산업 전문성", d:"제조, 농업·식품, 물류, 관광, 유통 등 산업별 실행방안", i:"◐"},
                {k:"전문 네트워크", d:"법률·세무·회계·부동산·IT·인력 분야 협력", i:"⧉"},
                {k:"지속적인 운영지원", d:"사업 시작 이후에도 안정적 운영을 지원", i:"↻"},
              ].map(card=>(
                <div key={card.k} className={`rounded-[16px] border p-4 ${card.k==='통합 실행' ? 'bg-[#101828] text-white border-white/5 sm:col-span-2' : 'bg-white border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)]'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[13px] ${card.k==='통합 실행' ? 'bg-white/10' : 'bg-[#F3F4F6]'}`}>{card.i}</span>
                    <span className="text-[13.5px] font-bold">{card.k}</span>
                  </div>
                  <p className={`mt-2 text-[12.5px] leading-[1.6] ${card.k==='통합 실행' ? 'text-white/60' : 'text-[#667085]'}`}>{card.d}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* PLANS */}
        <section id="plans">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] tracking-[0.16em] font-bold text-[#16A34A]">SERVICE PACKAGES</div>
              <h2 className="mt-2 text-[26px] lg:text-[32px] font-bold tracking-[-0.02em]">서비스 상품 — 목적별 모듈</h2>
              <p className="mt-2 text-[14px] text-[#667085]">문의형 플랜. 목적에 따라 Entry → Growth → Transaction → Operation 으로 확장.</p>
            </div>
            <div className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-white border border-black/5 text-[#667085]">No fixed price • Execution-based</div>
          </div>

          <div className="mt-7 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {name:"Entry", sub:"베트남 진출 기본진단", desc:"초기 검토와 실행계획 제공", bullets:["진출지역·업종 검토","초기 사업성 분석","법인설립 절차 안내","현지 파트너 후보 검토","기본 실행계획 제공"], accent:"border-[#101828]"},
              {name:"Growth", sub:"현지 사업 실행 패키지", desc:"법인설립부터 운영체계 구축", bullets:["법인설립 PMO","공장·사무실·물류시설 탐색","전문기관 연결","현장방문 지원","초기 운영체계 구축"], accent:"border-black/5"},
              {name:"Transaction", sub:"기업·공장·프로젝트 거래 지원", desc:"검증부터 종결까지 관리", bullets:["매수·매도 조건 분석","대상 발굴","NDA·자료관리","예비실사","전문기관 실사 연계·종결 관리"], accent:"border-black/5"},
              {name:"Operation", sub:"현지법인 운영관리", desc:"설립 이후 지속 운영", bullets:["회계·세무","노무·급여","계약·문서","공급망","IT·보안·규제·인허가 일정관리"], accent:"border-black/5"},
            ].map((p, idx)=>(
              <div key={p.name} className={`rounded-[20px] bg-white border-2 p-5 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.04)] ${idx===0 ? 'border-[#101828] ring-4 ring-[#101828]/10' : p.accent}`}>
                {idx===0 && <div className="inline-flex text-[10px] font-bold tracking-wide px-2 py-1 rounded-full bg-[#101828] text-white w-fit">RECOMMENDED START</div>}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[18px] font-black tracking-tight">{p.name}</span>
                  <span className="text-[11px] text-[#667085] font-medium">{p.sub}</span>
                </div>
                <div className="mt-1 text-[12.5px] text-[#667085] leading-[1.5]">{p.desc}</div>
                <div className="mt-4 space-y-2 flex-1">
                  {p.bullets.map(b=>(
                    <div key={b} className="flex gap-2 text-[12.5px] leading-[1.4] text-[#344054]">
                      <span className="text-[#16A34A] mt-0.5">✓</span>{b}
                    </div>
                  ))}
                </div>
                <button onClick={()=>scrollTo('inquiry')} className={`mt-5 h-10 w-full rounded-full text-[13px] font-semibold transition ${idx===0 ? 'bg-[#16A34A] text-white hover:bg-[#14532D]' : 'bg-[#F3F4F6] text-[#101828] hover:bg-[#101828] hover:text-white'}`}>{p.name} 문의하기</button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* INQUIRY */}
      <section id="inquiry" className="mt-6 bg-[#F9F5EB] border-t border-black/5">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-[1.15fr_0.85fr] gap-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#101828] text-white px-3 py-1 text-[11px] font-bold tracking-wide">FINAL CTA</div>
            <h2 className="mt-4 text-[30px] lg:text-[40px] font-bold tracking-[-0.03em] leading-[1.1]">베트남 진출을<br/>준비하고 계신가요?</h2>
            <p className="mt-4 text-[14.5px] leading-[1.7] text-[#475467] max-w-[48ch]">사업 아이템, 진출지역, 투자규모, 필요한 지원 내용을 알려주시면 현재 상황에 맞는 실행방안을 제안해드립니다.</p>

            <div className="mt-8 rounded-[20px] bg-white border border-black/[0.06] p-5 lg:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {k:"company", l:"회사명", p:"(주) 예시"},
                  {k:"name", l:"담당자 이름", p:"홍길동"},
                  {k:"email", l:"이메일", p:"you@company.com"},
                  {k:"region", l:"진출지역", p:"예: Bac Ninh, Ho Chi Minh"},
                ].map(f=>(
                  <label key={f.k} className="block">
                    <span className="text-[11px] font-bold tracking-wide text-[#344054]">{f.l}</span>
                    <input value={(form as any)[f.k]} onChange={e=>setForm({...form, [f.k]: e.target.value})} placeholder={f.p} className="mt-1.5 w-full h-11 rounded-xl border border-black/10 bg-[#F9FAFB] px-3 text-[13.5px] outline-none focus:border-[#101828] focus:bg-white transition"/>
                  </label>
                ))}
                <label className="block">
                  <span className="text-[11px] font-bold tracking-wide text-[#344054]">업종</span>
                  <select value={form.industry} onChange={e=>setForm({...form, industry:e.target.value})} className="mt-1.5 w-full h-11 rounded-xl border border-black/10 bg-[#F9FAFB] px-3 text-[13.5px] outline-none focus:border-[#101828] focus:bg-white">
                    <option value="">선택</option>
                    <option>제조</option><option>농업·식품</option><option>물류</option><option>관광·서비스</option><option>유통</option><option>친환경 제조</option><option>기타</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold tracking-wide text-[#344054]">투자규모</span>
                  <select value={form.scale} onChange={e=>setForm({...form, scale:e.target.value})} className="mt-1.5 w-full h-11 rounded-xl border border-black/10 bg-[#F9FAFB] px-3 text-[13.5px] outline-none focus:border-[#101828] focus:bg-white">
                    <option value="">선택</option>
                    <option>~50만불</option><option>50~200만불</option><option>200만불~</option><option>검토중</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[11px] font-bold tracking-wide text-[#344054]">필요한 지원 내용</span>
                  <textarea value={form.need} onChange={e=>setForm({...form, need:e.target.value})} rows={4} placeholder="사업 아이템, 일정, 고민 포인트를 적어주세요. 예: 제조 공장 설립 + 현지 파트너 검증 필요" className="mt-1.5 w-full rounded-xl border border-black/10 bg-[#F9FAFB] px-3 py-3 text-[13.5px] outline-none focus:border-[#101828] focus:bg-white resize-none"/>
                </label>
              </div>
              <button onClick={()=>setShowInquiryPreview(true)} className="mt-5 h-12 w-full rounded-full bg-[#16A34A] hover:bg-[#14532D] text-white font-semibold text-[14px] transition">
                베트남 진출을 계획에서 실행으로 전환하세요. →
              </button>
              <div className="mt-3 text-[11px] text-[#667085] leading-[1.5]">제출 시 실행안 초안이 생성됩니다. 실제 전송 없이 로컬 미리보기로 확인 후 복사할 수 있습니다.</div>
            </div>
          </div>

          <div className="lg:pt-8 space-y-4">
            <div className="rounded-[20px] bg-[#101828] text-white p-6 border border-white/5">
              <div className="text-[12px] font-bold tracking-wide">문의 후 진행</div>
              <div className="mt-4 space-y-3">
                {[
                  {n:"01", t:"진단 리포트 초안", d:"업종·지역·규제 기반 실행 가능성 정리"},
                  {n:"02", t:"PMO 로드맵 제안", d:"법인·거래·현지화·운영 연결 일정"},
                  {n:"03", t:"전문기관 매칭", d:"법률·세무·부동산·IT 파트너 연결"},
                ].map(s=>(
                  <div key={s.n} className="flex gap-3 rounded-xl bg-white/[0.06] border border-white/10 p-3">
                    <span className="h-7 w-7 rounded-full bg-white text-[#101828] flex items-center justify-center text-[11px] font-bold shrink-0">{s.n}</span>
                    <div>
                      <div className="text-[13px] font-semibold">{s.t}</div>
                      <div className="text-[12px] text-white/60 mt-0.5 leading-[1.4]">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-white text-[#101828] p-3 text-[12px] leading-[1.6]">
                <span className="font-bold">보안:</span> 상담 내용은 가상 데이터룸에서 암호화 보관되며 접근 로그가 남습니다.
              </div>
            </div>

            <div className="rounded-[20px] bg-white border border-black/[0.06] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="text-[11px] font-bold tracking-wide">b/a PLATFORM PROMISE</div>
              <div className="mt-3 flex gap-2 text-[12.5px] leading-[1.5] text-[#344054]">
                <span className="text-[#16A34A]">✓</span> 검증 중심 — 단계별 확인 후 진행
              </div>
              <div className="mt-2 flex gap-2 text-[12.5px] leading-[1.5] text-[#344054]">
                <span className="text-[#16A34A]">✓</span> 통합 PMO — 흩어진 업무를 하나의 프로젝트로
              </div>
              <div className="mt-2 flex gap-2 text-[12.5px] leading-[1.5] text-[#344054]">
                <span className="text-[#16A34A]">✓</span> 지속 운영 — 설립 이후까지 관리
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-black/5">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 py-10 flex flex-col lg:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-11 rounded-[8px] bg-[#101828] text-white flex items-center justify-center text-[13px] font-bold">b/a</div>
              <span className="text-[13px] font-semibold tracking-tight">베트남 사업 실행 플랫폼</span>
            </div>
            <p className="mt-3 text-[12.5px] leading-[1.6] text-[#667085] max-w-[36ch]">시장조사부터 법인설립, 거래, 현지화, 운영까지. 빠르고 안전한 베트남 사업 진입을 위한 실행 플랫폼.</p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#F3F4F6] border border-black/5 font-medium">PMO</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#F3F4F6] border border-black/5 font-medium">VDR</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#F3F4F6] border border-black/5 font-medium">Compliance</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-[12.5px]">
            <div>
              <div className="font-bold text-[#101828]">서비스</div>
              <div className="mt-3 space-y-2 text-[#667085]">
                <div>진출 실행지원</div><div>거래·M&A</div><div>산업별 현지화</div><div>보안·준법</div><div>운영지원</div>
              </div>
            </div>
            <div>
              <div className="font-bold text-[#101828]">플랫폼</div>
              <div className="mt-3 space-y-2 text-[#667085]">
                <div>이용 절차</div><div>서비스 상품</div><div>검증 원칙</div><div>보안 정책</div>
              </div>
            </div>
            <div>
              <div className="font-bold text-[#101828]">Contact</div>
              <div className="mt-3 space-y-2 text-[#667085]">
                <div>실행 상담하기</div><div>hello@b-a.kr (예시)</div><div>Vietnam • Korea</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 h-12 border-t border-black/5 flex items-center justify-between text-[11px] text-[#98A2B3]">
          <span>© {new Date().getFullYear()} b/a — Vietnam Business Execution Platform. All rights reserved.</span>
          <span className="hidden sm:block font-mono">Built as secure execution platform • Not a consulting brochure</span>
        </div>
      </footer>

      {/* INQUIRY PREVIEW MODAL */}
      {showInquiryPreview && (
        <div className="fixed inset-0 z-[80] flex items-end lg:items-center justify-center p-3 lg:p-6">
          <div className="absolute inset-0 bg-[#101828]/60 backdrop-blur-sm" onClick={()=>setShowInquiryPreview(false)}/>
          <div className="relative w-full max-w-[640px] rounded-[20px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] border border-black/5 overflow-hidden max-h-[88vh] flex flex-col">
            <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
              <div className="text-[14px] font-bold">실행 상담 초안 미리보기</div>
              <button onClick={()=>setShowInquiryPreview(false)} className="h-8 w-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">✕</button>
            </div>
            <div className="p-6 overflow-auto space-y-4">
              <div className="rounded-xl bg-[#F9FAFB] border border-black/5 p-4 font-mono text-[12px] leading-[1.7] whitespace-pre-wrap">
{`[ b/a 실행 상담 요청서 ]

회사: ${form.company || '(미입력)'}
담당자: ${form.name || '(미입력)'} / ${form.email || '(미입력)'}
업종: ${form.industry || '(미선택)'} / 규모: ${form.scale || '(미선택)'}
지역: ${form.region || '(미입력)'}

지원 요청:
${form.need || '(내용 없음)'}

---
제안 초안:
1. 진출 진단 - 지역·업종·규제 검토
2. 실행계획 - 법인/거래/현지화/운영 설계
3. 전문기관 매칭 - 법률·세무·부동산·IT
4. 현지 실행 + 운영관리

※ 이 초안은 로컬에서 생성된 미리보기입니다.
복사하여 이메일로 전달하거나 내부 검토에 활용하세요.`}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{
                  const txt = document.querySelector('div.font-mono')?.textContent || '';
                  navigator.clipboard?.writeText(txt);
                }} className="flex-1 h-11 rounded-full bg-[#101828] text-white text-[13px] font-semibold">초안 복사하기</button>
                <button onClick={()=>setShowInquiryPreview(false)} className="flex-1 h-11 rounded-full bg-[#F3F4F6] text-[#101828] text-[13px] font-semibold">닫기</button>
              </div>
              <div className="text-[11px] text-[#667085] leading-[1.5] text-center">실제 전송 없이 로컬에서만 동작합니다. 필요시 복사 후 메일로 전달하세요.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
