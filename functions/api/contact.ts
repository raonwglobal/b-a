/**
 * Cloudflare Pages Function — /api/contact
 * Runtime: Cloudflare Workers (not Next.js). Types must not rely on PagesFunction global.
 */

export interface Env {
  CONTACT_EMAIL?: string;
  RESEND_API_KEY?: string;
  /** Google Apps Script 웹앱 URL (doPost) — 문의 행을 시트에 append */
  GOOGLE_SHEETS_WEBHOOK_URL?: string;
}

type Inquiry = {
  company?: string;
  name?: string;
  email?: string;
  industry?: string;
  scale?: string;
  region?: string;
  need?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const data = (await context.request.json()) as Inquiry;

    if (!data.email?.trim() || !data.company?.trim()) {
      return json({ error: '필수 항목 누락 (회사명, 이메일)' }, 400);
    }

    const row = {
      timestamp: new Date().toISOString(),
      company: data.company.trim(),
      name: (data.name || '').trim(),
      email: data.email.trim(),
      industry: (data.industry || '').trim(),
      scale: (data.scale || '').trim(),
      region: (data.region || '').trim(),
      need: (data.need || '').trim(),
    };

    console.log('New inquiry from b/a:', {
      ...row,
      need: row.need.slice(0, 200),
    });

    // 1) Google Sheets (Apps Script 웹훅)
    let sheetsOk = false;
    let sheetsError: string | undefined;
    if (context.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const sheetsRes = await fetch(context.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        });
        const sheetsBody = await sheetsRes.text();
        if (sheetsRes.ok) {
          sheetsOk = true;
        } else {
          sheetsError = `HTTP ${sheetsRes.status}: ${sheetsBody.slice(0, 200)}`;
          console.error('Google Sheets webhook error:', sheetsError);
        }
      } catch (err) {
        sheetsError = String(err);
        console.error('Google Sheets webhook failed:', err);
      }
    }

    // 2) Resend 이메일 (선택)
    if (context.env.RESEND_API_KEY) {
      const to = context.env.CONTACT_EMAIL || 'contact@b-a.asia';
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'b/a <noreply@b-a.asia>',
            to: [to],
            subject: `[b/a 문의] ${row.company} - ${row.industry || '일반'}`,
            html: `
              <h2>b/a 새로운 문의</h2>
              <p><b>회사:</b> ${escapeHtml(row.company)}</p>
              <p><b>담당자:</b> ${escapeHtml(row.name || '-')}</p>
              <p><b>이메일:</b> ${escapeHtml(row.email)}</p>
              <p><b>업종:</b> ${escapeHtml(row.industry || '-')}</p>
              <p><b>투자규모:</b> ${escapeHtml(row.scale || '-')}</p>
              <p><b>진출지역:</b> ${escapeHtml(row.region || '-')}</p>
              <p><b>요청 내용:</b><br/>${escapeHtml(row.need || '-').replace(/\n/g, '<br/>')}</p>
            `,
          }),
        });
        if (!res.ok) {
          console.error('Resend error:', await res.text());
        }
      } catch (err) {
        console.error('Resend failed:', err);
      }
    }

    return json({
      success: true,
      message: '문의가 접수되었습니다.',
      savedToSheet: sheetsOk,
      ...(sheetsError && !sheetsOk
        ? { sheetWarning: '시트 저장 실패 — 로그/이메일을 확인하세요.' }
        : {}),
    });
  } catch (e) {
    console.error('contact handler error:', e);
    return json({ error: '서버 오류' }, 500);
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
