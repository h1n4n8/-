/* ==========================================================================
   共通スクリプト：メニュー開閉／お問い合わせフォームの入力チェック
   ========================================================================== */
(function () {
  "use strict";

  /* スマホメニュー */
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("gnav");
  if (btn && nav) {
    var setOpen = function (open) {
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector(".menu-btn-label").textContent = open ? "閉じる" : "メニュー";
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };
    btn.addEventListener("click", function () {
      setOpen(btn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); btn.focus(); }
    });
    window.matchMedia("(min-width: 1200px)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* お問い合わせフォーム
     ※仮サイトのため送信先はありません。本番では action 属性に送信先を設定してください【仮】 */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var rules = {
      name: function (v) { return v.trim() ? "" : "お名前を入力してください。"; },
      tel: function (v) {
        if (!v.trim()) return "電話番号を入力してください。";
        return /^[0-9０-９\-－()（）\s+]{10,}$/.test(v.trim()) ? "" : "電話番号の形式をご確認ください。";
      },
      email: function (v) {
        if (!v.trim()) return "";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "メールアドレスの形式をご確認ください。";
      },
      message: function (v) { return v.trim() ? "" : "ご相談内容を入力してください。"; },
      agree: function (_, el) { return el.checked ? "" : "個人情報の取り扱いへの同意が必要です。"; }
    };

    var check = function (el) {
      var rule = rules[el.name];
      if (!rule) return true;
      var msg = rule(el.value, el);
      var row = el.closest(".form-row");
      var out = row && row.querySelector(".error-msg");
      if (row) row.classList.toggle("has-error", !!msg);
      if (out) out.textContent = msg;
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    };

    /* エラー表示中の項目だけ、入力に合わせて再チェックしてエラーを消す
       （フォーカスが外れたときにチェックすると、表示が動いて次のクリックがずれるため） */
    var recheck = function (e) {
      var el = e.target;
      var row = el.closest && el.closest(".form-row");
      if (el.name && rules[el.name] && row && row.classList.contains("has-error")) check(el);
    };
    form.addEventListener("input", recheck);
    form.addEventListener("change", recheck);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var el = form.elements[name];
        if (el && !check(el) && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }
      var done = document.querySelector("[data-form-done]");
      form.hidden = true;
      if (done) {
        done.hidden = false;
        done.setAttribute("tabindex", "-1");
        done.focus();
        done.scrollIntoView({ block: "center" });
      }
    });
  }
})();
