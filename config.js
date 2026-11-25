// © 2026 김용현
/*
  설정 파일: 자료 주소, 조회수 주소, 대학 자료 원문, 대학 고유 색
  이 파일만 고치면 화면 코드를 건드리지 않아도 돼요.
*/
window.APP_CONFIG = {
  // 백엔드 스프레드시트 (링크가 있는 모든 사용자 보기 권한이어야 읽을 수 있어요)
  sheetId: '1hYAGDdfOqOy3K3Qh05YF43SswpBr_Nk8Vjcjs8EdTUs',
  sheetGid: '0', // 「대학정보」 탭

  // 조회수 주소: Apps Script 에 gas/views.gs 를 붙이고 새 버전으로 배포한 웹 앱 주소
  // 비워 두면 조회수를 숨겨요
  viewsApi: 'https://script.google.com/macros/s/AKfycbwyAYVk4Uhc-GDoxYkEl9JU_TWEO0JXeVKt02gaCMDrGcZCfW-gH-AYNaxqvn_DI4BU/exec',

  // 대학별 원문 자료 (url 이 없으면 원문 줄을 숨겨요)
  sources: {
    '서울대학교': { title: '2028학년도 서울대학교 전공 연계 과목 선택 안내 발표', url: 'https://drive.google.com/file/d/1Ze-3s3-ExH_ezZwb_YHXbWLAd2w9-aID/view?usp=drive_link' },
    '고려대학교': { title: '(250902 수정) 고려대학교 대입전형 자연계열 권장이수과목(배포용)', url: 'https://drive.google.com/file/d/1uC3xpyF10AbcKBuhRfCVnltZbRc0o06w/view?usp=drive_link' },
    'POSTECH': { title: '2028학년도 모집단위별 반영과목_POSTECH', url: 'https://drive.google.com/file/d/1Ozg77uyQuILzN_hZqxUOdFfxih1x7Ypt/view?usp=drive_link' },
    '서강대학교': { title: '2028학년도 서강대학교 모집단위별 반영과목_250829', url: 'https://drive.google.com/file/d/1uOTaDWS2GaKCF9m_Oyav1FSeMsLksmI8/view?usp=sharing' },
    '성균관대학교': { title: '(성균관대) 2028학년도 학생부종합전형 서류평가 개요', url: 'https://drive.google.com/file/d/1H8ZbDEbor9W7RLEaf9d7Bp3RV1Q1pTA1/view?usp=sharing' },
    '한양대학교': { title: '2028학년도 한양대학교 대입 관련 이수 권장 과목(안)', url: 'https://drive.google.com/file/d/1lEK3kxv3a-RZmLp2tAgXrFrQM-2X9uqA/view?usp=sharing' },
    '중앙대학교': { title: '2028학년도 대입전형 학문단위별 이수 권장과목 안내(자연계열)_중앙대학교', url: 'https://drive.google.com/file/d/1kmnSyFwRbf0onJBpCaKQQlm2T94kWyVx/view?usp=sharing' },
    '경희대학교': { title: '2028 경희대학교 이수 권장과목 안내', url: 'https://drive.google.com/file/d/1hWeGuQ5aoJme8-LewbUCASd1qmIR96eR/view?usp=sharing' },
    '서울시립대학교': { title: '[서울시립대학교] 2028학년도 모집단위별 반영과목', url: 'https://drive.google.com/file/d/1DE25osLW2H2p2sP2CfXoNgvSCStHr8D8/view?usp=sharing' },
    '건국대학교': { title: '건국대, 2028년 입시 이수추천과목 가이드 발표', url: 'https://drive.google.com/file/d/1GlF6h5KdRQjPZmAp1bZ-UHv-Py5AHLIz/view?usp=sharing' },
    '동국대학교': { title: '2028학년도 대입 준비를 위한 동국대학교 모집단위별 전공 관련 교과 영역', url: 'https://drive.google.com/file/d/1kDP5y1lWbVtLX51WXULxooWo0k56BLNI/view?usp=sharing' },
    '숙명여자대학교': { title: 'SM 진로 학업 설계 가이드', url: 'https://drive.google.com/file/d/1tUuKoJvujq36_i6TAq8J_IB3o86VKQZs/view?usp=sharing' },
    '국민대학교': { title: '2028학년도 국민대학교 학생부종합전형 모집단위별 교과 이수 추천', url: 'https://drive.google.com/file/d/1TSntZEUpe53Pxn1nESwlTUEFtb8UQoOU/view?usp=sharing' },
    '숭실대학교': { title: '(공개용)숭실대학교 2028학년도 교과목 선택 이수 안내', url: 'https://drive.google.com/file/d/1OaLsb4N7QHxe_S9XrNegg8xBnDKpwjIP/view?usp=sharing' },
    '단국대학교(죽전)': { title: '2028학년도 모집단위별 이수 권장 과목 안내_단국대학교(죽전)', url: 'https://drive.google.com/file/d/19IzAlm5slyiNJ5pb0R4PrLAuxBRH_caX/view?usp=sharing' },
    '아주대학교': { title: '(아주대학교) 2028학년도 모집단위별 고등학교 교과 이수 권장 과목 안내', url: 'https://drive.google.com/file/d/1FMBSg4_pOdS9gwGCovXFH_lsNF9LbFk6/view?usp=sharing' },
    '인하대학교': { title: '인하대학교「2028 자연계열 모집단위 권장 교과영역」안내', url: 'https://drive.google.com/file/d/15K8Mb0cZdi8MTYi3DbjO0pHZGSC8Bkld/view?usp=sharing' },
    '한양대학교 ERICA': { title: '(한양대학교 ERICA) 2028학년도 모집단위별 반영과목 안내', url: 'https://drive.google.com/file/d/1wjHYPNNuFgp3Scv3wD1V9BS_OSptKigj/view?usp=sharing' },
    '경기대학교': { title: '(경기대)2028학년도 모집단위별 과목선택 가이드', url: 'https://drive.google.com/file/d/15Wc8FM6fH1NDKuwZygGvrlq6lJRY8cwc/view?usp=sharing' },
    '강원대학교(춘천)': { title: '(최종 수정)2028학년도 대학입학전형 모집단위별 반영과목 안내(2025.9.25.)_강원대학교', url: 'https://drive.google.com/file/d/1HKuLDPW2g2OgcKaEkuI7b5Pw-FSdauWr/view?usp=sharing' },
    '충북대학교': { title: '2028학년도 충북대학교 모집단위별 관련 교과 안내', url: 'https://drive.google.com/file/d/1jslR9IGoyntetpW0I1Ifny_MQljQpH99/view?usp=sharing' },
    '충남대학교': { title: '2028학년도 충남대학교 학생부종합전형 권장 이수 과목 안내', url: 'https://drive.google.com/file/d/1CKP-Yqt6AFd9HdDjMbwq9x3Pi-WbicJH/view?usp=sharing' },
    '경북대학교': { title: '2028학년도 고교선택가이드(최종)_경북대학교', url: 'https://drive.google.com/file/d/1lG7FabA4vd-XqgQnfN3wSHzYBpp5bFXY/view?usp=sharing' },
    '부산대학교': { title: '2028학년도 대학입학전형 모집단위별 반영과목_부산대학교_ASSIST 입력용', url: 'https://drive.google.com/file/d/1z79GOfBP7vFv6HgmIhmfnOd5Hy60rNrf/view?usp=sharing' },
    '원광대학교': { title: '2028학년도 원광대학교 의약학계열 모집단위 고등학교 교과 이수 권장과목 안내', url: 'https://drive.google.com/file/d/1iqXK6wXuUai1e2i7vF_q-RVhmsT3eL0o/view?usp=sharing' },
    '전북대학교': { title: '2028학년도 학생부종합전형 모집단위별 전공참고교과(안)_전북대학교', url: 'https://drive.google.com/file/d/1G2hDc_gw8RivnZ8UGOmGyvw7W2V3vHLA/view?usp=sharing' },
    '전남대학교(광주)': { title: '2028학년도 모집단위별 반영 과목_전남대학교', url: 'https://drive.google.com/file/d/17IhlH3YrzlxDrwmRKnBqNDvSbZcD4Rzk/view?usp=sharing' },
    '한국항공대학교': { title: '2028 한국항공대학교 모집단위별 고교 이수 추천 과목(안)', url: 'https://drive.google.com/file/d/15LBI1XgyOhpBEJTN4ASBgNVeaI-i3yw1/view?usp=sharing' },
    '한국체육대학교': { title: '한국체대_2028학년도 대학입학전형 모집단위별 반영과목', url: 'https://drive.google.com/file/d/1zuXoZJ1jKM_1jLf3UgfuyuGWveFGE1vh/view?usp=sharing' }
  },

  // 대학 고유 색 (원래 Apps Script 화면의 색 그대로)
  //   line: 고르기 전 글자와 테두리 색
  //   fill: 골랐을 때 채우는 색
  //   on:   채운 색 위 글자 색
  // 글자가 바탕과 잘 구분되지 않으면 화면에서 같은 색 계열 안에서 밝기만 조금 바꿔 보여 줘요.
  colors: {
    '서울대학교':         { line: '#176abd', fill: '#176abd', on: '#ffffff' },
    'POSTECH':            { line: '#bc134d', fill: '#bc134d', on: '#c4c5c9' },
    '연세대학교':         { line: '#003366', fill: '#003366', on: '#ffffff' },
    '고려대학교':         { line: '#8b0000', fill: '#800000', on: '#d3b91e' },
    '서강대학교':         { line: '#8c1c21', fill: '#8c1c21', on: '#c0c0c0' },
    '성균관대학교':       { line: '#1d4d2f', fill: '#1d4d2f', on: '#f4d623' },
    '한양대학교':         { line: '#0e4a84', fill: '#0e4a84', on: '#ffffff' },
    '한양대학교 ERICA':   { line: '#0e4a84', fill: '#0e4a84', on: '#ffffff' },
    '중앙대학교':         { line: '#2a78df', fill: '#2a78df', on: '#ffffff' },
    '경희대학교':         { line: '#ad0000', fill: '#ad0000', on: '#ffffff' },
    '서울시립대학교':     { line: '#004094', fill: '#004094', on: '#ffffff' },
    '건국대학교':         { line: '#005426', fill: '#005426', on: '#ffffff' },
    '동국대학교':         { line: '#ff8c00', fill: '#ff8c00', on: '#ffffff' },
    '숙명여자대학교':     { line: '#176abd', fill: '#176abd', on: '#ffffff' },
    '국민대학교':         { line: '#08a470', fill: '#f5c847', on: '#001a4b' },
    '숭실대학교':         { line: '#056a8c', fill: '#5fbdbb', on: '#ffffff' },
    '단국대학교(죽전)':   { line: '#005093', fill: '#005093', on: '#ffffff' },
    '단국대학교(천안)':   { line: '#005093', fill: '#005093', on: '#ffffff' },
    '인하대학교':         { line: '#005bac', fill: '#00afec', on: '#ffffff' },
    '아주대학교':         { line: '#0461a7', fill: '#0461a7', on: '#ffffff' },
    '광운대학교':         { line: '#78222d', fill: '#78222d', on: '#ffffff' },
    '가톨릭대학교':       { line: '#153179', fill: '#153179', on: '#ffffff' },
    '경기대학교':         { line: '#1a1e25', fill: '#dd5510', on: '#1a1e25' },
    '강원대학교(춘천)':   { line: '#275cab', fill: '#275cab', on: '#ffffff' },
    '충북대학교':         { line: '#b62b5c', fill: '#b62b5c', on: '#ffffff' },
    '충남대학교':         { line: '#004098', fill: '#004098', on: '#ffffff' },
    '경북대학교':         { line: '#da2127', fill: '#da2127', on: '#ffffff' },
    '부산대학교':         { line: '#169e50', fill: '#169e50', on: '#ffffff' },
    '원광대학교':         { line: '#7d1a2a', fill: '#7d1a2a', on: '#ffffff' },
    '전북대학교':         { line: '#9d1b5b', fill: '#9d1b5b', on: '#ffffff' },
    '전남대학교(광주)':   { line: '#008535', fill: '#008535', on: '#ffffff' },
    '서울과학기술대학교': { line: '#1c2a53', fill: '#ae1e24', on: '#ffffff' },
    '한국항공대학교':     { line: '#001e99', fill: '#001e99', on: '#ffffff' },
    '한국체육대학교':     { line: '#0e664f', fill: '#0e664f', on: '#ffffff' }
  }
};
