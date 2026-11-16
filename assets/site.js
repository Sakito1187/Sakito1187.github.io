/*
  トップとアプリのページで使う、言語とダークモードの切り替え
  - 文は日本語と英語を両方書いておき、data-lang="ja" / data-lang="en" で出し分ける（CSS で今の言語でないほうを隠す）
  - 画像・動画・リンクで言語ごとに変えたいところは data-i18n-src / data-i18n-poster / data-i18n-href に {lang} を入れて書く
  - <title> は <html data-title-en="..."> に英語の題を書いておくと、英語のときにかわる
  - 言語は ?lang=en > 前に選んだもの > ブラウザの言語 の順で決める
  head の中で読み込む（言語を描画の前に決めて、ちらつかないようにする）
*/
(function () {
  var LANGS = ['ja', 'en'];
  var root = document.documentElement;
  var titleJa = null;

  function stored() {
    try { return localStorage.getItem('lang'); } catch (e) { return null; }
  }
  function store(l) {
    try { localStorage.setItem('lang', l); } catch (e) { /* 保存できないときは何もしない */ }
  }
  function pick() {
    var q = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(q) >= 0) return q;
    var s = stored();
    if (LANGS.indexOf(s) >= 0) return s;
    return /^ja\b/i.test(navigator.language || 'ja') ? 'ja' : 'en';
  }

  function apply(l) {
    root.lang = l;
    document.querySelectorAll('[data-i18n-src]').forEach(function (el) {
      var src = el.getAttribute('data-i18n-src').replace('{lang}', l);
      if (el.getAttribute('src') === src) return;
      el.setAttribute('src', src);
      // 動画の <source> をかえたときは、読みなおさないと反映されない
      if (el.tagName === 'SOURCE' && el.parentNode.load) el.parentNode.load();
    });
    document.querySelectorAll('[data-i18n-poster]').forEach(function (el) {
      el.poster = el.getAttribute('data-i18n-poster').replace('{lang}', l);
    });
    document.querySelectorAll('[data-i18n-href]').forEach(function (el) {
      el.href = el.getAttribute('data-i18n-href').replace('{lang}', l);
    });
    document.querySelectorAll('select.lang-select').forEach(function (s) { s.value = l; });
    if (titleJa === null) titleJa = document.title;
    document.title = l === 'en' && root.dataset.titleEn ? root.dataset.titleEn : titleJa;
  }

  // ダークモードは端末の設定にあわせる（Bootstrap の data-bs-theme）
  var dark = window.matchMedia('(prefers-color-scheme: dark)');
  function theme() { root.setAttribute('data-bs-theme', dark.matches ? 'dark' : 'light'); }
  theme();
  if (dark.addEventListener) dark.addEventListener('change', theme);

  var lang = pick();
  root.lang = lang;

  document.addEventListener('DOMContentLoaded', function () {
    apply(lang);
    document.querySelectorAll('select.lang-select').forEach(function (s) {
      s.addEventListener('change', function () {
        lang = s.value;
        store(lang);
        apply(lang);
      });
    });
  });
})();
