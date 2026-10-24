// share.js — версия 1.0.0
// Общая библиотека «Поделиться» проекта «Классик».
// Web Component <klassik-share>: оборачивает пользовательскую кнопку,
// обрабатывает navigator.share и показывает модалку с 4 веб-почтами,
// копированием текста и копированием ссылки.
//
// Контракт атрибутов:
//   catalog            — идентификатор справочника (для аналитики);
//                        если не задан — вычисляется из пути URL
//   title              — заголовок для share/mail (default: document.title)
//   text               — тело сообщения (обычно «код; название»)
//   url                — deep-link на карточку (default: location.href)
//   fallback-on-abort  — "false" отключает модалку при AbortError
//                        (по умолчанию — модалка, как в стандарте §7)
//
// Событие: CustomEvent('klassik-share', { detail: { catalog, method,
//          email_provider?, text, url } }) — bubbles + composed.
//
// Аналитика: шлёт события в уже существующие window.ym / window.gtag.
// Сам счётчики НЕ грузит — это делает menu.js на странице.

(() => {
  'use strict';

  const METRIKA_COUNTER_ID = 105817342;

  // ---------- вспомогательное ----------

  function detectCatalog() {
    const path = window.location.pathname.replace(/index\.html$/i, '');
    const normalized = path.endsWith('/') ? path : path + '/';
    // Порядок важен: okpd2-pp1875 до okpd2
    const match = normalized.match(
      /^\/(okpd2-pp1875|okpd2|oktmo|okved2|okato|okei|okogu|okopf|okfs|okv|oksm|okof|okz|okso)\//
    );
    return match ? match[1] : 'other';
  }

  function sendAnalytics(catalog, method, emailProvider) {
    const detail = { catalog, method };
    if (emailProvider) detail.email_provider = emailProvider;

    try {
      if (typeof window.ym === 'function') {
        window.ym(METRIKA_COUNTER_ID, 'reachGoal', 'share', detail);
      }
    } catch (e) { /* no-op */ }

    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'share', detail);
      }
    } catch (e) { /* no-op */ }
  }

  function buildEmailLinks(subject, body) {
    const s = encodeURIComponent(subject || '');
    const b = encodeURIComponent(body || '');
    return {
      gmail: 'https://mail.google.com/mail/?view=cm&fs=1&su=' + s + '&body=' + b,
      yandex: 'https://mail.yandex.ru/compose?subject=' + s + '&body=' + b,
      mailru: 'https://e.mail.ru/compose/?subject=' + s + '&body=' + b,
      rambler: 'https://mail.rambler.ru/mail/compose?subject=' + s + '&body=' + b
    };
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function copyToClipboard(text) {
    return new Promise((resolve) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => resolve(true))
          .catch(() => resolve(fallbackCopy(text)));
      } else {
        resolve(fallbackCopy(text));
      }
    });
  }

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ---------- компонент ----------

  class KlassikShare extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._onClickBound = this._handleClick.bind(this);
      this._onKeyDownBound = this._handleKeyDown.bind(this);
      this._toastTimer = null;
    }

    connectedCallback() {
      if (!this.shadowRoot.firstChild) this.render();
      this.shadowRoot.addEventListener('click', this._onClickBound);
      document.addEventListener('keydown', this._onKeyDownBound);
    }

    disconnectedCallback() {
      this.shadowRoot.removeEventListener('click', this._onClickBound);
      document.removeEventListener('keydown', this._onKeyDownBound);
      clearTimeout(this._toastTimer);
    }

    // ----- геттеры атрибутов с fallback -----
    get catalog() {
      return this.getAttribute('catalog') || detectCatalog();
    }
    get shareTitle() {
      return this.getAttribute('title') || document.title || 'Поделиться';
    }
    get shareText() {
      return this.getAttribute('text') || '';
    }
    get shareUrl() {
      return this.getAttribute('url') || location.href;
    }

    // ----- обработка клика по слоту -----
    _handleClick(event) {
      const path = event.composedPath();

      // Игнорируем клики внутри собственной модалки/тоста
      for (const el of path) {
        if (el === this.shadowRoot) break;
        if (el && el.nodeType === 1 && el.classList) {
          if (el.classList.contains('ks-modal') ||
              el.classList.contains('ks-toast') ||
              el.classList.contains('ks-backdrop')) {
            return;
          }
        }
      }

      // Реагируем только на кнопки/ссылки/role=button из слота
      const first = path[0];
      if (!first || first.nodeType !== 1) return;
      if (first.tagName !== 'BUTTON' &&
          first.tagName !== 'A' &&
          first.getAttribute('role') !== 'button') {
        return;
      }

      event.preventDefault();
      this._doShare();
    }

    async _doShare() {
      const title = this.shareTitle;
      const text = this.shareText;
      const url = this.shareUrl;
      const catalog = this.catalog;

      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title, text, url });
          this._emit('native', null, catalog, text, url);
          return;
        } catch (err) {
          const isAbort = err && err.name === 'AbortError';
          const fallbackOnAbort = this.getAttribute('fallback-on-abort') !== 'false';

          if (isAbort && !fallbackOnAbort) {
            // Пользователь явно передумал — тихо завершаемся
            this._emit('native_cancelled', null, catalog, text, url);
            return;
          }
          // Иначе (нет API / другая ошибка / AbortError при fallback=true) — модалка
        }
      }

      this._openModal();
    }

    _openModal() {
      const modal = this.shadowRoot.querySelector('.ks-modal');
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      const closeBtn = modal.querySelector('.ks-close');
      if (closeBtn && closeBtn.focus) closeBtn.focus();
    }

    _closeModal() {
      const modal = this.shadowRoot.querySelector('.ks-modal');
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }

    _handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      const modal = this.shadowRoot.querySelector('.ks-modal.is-open');
      if (modal) {
        event.preventDefault();
        this._closeModal();
      }
    }

    _handleAction(action) {
      const catalog = this.catalog;
      const text = this.shareText;
      const url = this.shareUrl;

      if (action === 'copy_text') {
        copyToClipboard(text + '\n\n' + url).then((ok) => {
          if (ok) this._toast('Текст и ссылка скопированы');
          this._emit('copy_text', null, catalog, text, url);
        });
      } else if (action === 'copy_url') {
        copyToClipboard(url).then((ok) => {
          if (ok) this._toast('Ссылка скопирована');
          this._emit('copy_url', null, catalog, text, url);
        });
      }
    }

    _emit(method, emailProvider, catalog, text, url) {
      sendAnalytics(catalog, method, emailProvider);
      this.dispatchEvent(new CustomEvent('klassik-share', {
        bubbles: true,
        composed: true,
        detail: { catalog, method, email_provider: emailProvider || null, text, url }
      }));
    }

    _toast(message) {
      const toast = this.shadowRoot.querySelector('.ks-toast');
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('is-visible');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 1800);
    }

    // ----- рендер -----

    getStyles() {
      return `
        <style>
          :host { display: inline-block; }
          :host([hidden]) { display: none !important; }

          .ks-modal {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                         "Helvetica Neue", Arial, sans-serif;
          }
          .ks-modal.is-open { display: flex; }

          .ks-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(15, 23, 42, 0.55);
            animation: ks-fade-in 0.15s ease;
          }

          .ks-dialog {
            position: relative;
            background: #ffffff;
            border-radius: 16px;
            padding: 24px;
            width: 90%;
            max-width: 520px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
            gap: 12px;
            animation: ks-pop-in 0.2s ease;
            max-height: 90vh;
            overflow-y: auto;
            box-sizing: border-box;
            color: #1e293b;
          }

          @keyframes ks-fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes ks-pop-in {
            from { transform: scale(0.96); opacity: 0; }
            to   { transform: scale(1);    opacity: 1; }
          }

          .ks-close {
            position: absolute;
            top: 10px;
            right: 12px;
            background: none;
            border: none;
            font-size: 26px;
            line-height: 1;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 6px;
            font-family: inherit;
          }
          .ks-close:hover { color: #475569; background: #f1f5f9; }
          .ks-close:focus-visible { outline: 2px solid #1e3a8a; outline-offset: 2px; }

          .ks-title {
            margin: 0;
            padding-right: 30px;
            font-size: 18px;
            color: #0f172a;
          }
          .ks-hint {
            margin: 0;
            font-size: 13px;
            color: #64748b;
            line-height: 1.4;
          }
          .ks-textarea {
            width: 100%;
            min-height: 130px;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: 13px;
            line-height: 1.5;
            color: #334155;
            background: #f8fafc;
            box-sizing: border-box;
            resize: vertical;
          }
          .ks-label {
            font-size: 13px;
            color: #64748b;
            margin: 4px 0 -2px;
          }

          .ks-btn {
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            color: #334155;
            font: inherit;
            font-size: 14px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background 0.15s, border-color 0.15s, filter 0.15s;
          }
          .ks-btn:hover { background: #f1f5f9; border-color: #94a3b8; }
          .ks-btn:focus-visible { outline: 2px solid #1e3a8a; outline-offset: 2px; }

          .ks-btn--primary {
            flex: 1 1 auto;
            /* Наследует --accent со страницы (ОКСО — зелёный, ОКПД2 — синий и т.д.) */
            background: var(--accent, #1e3a8a);
            border-color: var(--accent, #1e3a8a);
            color: #ffffff;
            font-weight: 600;
          }
          .ks-btn--primary:hover {
            background: var(--accent, #1e3a8a);
            border-color: var(--accent, #1e3a8a);
            filter: brightness(0.88);
            color: #ffffff;
          }

          .ks-mail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .ks-mail-grid a {
            text-align: center;
            padding: 9px 12px;
            font-size: 13px;
            background: #ffffff;
            color: #334155;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            text-decoration: none;
            transition: background 0.15s, border-color 0.15s;
          }
          .ks-mail-grid a:hover { background: #f8fafc; border-color: #94a3b8; }
          .ks-mail-grid a:focus-visible { outline: 2px solid #1e3a8a; outline-offset: 2px; }

          .ks-toast {
            position: fixed;
            left: 50%;
            bottom: 24px;
            transform: translateX(-50%) translateY(20px);
            background: #0f172a;
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 14px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s, transform 0.2s;
            z-index: 10001;
            white-space: nowrap;
            max-width: 90vw;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          }
          .ks-toast.is-visible {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }

          @media (max-width: 640px) {
            .ks-dialog { padding: 20px; }
            .ks-mail-grid { grid-template-columns: 1fr; }
          }
        </style>
      `;
    }

    render() {
      const title = this.shareTitle;
      const text = this.shareText;
      const url = this.shareUrl;
      const body = text + (text ? '\n\n' : '') + url;
      const emailLinks = buildEmailLinks(title, body);

      this.shadowRoot.innerHTML = `
        ${this.getStyles()}
        <slot></slot>

        <div class="ks-modal" role="dialog" aria-modal="true"
             aria-hidden="true" aria-labelledby="ks-title">
          <div class="ks-backdrop" data-ks-close></div>
          <div class="ks-dialog">
            <button type="button" class="ks-close" aria-label="Закрыть"
                    title="Закрыть" data-ks-close>×</button>
            <h3 class="ks-title" id="ks-title">Поделиться</h3>
            <p class="ks-hint">Скопируйте текст и ссылку или отправьте через веб-почту.</p>

            <textarea class="ks-textarea" readonly aria-label="Текст для отправки"></textarea>

            <button type="button" class="ks-btn ks-btn--primary"
                    data-ks-action="copy_text">
              📋 Скопировать текст и ссылку
            </button>
            <button type="button" class="ks-btn" data-ks-action="copy_url">
              🔗 Скопировать только ссылку
            </button>

            <div class="ks-label">Отправить через веб-почту:</div>
            <div class="ks-mail-grid">
              <a href="${escHtml(emailLinks.gmail)}" target="_blank"
                 rel="noopener" data-ks-action="email_gmail"
                 data-ks-provider="gmail">Gmail</a>
              <a href="${escHtml(emailLinks.yandex)}" target="_blank"
                 rel="noopener" data-ks-action="email_yandex"
                 data-ks-provider="yandex">Яндекс.Почта</a>
              <a href="${escHtml(emailLinks.mailru)}" target="_blank"
                 rel="noopener" data-ks-action="email_mailru"
                 data-ks-provider="mailru">Mail.ru</a>
              <a href="${escHtml(emailLinks.rambler)}" target="_blank"
                 rel="noopener" data-ks-action="email_rambler"
                 data-ks-provider="rambler">Рамблер</a>
            </div>
          </div>
        </div>

        <div class="ks-toast" role="status" aria-live="polite"></div>
      `;

      // Закрытие (крестик + фон)
      this.shadowRoot.querySelectorAll('[data-ks-close]').forEach((el) => {
        el.addEventListener('click', () => this._closeModal());
      });

      // Действия внутри модалки
      this.shadowRoot.querySelectorAll('[data-ks-action]').forEach((el) => {
        el.addEventListener('click', (e) => {
          const action = el.getAttribute('data-ks-action');
          const catalog = this.catalog;
          const sText = this.shareText;
          const sUrl = this.shareUrl;

          if (action.indexOf('email_') === 0) {
            const provider = el.getAttribute('data-ks-provider') || 'unknown';
            sendAnalytics(catalog, 'email', provider);
            this.dispatchEvent(new CustomEvent('klassik-share', {
              bubbles: true,
              composed: true,
              detail: {
                catalog,
                method: 'email',
                email_provider: provider,
                text: sText,
                url: sUrl
              }
            }));
            // Ссылка откроется в новой вкладке сама — модалку закроем чуть позже
            setTimeout(() => this._closeModal(), 250);
          } else {
            e.preventDefault();
            this._handleAction(action);
          }
        });
      });

      // Заполняем textarea реальным текстом
      const ta = this.shadowRoot.querySelector('.ks-textarea');
      if (ta) {
        ta.value = body;
        ta.addEventListener('click', () => ta.select());
      }
    }
  }

  if (!customElements.get('klassik-share')) {
    customElements.define('klassik-share', KlassikShare);
  }

  console.log('✅ share.js v1.0.0 загружен');
})();