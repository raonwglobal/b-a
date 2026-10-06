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
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ok: boolean; msg: string} | null>(null);

  const t = content[lang];

  const handleSubmit = async () => {
    if (!form.company.trim() || !form.email.trim()) {
      setSubmitResult({ ok: false, msg: '회사명과 이메일은 필수입니다.' });
      setShowInquiryPreview(true);
      return;
    }
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSubmitResult({ ok: true, msg: data.message || '문의가 접수되었습니다. 확인 후 연락드리겠습니다.' });
      } else {
        setSubmitResult({ ok: false, msg: data.error || '전송에 실패했습니다. 잠시 후 다시 시도해주세요.' });
      }
    } catch {
      setSubmitResult({ ok: false, msg: '네트워크 오류가 발생했습니다. 복사 후 이메일로 전달해주세요.' });
    } finally {
      setSubmitting(false);
      setShowInquiryPreview(true);
    }
  };

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
    <div className="min-h-screen bg-[#F9F5EB] text-[#101828] antialiased">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-black/5 h-16 flex items-center px-5">
        <div className="h-7 w-11 rounded bg-[#101828] text-white flex items-center justify-center text-xs font-bold">b/a</div>
        <span className="ml-3 text-xs text-gray-500">Vietnam Execution Platform</span>
        <div className="ml-auto flex gap-1">
          {(['KR','EN','VI','JP'] as Lang[]).map(l => (
            <button key={l} onClick={()=>setLang(l)} className={`px-2 py-1 rounded text-xs ${lang===l?'bg-black text-white':'bg-gray-100'}`}>{l}</button>
          ))}
        </div>
      </header>
      <section className="bg-[#101828] text-white py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs tracking-widest text-white/60">{t.eyebrow}</p>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold whitespace-pre-line">{t.heroTitle}</h1>
          <p className="mt-4 text-white/70">{t.heroSub}</p>
          <button onClick={()=>scrollTo('inquiry')} className="mt-8 h-12 px-6 rounded-full bg-[#16A34A] text-white font-semibold">{t.heroCTA1}</button>
        </div>
      </section>
      <section id="inquiry" className="py-16 px-5 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">실행 상담 요청</h2>
        <div className="space-y-3">
          {["company","name","email","region"].map(k => (
            <input key={k} placeholder={k} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="w-full h-11 rounded-xl border px-3" />
          ))}
          <textarea value={form.need} onChange={e=>setForm({...form,need:e.target.value})} rows={4} placeholder="필요 지원 내용" className="w-full rounded-xl border px-3 py-2" />
          <button onClick={handleSubmit} disabled={submitting} className="w-full h-12 rounded-full bg-[#16A34A] text-white font-semibold disabled:opacity-60">
            {submitting ? '접수 중…' : '문의 제출'}
          </button>
          {submitResult && <div className={`p-3 rounded-xl text-sm ${submitResult.ok?'bg-green-50 text-green-800':'bg-red-50 text-red-800'}`}>{submitResult.msg}</div>}
        </div>
      </section>
      <footer className="border-t py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} b/a — Vietnam Business Execution Platform</footer>
      {showInquiryPreview && !submitResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={()=>setShowInquiryPreview(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e=>e.stopPropagation()}>
            <p className="text-sm">미리보기 / 결과 확인</p>
            <button onClick={()=>setShowInquiryPreview(false)} className="mt-4 w-full h-10 rounded-full bg-gray-100">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
