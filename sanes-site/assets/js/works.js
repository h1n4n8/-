/* ==========================================================================
   施工事例・お客様の声の描画（データは works-data.js）
   ========================================================================== */
(function () {
  "use strict";

  var works = window.SANES_WORKS || [];
  var TMP = '<span class="tmp">【仮】</span>';

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function detailUrl(w) {
    return "works-detail.html?id=" + encodeURIComponent(w.id);
  }

  function card(w) {
    return (
      '<li class="work-card">' +
      '<a class="work-link" href="' + detailUrl(w) + '">' +
      '<div class="work-img"><img src="' + esc(w.images.after.src) + '" alt="' + esc(w.images.after.alt) +
      '" width="1200" height="800" loading="lazy" decoding="async"></div>' +
      '<div class="work-body">' +
      '<ul class="tags"><li class="tag tag-service">' + esc(w.service) + "</li>" +
      '<li class="tag">' + esc(w.industry) + "</li>" +
      '<li class="tag">' + esc(w.area) + "</li></ul>" +
      '<h3 class="work-title">' + esc(w.title) + (w.tmp ? TMP : "") + "</h3>" +
      '<dl class="spec">' +
      "<dt>機種</dt><dd>" + esc(w.model) + "</dd>" +
      "<dt>台数</dt><dd>" + esc(w.units) + "台</dd>" +
      "<dt>工期</dt><dd>" + esc(w.period) + "</dd>" +
      "<dt>費用目安</dt><dd>" + esc(w.cost) + "</dd>" +
      "</dl></div></a></li>"
    );
  }

  function voice(w) {
    return (
      '<li><figure class="voice">' +
      "<blockquote><p>" + esc(w.voice.text) + "</p></blockquote>" +
      "<figcaption><span>" + esc(w.industry) + "（" + esc(w.area) + "）" + esc(w.voice.name) + "</span>" +
      (w.tmp ? TMP : "") +
      '<a href="' + detailUrl(w) + '">事例を見る</a></figcaption>' +
      "</figure></li>"
    );
  }

  /* トップ：施工事例（featured） */
  var featuredEl = document.querySelector("[data-works-featured]");
  if (featuredEl) {
    var limit = parseInt(featuredEl.getAttribute("data-works-featured"), 10) || 4;
    featuredEl.innerHTML = works.filter(function (w) { return w.featured; }).slice(0, limit).map(card).join("");
  }

  /* お客様の声 */
  var voicesEl = document.querySelector("[data-voices]");
  if (voicesEl) {
    var vLimit = parseInt(voicesEl.getAttribute("data-voices"), 10) || 3;
    voicesEl.innerHTML = works.filter(function (w) { return w.voice; }).slice(0, vLimit).map(voice).join("");
  }

  /* 一覧（業種で絞り込み） */
  var listEl = document.querySelector("[data-works-list]");
  var filterEl = document.querySelector("[data-works-filter]");
  if (listEl) {
    var render = function (cat) {
      var list = cat === "all" ? works : works.filter(function (w) { return w.category === cat; });
      listEl.innerHTML = list.length ? list.map(card).join("") : "<li>該当する事例はまだありません。</li>";
    };
    if (filterEl) {
      var cats = [];
      works.forEach(function (w) { if (cats.indexOf(w.category) < 0) cats.push(w.category); });
      filterEl.innerHTML = ['<button type="button" data-cat="all" aria-pressed="true">すべて（' + works.length + "）</button>"]
        .concat(cats.map(function (c) {
          var n = works.filter(function (w) { return w.category === c; }).length;
          return '<button type="button" data-cat="' + esc(c) + '" aria-pressed="false">' + esc(c) + "（" + n + "）</button>";
        })).join("");
      filterEl.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-cat]");
        if (!btn) return;
        filterEl.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        render(btn.getAttribute("data-cat"));
      });
    }
    render("all");
  }

  /* 詳細 */
  var detailEl = document.querySelector("[data-work-detail]");
  if (detailEl) {
    var id = new URLSearchParams(location.search).get("id");
    var w = works.filter(function (x) { return x.id === id; })[0] || works[0];
    if (!w) return;

    var heading = w.industry + "（" + w.area + "）の施工事例";
    document.title = w.title + "｜" + heading + "｜株式会社サンエス";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", w.industry + "（" + w.area + "）での業務用エアコン" + w.service + "の事例。" + w.model + "・" + w.units + "台、工期" + w.period + "。お困りごととご提案内容、お客様の声をご紹介します。");
    var crumb = document.querySelector("[data-crumb-current]");
    if (crumb) crumb.textContent = w.title;

    var set = function (key, html) {
      var el = detailEl.querySelector('[data-f="' + key + '"]');
      if (el) el.innerHTML = html;
    };
    set("tags", '<li class="tag tag-service">' + esc(w.service) + '</li><li class="tag">' + esc(w.category) + "</li>" + (w.tmp ? '<li class="tag">サンプル事例【仮】</li>' : ""));
    set("title", esc(w.title));
    set("sub", esc(w.industry) + "／" + esc(w.area));
    set("before", '<img src="' + esc(w.images.before.src) + '" alt="' + esc(w.images.before.alt) + '" width="1200" height="800" decoding="async">');
    set("after", '<img src="' + esc(w.images.after.src) + '" alt="' + esc(w.images.after.alt) + '" width="1200" height="800" decoding="async">');
    set("problem", "<p>" + esc(w.problem) + "</p>");
    set("proposal", "<p>" + esc(w.proposal) + "</p>");
    set("voice", w.voice ? "<blockquote><p>" + esc(w.voice.text) + "</p></blockquote><figcaption>" + esc(w.industry) + "（" + esc(w.area) + "）" + esc(w.voice.name) + "</figcaption>" : "");
    set("spec",
      "<tr><th>業種</th><td>" + esc(w.industry) + "</td></tr>" +
      "<tr><th>地域</th><td>" + esc(w.area) + "</td></tr>" +
      "<tr><th>工事区分</th><td>" + esc(w.service) + "</td></tr>" +
      "<tr><th>機種</th><td>" + esc(w.model) + "</td></tr>" +
      "<tr><th>台数</th><td>" + esc(w.units) + "台</td></tr>" +
      "<tr><th>工期</th><td>" + esc(w.period) + "</td></tr>" +
      "<tr><th>費用目安</th><td>" + esc(w.cost) + (w.tmp ? TMP : "") + "</td></tr>"
    );

    var others = works.filter(function (x) { return x.id !== w.id; });
    var same = others.filter(function (x) { return x.category === w.category; });
    var rest = others.filter(function (x) { return x.category !== w.category; });
    var relEl = document.querySelector("[data-works-related]");
    if (relEl) relEl.innerHTML = same.concat(rest).slice(0, 3).map(card).join("");
  }
})();
