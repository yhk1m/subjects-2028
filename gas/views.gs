/**
 * 조회수 JSON 주소 (GitHub 정적 사이트용)
 *
 * 붙이는 법
 * 1. 기존 Apps Script 프로젝트에 새 파일(views.gs)을 만들고 이 코드를 그대로 붙여 넣어요.
 * 2. 기존 doGet(e) 함수의 맨 첫 줄에 아래 한 줄을 넣어요.
 *
 *      if (e && e.parameter && e.parameter.api === 'views') return viewsApi_(e);
 *
 * 3. 배포 > 배포 관리 > 연필 아이콘 > 버전 「새 버전」 > 배포
 *    (주소가 그대로 유지돼요. 액세스 권한은 「모든 사용자」)
 *
 * 동작
 *   ?api=views&hit=1  오늘 조회수와 누적 조회수를 1 올리고 숫자를 돌려줘요
 *   ?api=views&hit=0  올리지 않고 숫자만 돌려줘요
 * 「조회수통계」 탭의 기존 형식(날짜, 항목ID, 일일조회수, 누적조회수, 제목)을 그대로 이어 써요.
 */
var VIEWS_BOOK_ = '1hYAGDdfOqOy3K3Qh05YF43SswpBr_Nk8Vjcjs8EdTUs';
var VIEWS_SHEET_ = '조회수통계';
var VIEWS_ID_ = 'main_page';
var VIEWS_TITLE_ = '메인 페이지';

function viewsApi_(e) {
  var hit = String(e.parameter.hit) === '1';
  var result = hit ? bumpViews_() : readViews_();
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function viewsToday_() {
  return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
}

function viewsCellDate_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd');
  return String(v).trim();
}

// 항목ID 가 main_page 인 줄 가운데 마지막 줄을 찾는다
function viewsLastRow_(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var values = sheet.getRange(2, 1, last - 1, 4).getValues();
  for (var i = values.length - 1; i >= 0; i--) {
    if (String(values[i][1]) === VIEWS_ID_) {
      return { row: i + 2, date: viewsCellDate_(values[i][0]), daily: Number(values[i][2]) || 0, total: Number(values[i][3]) || 0 };
    }
  }
  return null;
}

function readViews_() {
  var sheet = SpreadsheetApp.openById(VIEWS_BOOK_).getSheetByName(VIEWS_SHEET_);
  var last = viewsLastRow_(sheet);
  if (!last) return { today: 0, total: 0 };
  return { today: last.date === viewsToday_() ? last.daily : 0, total: last.total };
}

function bumpViews_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.openById(VIEWS_BOOK_).getSheetByName(VIEWS_SHEET_);
    var today = viewsToday_();
    var last = viewsLastRow_(sheet);
    if (last && last.date === today) {
      sheet.getRange(last.row, 3, 1, 2).setValues([[last.daily + 1, last.total + 1]]);
      return { today: last.daily + 1, total: last.total + 1 };
    }
    var total = (last ? last.total : 0) + 1;
    sheet.appendRow([today, VIEWS_ID_, 1, total, VIEWS_TITLE_]);
    return { today: 1, total: total };
  } finally {
    lock.releaseLock();
  }
}
