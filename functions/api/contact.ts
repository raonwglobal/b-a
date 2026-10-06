export interface Env {
  CONTACT_EMAIL?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const data = await context.request.json() as any;
    
    // 기본 검증
    if (!data.email || !data.company) {
      return new Response(JSON.stringify({ error: '필수 항목 누락' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 1. Cloudflare Email로 관리자에게 전송 (또는 로그)
    // 무료 플랜에서는 Email Workers 또는 외부 무료 서비스(Resend 무료 100통/일, Formspree) 연동
    console.log('New inquiry from b/a:', data);

    // 2. (선택) Resend 무료 API가 있다면 아래 주석 해제
    /*
    if (context.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'b/a <noreply@b-a.asia>',
          to: [context.env.CONTACT_EMAIL || 'contact@b-a.asia'],
          subject: `[b/a 문의] ${data.company} - ${data.industry || '일반'}`,
          html: `
            <h2>b/a 새로운 문의</h2>
            <p><b>회사:</b> ${data.company}</p>
            <p><b>이름:</b> ${data.name}</p>
            <p><b>이메일:</b> ${data.email}</p>
            <p><b>업종:</b> ${data.industry}</p>
            <p><b>투자규모:</b> ${data.budget}</p>
            <p><b>진출지역:</b> ${data.region}</p>
            <p><b>내용:</b><br/>${data.message}</p>
          `
        })
      });
    }
    */

    return new Response(JSON.stringify({ success: true, message: '문의가 접수되었습니다.' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: '서버 오류' }), { status: 500 });
  }
}
