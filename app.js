// © 2026 김용현
/* 2028 권장 과목 안내: 정적 사이트 (구글 시트를 바로 읽음) */
(function () {
  'use strict';

  var CFG = window.APP_CONFIG || {};
  var AREAS = ['korean', 'math', 'english', 'social', 'science', 'other'];
  var AREA_NAMES = { korean: '국어', math: '수학', english: '영어', social: '사회', science: '과학', other: '기타' };
  var SNAPSHOT_DATE = '2026. 11. 26.';
  var PAGE = 20;

  var data = {};       // data[대학][계열][학과] = { required: {...}, recommended: {...} }
  var flat = [];       // [{ university, department, major, subjects }]
  var sel = { u: '', d: '', m: '' };
  var stype = 'major';
  var hits = [];
  var shown = 0;
  var lastQuery = '';

  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 글자 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s).replace(/\s+/g, '').toLowerCase(); }
  function highlight(text, q) {
    // 띄어쓰기를 무시하고 찾은 부분에 표시
    var nq = norm(q);
    if (!nq) return esc(text);
    var map = [], compact = '';
    for (var i = 0; i < text.length; i++) {
      if (!/\s/.test(text[i])) { map.push(i); compact += text[i].toLowerCase(); }
    }
    var at = compact.indexOf(nq);
    if (at < 0) return esc(text);
    var s = map[at], e = map[at + nq.length - 1] + 1;
    return esc(text.slice(0, s)) + '<mark>' + esc(text.slice(s, e)) + '</mark>' + esc(text.slice(e));
  }
  var collator = new Intl.Collator('ko');
  function sortKo(arr) { return arr.slice().sort(collator.compare); }

  /* ---------- 색 (대학 고유 색을 지키면서 글자 대비만 맞춤) ---------- */
  function hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
  }
  function rgb2hex(r) { return '#' + r.map(function (v) { return Math.round(v).toString(16).padStart(2, '0'); }).join(''); }
  function lum(rgb) {
    var c = rgb.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var la = lum(hex2rgb(a)), lb = lum(hex2rgb(b));
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function mix(a, b, t) {
    var x = hex2rgb(a), y = hex2rgb(b);
    return rgb2hex(x.map(function (v, i) { return v + (y[i] - v) * t; }));
  }
  // 바탕과 4.5:1 이 될 때까지 같은 색을 조금씩 어둡게(또는 밝게)
  function readable(fg, bg, toward) {
    for (var t = 0; t <= 1; t += 0.04) {
      var c = mix(fg, toward, t);
      if (contrast(c, bg) >= 4.5) return c;
    }
    return toward;
  }
  function onColor(fill, wanted) {
    if (contrast(wanted, fill) >= 4.5) return wanted;
    var white = '#ffffff', ink = '#1a1e25';
    return contrast(white, fill) >= contrast(ink, fill) ? white : ink;
  }
  var colorCache = {};
  function uniVars(name) {
    if (colorCache[name]) return colorCache[name];
    var c = (CFG.colors || {})[name];
    if (!c) return (colorCache[name] = '');
    var fgL = readable(c.line, '#ececee', '#000000');
    var fgD = readable(c.line, '#2c2f36', '#ffffff');
    var on = onColor(c.fill, c.on);
    var v = '--u-fg-l:' + fgL + ';--u-bd-l:' + c.line + ';--u-fg-d:' + fgD + ';--u-bd-d:' + fgD +
            ';--u-fill:' + c.fill + ';--u-on:' + on + ';--u-dot:' + c.fill + ';';
    return (colorCache[name] = v);
  }
  function applyUni(el, name) { el.setAttribute('style', uniVars(name)); }

  /* ---------- CSV ---------- */
  function parseCSV(text) {
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; } else q = false;
        } else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (ch !== '\r') cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  function splitSubjects(cell) {
    return String(cell || '').split(/\s*[\/\n]\s*/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function build(rows) {
    data = {}; flat = [];
    rows.slice(1).forEach(function (r) {
      var u = (r[0] || '').trim(), d = (r[1] || '').trim(), m = (r[2] || '').trim();
      if (!u || !d || !m) return;
      var subjects = { required: {}, recommended: {} };
      AREAS.forEach(function (a, i) {
        subjects.required[a] = splitSubjects(r[3 + i]);
        subjects.recommended[a] = splitSubjects(r[9 + i]);
      });
      data[u] = data[u] || {};
      data[u][d] = data[u][d] || {};
      data[u][d][m] = subjects;
      flat.push({ university: u, department: d, major: m, subjects: subjects });
    });
    flat.sort(function (a, b) {
      return collator.compare(a.university, b.university) || collator.compare(a.department, b.department) || collator.compare(a.major, b.major);
    });
  }

  function fetchText(url, ms) {
    var ctl = 'AbortController' in window ? new AbortController() : null;
    var timer = ctl && setTimeout(function () { ctl.abort(); }, ms);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    });
  }

  function loadData() {
    renderUniState('loading');
    var live = 'https://docs.google.com/spreadsheets/d/' + CFG.sheetId + '/gviz/tq?tqx=out:csv&gid=' + (CFG.sheetGid || '0');
    return fetchText(live, 10000)
      .then(function (t) {
        if (/^\s*</.test(t)) throw new Error('not csv');
        return { text: t, snapshot: false };
      })
      .catch(function () {
        return fetchText('data/snapshot.csv', 10000).then(function (t) { return { text: t, snapshot: true }; });
      })
      .then(function (res) {
        build(parseCSV(res.text));
        if (!flat.length) throw new Error('empty');
        var note = $('dataNote');
        if (res.snapshot) {
          note.textContent = '지금은 구글 시트에 연결하지 못해서 ' + SNAPSHOT_DATE + '에 저장해 둔 자료를 보여 주고 있어요.';
          note.hidden = false;
        }
        renderUnis();
        restoreFromHash();
      })
      .catch(function () { renderUniState('error'); });
  }

  /* ---------- 차례로 고르기 ---------- */
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function renderUniState(kind) {
    var g = $('uniGrid');
    if (kind === 'loading') {
      g.innerHTML = '<p class="state">대학 목록을 불러오고 있어요</p>';
    } else {
      g.innerHTML = '<div class="state-box"><p>대학 목록을 불러오지 못했어요.<br>인터넷 연결을 확인하고 다시 시도해 주세요.</p>' +
        '<button class="dt-btn dt-btn--weak" type="button" id="retry">다시 불러오기</button></div>';
      $('retry').addEventListener('click', loadData);
    }
  }

  function makeOpt(label, pressed, uniName) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt';
    b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.innerHTML = CHECK + '<span>' + esc(label) + '</span>';
    b.dataset.value = label;
    if (uniName) applyUni(b, uniName);
    return b;
  }

  function renderUnis() {
    var g = $('uniGrid');
    g.innerHTML = '';
    sortKo(Object.keys(data)).forEach(function (u) {
      var b = makeOpt(u, u === sel.u, u);
      b.addEventListener('click', function () { pickUni(u, true); });
      g.appendChild(b);
    });
  }
  function renderDepts() {
    var g = $('deptGrid');
    g.innerHTML = '';
    sortKo(Object.keys(data[sel.u] || {})).forEach(function (d) {
      var b = makeOpt(d, d === sel.d, sel.u);
      b.addEventListener('click', function () { pickDept(d, true); });
      g.appendChild(b);
    });
  }
  function renderMajors() {
    var g = $('majorGrid');
    g.innerHTML = '';
    sortKo(Object.keys((data[sel.u] || {})[sel.d] || {})).forEach(function (m) {
      var b = makeOpt(m, m === sel.m, sel.u);
      b.addEventListener('click', function () { pickMajor(m, true); });
      g.appendChild(b);
    });
  }
  function markPressed(gridId, value) {
    $(gridId).querySelectorAll('.opt').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.value === value ? 'true' : 'false');
    });
  }
  function scrollTo(el) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.7) {
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }
  var isWide = function () { return window.matchMedia('(min-width: 1024px)').matches; };

  function pickUni(u, byUser) {
    sel = { u: u, d: '', m: '' };
    markPressed('uniGrid', u);
    renderDepts();
    $('step2').hidden = false;
    $('step3').hidden = true;
    clearResult();
    // 계열이 하나뿐이면 바로 다음 단계로
    var depts = Object.keys(data[u] || {});
    if (depts.length === 1) { pickDept(depts[0], byUser); return; }
    syncHash();
    if (byUser) scrollTo($('step2'));
  }
  function pickDept(d, byUser) {
    sel.d = d; sel.m = '';
    markPressed('deptGrid', d);
    renderMajors();
    $('step3').hidden = false;
    clearResult();
    syncHash();
    if (byUser) scrollTo($('step3'));
  }
  function pickMajor(m, byUser) {
    sel.m = m;
    markPressed('majorGrid', m);
    showResult({ university: sel.u, department: sel.d, major: m, subjects: data[sel.u][sel.d][m] });
    syncHash();
    if (byUser && !isWide()) scrollTo($('result'));
  }
  function resetTo(step) {
    if (step === 1) {
      sel = { u: '', d: '', m: '' };
      markPressed('uniGrid', '');
      $('step2').hidden = true;
      $('step3').hidden = true;
      scrollTo($('step1'));
    } else {
      sel.d = ''; sel.m = '';
      markPressed('deptGrid', '');
      $('step3').hidden = true;
    }
    clearResult();
    syncHash();
  }
  document.querySelectorAll('[data-reset]').forEach(function (b) {
    b.addEventListener('click', function () { resetTo(Number(b.dataset.reset)); });
  });

  /* ---------- 결과 ---------- */
  function clearResult() {
    $('resultBody').hidden = true;
    $('resultBody').innerHTML = '';
    $('resultEmpty').hidden = false;
    $('result').removeAttribute('style');
  }
  function groupHtml(title, cat, key) {
    var rows = AREAS.filter(function (a) { return cat[a] && cat[a].length; }).map(function (a) {
      return '<div class="row"><dt>' + AREA_NAMES[a] + '</dt><dd>' +
        cat[a].map(function (s) { return '<span class="tag' + (key ? ' tag--key' : '') + '">' + esc(s) + '</span>'; }).join('') +
        '</dd></div>';
    }).join('');
    return '<section class="group"><h3>' + title + '</h3>' +
      (rows ? '<dl class="rows">' + rows + '</dl>' : '<p class="none">대학이 따로 정한 과목이 없어요</p>') + '</section>';
  }
  function showResult(item) {
    var src = (CFG.sources || {})[item.university];
    var srcHtml = (src && src.url && src.url !== 'none')
      ? '<a class="link-row" href="' + esc(src.url) + '" target="_blank" rel="noopener">' +
          '<span class="t"><b>대학 원문 자료 보기</b><span>' + esc(src.title) + '</span></span>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>' +
        '</a>'
      : '';
    var body = $('resultBody');
    applyUni($('result'), item.university);
    body.innerHTML =
      '<div class="r-head"><p class="r-uni">' + esc(item.university) + ', ' + esc(item.department) + '</p>' +
      '<h2 class="r-major">' + esc(item.major) + '</h2></div>' +
      '<div class="r-body">' +
        groupHtml('핵심 권장 과목', item.subjects.required, true) +
        groupHtml('권장 과목', item.subjects.recommended, false) +
      '</div>' +
      '<div class="r-foot">' + srcHtml +
        '<div class="r-actions"><button class="dt-btn dt-btn--weak dt-btn--s" type="button" id="copyLink">이 결과 주소 복사하기</button></div>' +
      '</div>';
    $('resultEmpty').hidden = true;
    body.hidden = false;
    $('result').scrollTop = 0;
    $('copyLink').addEventListener('click', copyLink);
  }
  function copyLink(e) {
    var btn = e.currentTarget;
    var done = function () { btn.textContent = '주소를 복사했어요'; setTimeout(function () { btn.textContent = '이 결과 주소 복사하기'; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () {});
  }

  /* ---------- 주소에 선택 남기기 (공유용) ---------- */
  function syncHash() {
    var pk = $('pick');
    pk.classList.toggle('has-u', !!sel.u);
    pk.classList.toggle('has-d', !!sel.d);
    var p = [];
    if (sel.u) p.push('u=' + encodeURIComponent(sel.u));
    if (sel.d) p.push('d=' + encodeURIComponent(sel.d));
    if (sel.m) p.push('m=' + encodeURIComponent(sel.m));
    var h = p.length ? '#' + p.join('&') : '';
    if (location.hash !== h) history.replaceState(null, '', location.pathname + location.search + h);
  }
  function restoreFromHash() {
    var q = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
    });
    if (q.u && data[q.u]) {
      pickUni(q.u, false);
      if (q.d && data[q.u][q.d]) {
        if (sel.d !== q.d) pickDept(q.d, false);
        if (q.m && data[q.u][q.d][q.m]) pickMajor(q.m, false);
      }
    }
  }

  /* ---------- 찾기 ---------- */
  document.querySelectorAll('input[name="stype"]').forEach(function (r) {
    r.addEventListener('change', function () {
      stype = r.value;
      $('q').placeholder = stype === 'major' ? '예: 컴퓨터, 경영, 의예과' : '예: 미적분, 물리학, 확률과 통계';
      $('searchHint').textContent = '';
      if (lastQuery) runSearch(lastQuery);
    });
  });
  $('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = $('q').value.trim();
    var hint = $('searchHint');
    if (norm(q).length < 2) {
      hint.textContent = '2글자 이상 입력해 주세요';
      hint.classList.add('is-error');
      $('q').focus();
      return;
    }
    hint.textContent = '';
    hint.classList.remove('is-error');
    runSearch(q);
  });
  $('q').addEventListener('input', function () {
    var hint = $('searchHint');
    if (hint.classList.contains('is-error')) { hint.textContent = ''; hint.classList.remove('is-error'); }
  });

  function allSubjects(item) {
    var out = [];
    ['required', 'recommended'].forEach(function (t) {
      AREAS.forEach(function (a) { out.push.apply(out, item.subjects[t][a] || []); });
    });
    return out;
  }
  function runSearch(q) {
    lastQuery = q;
    var nq = norm(q);
    if (!flat.length) {
      $('searchOut').innerHTML = '<p class="result-count">자료를 아직 불러오는 중이에요. 잠시 뒤 다시 찾아 주세요.</p>';
      return;
    }
    hits = flat.filter(function (it) {
      if (stype === 'major') return norm(it.major).indexOf(nq) >= 0;
      return allSubjects(it).some(function (s) { return norm(s).indexOf(nq) >= 0; });
    });
    shown = 0;
    var out = $('searchOut');
    if (!hits.length) {
      out.innerHTML = '<div class="state-box"><p>「' + esc(q) + '」' + (stype === 'major' ? ' 학과를' : ' 과목을') +
        ' 찾지 못했어요.<br>더 짧게 입력하거나 ' + (stype === 'major' ? '과목명' : '학과명') + '으로 바꿔 찾아보세요.</p></div>';
      return;
    }
    out.innerHTML = '<p class="result-count"><b class="num">' + hits.length + '</b>곳을 찾았어요</p><ul class="hits" id="hitList"></ul>' +
      '<button class="dt-btn dt-btn--weak dt-btn--block more" type="button" id="moreBtn" hidden></button>';
    $('moreBtn').addEventListener('click', renderMore);
    renderMore();
  }
  function renderMore() {
    var list = $('hitList');
    var end = Math.min(shown + PAGE, hits.length);
    var nq = lastQuery;
    var frag = document.createDocumentFragment();
    hits.slice(shown, end).forEach(function (it, i) {
      var subs = allSubjects(it);
      var tags;
      if (stype === 'subject') {
        var matched = subs.filter(function (s) { return norm(s).indexOf(norm(nq)) >= 0; });
        tags = matched.slice(0, 6).map(function (s) { return '<span class="tag">' + highlight(s, nq) + '</span>'; }).join('');
      } else {
        tags = subs.slice(0, 6).map(function (s) { return '<span class="tag">' + esc(s) + '</span>'; }).join('') +
          (subs.length > 6 ? '<span class="tag">그 밖에 ' + (subs.length - 6) + '개</span>' : '');
      }
      var li = document.createElement('li');
      li.innerHTML = '<button class="hit" type="button">' +
        '<span class="hit-title">' + (stype === 'major' ? highlight(it.major, nq) : esc(it.major)) + '</span>' +
        '<span class="hit-path"><span class="dot" style="' + uniVars(it.university) + '"></span>' + esc(it.university) + ', ' + esc(it.department) + '</span>' +
        (tags ? '<span class="hit-tags">' + tags + '</span>' : '') +
        '</button>';
      li.firstChild.addEventListener('click', function () { openHit(it); });
      frag.appendChild(li);
    });
    list.appendChild(frag);
    shown = end;
    var more = $('moreBtn');
    var left = hits.length - shown;
    more.hidden = left <= 0;
    more.textContent = left > 0 ? Math.min(left, PAGE) + '곳 더 보기' : '';
  }
  function openHit(it) {
    pickUni(it.university, false);
    if (sel.d !== it.department) pickDept(it.department, false);
    pickMajor(it.major, false);
    if (!isWide()) $('result').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- 조회수 ---------- */
  function loadViews() {
    var api = CFG.viewsApi;
    var params = new URLSearchParams(location.search);
    if (!api) return;
    var hit = 1;
    try {
      if (params.has('noview') || sessionStorage.getItem('viewed2028')) hit = 0;
    } catch (e) { /* 저장소를 못 쓰면 그냥 셈 */ }
    fetchText(api + '?api=views&hit=' + hit, 8000)
      .then(function (t) {
        var s = JSON.parse(t);
        if (typeof s.today !== 'number') return;
        $('viewsToday').textContent = s.today.toLocaleString('ko-KR');
        $('viewsTotal').textContent = s.total.toLocaleString('ko-KR');
        $('views').hidden = false;
        try { if (hit) sessionStorage.setItem('viewed2028', '1'); } catch (e) {}
      })
      .catch(function () { /* 조회수는 숨긴 채로 둔다 */ });
  }

  loadData();
  loadViews();
})();
