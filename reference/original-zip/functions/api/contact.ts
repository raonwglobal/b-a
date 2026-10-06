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

    console.log('New inquiry from b/a:', data);

    return new Response(JSON.stringify({ success: true, message: '문의가 접수되었습니다.' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: '서버 오류' }), { status: 500 });
  }
};
