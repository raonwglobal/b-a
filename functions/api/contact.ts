export interface Env {
  CONTACT_EMAIL?: string;
  RESEND_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // CORS preflight 대응
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const data = (await context.request.json()) as {
      company?: string;
      name?: string;
      email?: string;
      industry?: string;
      scale?: string;
      region?: string;
      need?: string;
    };

    // 필수 항목 검증
    if (!data.email || !data.company) {
      return new Response(
        JSON.stringify({ error: '필수 항목 누락 (회사명, 이메일)' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 로그 기록 (Cloudflare Dashboard > Functions 로그에서 확인 가능)
    console.log('New inquiry from b/a:', {
      company: data.company,
      name: data.name,
      email: data.email,
      industry: data.industry,
      scale: data.scale,
      region: data.region,
      need: data.need?.slice(0, 200),
    });

    // Resend 연동 (환경변수 설정 시 자동 발송)
    if (context.env.RESEND_API_KEY) {
      const to = context.env.CONTACT_EMAIL || 'contact@b-a.asia';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'b/a <noreply@b-a.asia>',
          to: [to],
          subject: `[b/a 문의] ${data.company} - ${data.industry || '일반'}`,
          html: `
            <h2>b/a 새로운 문의</h2>
            <p><b>회사:</b> ${escapeHtml(data.company)}</p>
            <p><b>담당자:</b> ${escapeHtml(data.name || '-')}</p>
            <p><b>이메일:</b> ${escapeHtml(data.email)}</p>
            <p><b>업종:</b> ${escapeHtml(data.industry || '-')}</p>
            <p><b>투자규모:</b> ${escapeHtml(data.scale || '-')}</p>
            <p><b>진출지역:</b> ${escapeHtml(data.region || '-')}</p>
            <p><b>요청 내용:</b><br/>${escapeHtml(data.need || '-').replace(/\n/g, '<br/>')}</p>
          `,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Resend error:', errText);
        // 이메일 실패해도 문의 자체는 성공으로 처리 (로그에 남아 있음)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: '문의가 접수되었습니다.' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (e) {
    console.error('contact handler error:', e);
    return new Response(JSON.stringify({ error: '서버 오류' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
