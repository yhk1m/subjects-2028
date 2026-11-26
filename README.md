# 2028학년도 주요대학 이수 권장 과목 안내

Apps Script 웹 앱을 GitHub Pages 정적 사이트로 옮긴 것. 디자인은 당토 디자인(주색 먹, 편안, 담백)에 대학 고유 색을 얹었다.

- 주소: https://subjects.bgnl.kr
- 자료: 구글 시트 「대학정보」 탭을 화면이 열릴 때마다 바로 읽는다(gviz CSV). 시트를 고치면 사이트에 바로 반영된다.
  시트가 「링크가 있는 모든 사용자 보기」여야 한다. 연결이 안 되면 `data/snapshot.csv`(2026-11-26)를 대신 보여 준다.
- 칸 나누기: 과목은 `/` 또는 줄바꿈으로 나눈다. 쉼표는 한 과목 설명 안의 글자로 본다.
- 조회수: `gas/views.gs`를 기존 Apps Script에 붙이고 새 버전으로 배포해야 보인다(파일 맨 위 설명 참고). `?noview=1`이면 세지 않는다.
- 설정: `config.js` 하나에 시트 주소, 조회수 주소, 대학 원문 자료, 대학 고유 색이 있다.

## 파일
| 파일 | 내용 |
|---|---|
| index.html | 화면 |
| app.js | 시트 읽기, 고르기, 찾기, 결과, 조회수 |
| app.css | 화면 모양 |
| tokens.css, controls.css | 당토 디자인 토큰과 공통 부품 |
| config.js | 설정 |
| gas/views.gs | Apps Script 조회수 JSON 주소 |
| gas/move-notice.html | 기존 Apps Script 화면에 붙이는 새 주소 안내 팝업 |
