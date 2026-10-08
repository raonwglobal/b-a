/**
 * Cloudflare Worker: static assets (out/) + POST /api/contact
 * Site: https://b-a.bambooasia.biz
 * Contact default: info@bambooasia.biz
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function handleContact(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const data = await request.json();
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

    console.log('New inquiry from b/a:', { ...row, need: row.need.slice(0, 200) });

    let sheetsOk = false;
    if (env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const sheetsRes = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        });
        sheetsOk = sheetsRes.ok;
        if (!sheetsRes.ok) {
          console.error('Google Sheets webhook error:', await sheetsRes.text());
        }
      } catch (err) {
        console.error('Google Sheets webhook failed:', err);
      }
    }

    if (env.RESEND_API_KEY) {
      const to = env.CONTACT_EMAIL || 'info@bambooasia.biz';
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'b/a <noreply@bambooasia.biz>',
            to: [to],
            subject: `[b/a 문의] ${row.company} - ${row.industry || '일반'}`,
            html: `
              <h2>b/a 새로운 문의</h2>
              <p><b>사이트:</b> https://b-a.bambooasia.biz</p>
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
        if (!res.ok) console.error('Resend error:', await res.text());
      } catch (err) {
        console.error('Resend failed:', err);
      }
    }

    return json({
      success: true,
      message: '문의가 접수되었습니다.',
      savedToSheet: sheetsOk,
    });
  } catch (e) {
    console.error('contact handler error:', e);
    return json({ error: '서버 오류' }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
      return handleContact(request, env);
    }
    if (env.ASSETS) {
      // /card/{id} — serve static if present; else SPA with same URL (no 307 that drops id)
      const cardMember = url.pathname.match(/^\/card\/([^/]+)\/?$/);
      if (cardMember && !cardMember[1].includes('.')) {
        const exact = await env.ASSETS.fetch(request);
        if (exact.status === 200) return exact;
        const spa = new URL('/card-spa.html', url.origin);
        return env.ASSETS.fetch(new Request(spa.toString(), request));
      }
      // /card or /card/ → list page
      if (url.pathname === '/card' || url.pathname === '/card/') {
        const list = await env.ASSETS.fetch(request);
        if (list.status === 200) return list;
        const spa = new URL('/card-spa.html', url.origin);
        return env.ASSETS.fetch(new Request(spa.toString(), request));
      }
      return env.ASSETS.fetch(request);
    }
    return new Response('Not found', { status: 404 });
  },
};
