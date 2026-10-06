/**
 * b/a 문의 폼 → Google Sheets 저장용 Apps Script
 *
 * 설정 순서:
 * 1. 새 Google 스프레드시트 생성 (예: "b-a 문의 접수")
 * 2. 1행에 헤더 입력:
 *    접수시각 | 회사 | 담당자 | 이메일 | 업종 | 투자규모 | 진출지역 | 요청내용
 * 3. 확장 프로그램 > Apps Script 열고 이 파일 내용을 붙여넣기
 * 4. 배포 > 새 배포 > 유형: 웹 앱
 *    - 실행 주체: 나
 *    - 액세스 권한: 모든 사용자
 * 5. 배포 후 나온 웹 앱 URL을 복사
 * 6. Cloudflare Pages > Settings > Variables 에
 *    GOOGLE_SHEETS_WEBHOOK_URL = (웹 앱 URL)
 *
 * 테스트: 배포 URL로 POST JSON
 * { "company":"테스트","email":"a@b.com","name":"홍길동", ... }
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const raw = e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const timestamp = data.timestamp
      ? new Date(data.timestamp)
      : new Date();

    sheet.appendRow([
      timestamp,
      data.company || '',
      data.name || '',
      data.email || '',
      data.industry || '',
      data.scale || '',
      data.region || '',
      data.need || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** 브라우저에서 GET으로 열었을 때 상태 확인용 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'b/a inquiry → Google Sheets' }))
    .setMimeType(ContentService.MimeType.JSON);
}
