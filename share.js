// share.js — версия 1.0.0
// Общая библиотека «Поделиться» проекта «Классик».
// На мобильных устройствах вызывает системное меню (navigator.share).
// На десктопах открывает модалку с 4 веб-почтами и копированием.

(() => {
  'use strict';

  const METRIKA_COUNTER_ID = 105817342;

  // ---------- вспомогательное ----------

  function detectCatalog() {
    const path = window.location.pathname.replace(/index\.html$/i, '');
    const normalized = path.endsWith('/') ? path : path + '/';
    const match = normalized.match(
      /^\/(okpd2-pp1875|okpd2|oktmo|okved2|okato|okei|okogu|okopf|okfs|okv|oksm|okof|okz|okso)\//
    );
    return match ? match[1] : 'other';
  }

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)); // iPadOS
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

      // На мобильных устройствах приоритет — системное меню
      if (isMobileDevice() && typeof navigator.share === 'function') {
        try {
          await navigator.share({ title, text, url });
          this._emit('native', null, catalog, text, url);
          return;
        } catch (err) {
          const isAbort = err && err.name === 'AbortError';
          if (isAbort) {
            // Пользователь передумал делиться — тихо закрываемся
            this._emit('native_cancelled', null, catalog, text, url);
            return;
          }
          // Если произошла ошибка (нет приложений и т.д.) — падаем в модалку
        }
      }

      // На десктопе (или если системное меню не сработало) — открываем модалку
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
          if (ok) this._toast('Текст и ссылка скопированы!');
          this._emit('copy_text', null, catalog, text, url);
        });
      } else if (action === 'native') {
        // Пользователь нажал "Открыть системное меню" внутри модалки
        if (typeof navigator.share === 'function') {
          navigator.share({ title: this.shareTitle, text, url })
            .then(() => {
              this._emit('native', null, catalog, text, url);
              this._closeModal();
            })
            .catch((err) => {
              if (err.name !== 'AbortError') {
                console.log('Share failed:', err);
              }
            });
        }
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
      }, 2000);
    }

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
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          }
          .ks-modal.is-open { display: flex; }

          .ks-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            animation: ks-fade-in 0.15s ease;
          }

          .ks-dialog {
            position: relative;
            background: #ffffff;
            border-radius: 16px;
            padding: 24px;
            width: 90%;
            max-width: 520px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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
            top: 12px;
            right: 16px;
            background: none;
            border: none;
            font-size: 24px;
            line-height: 1;
            color: #a0aec0;
            cursor: pointer;
            padding: 0;
            font-family: inherit;
          }
          .ks-close:hover { color: #4a5568; }

          .ks-title {
            margin: 0;
            font-size: 18px;
            color: #0f172a;
          }
          .ks-hint {
            margin: 0;
            font-size: 13px;
            color: #718096;
            line-height: 1.5;
          }
          .ks-textarea {
            width: 100%;
            height: 160px;
            padding: 12px;
            border: 1px solid #cbd5e0;
            border-radius: 8px;
            font-family: var(--mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
            font-size: 13px;
            line-height: 1.5;
            color: #2d3748;
            background: #f7fafc;
            box-sizing: border-box;
            resize: vertical;
          }
          
          .ks-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 8px 12px;
            border-radius: 8px;
            font: inherit;
            font-size: 13px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.15s;
          }

          .ks-btn--primary {
            width: 100%;
            padding: 10px;
            font-size: 14px;
            font-weight: 600;
            border: 1px solid var(--accent, #1e3a8a);
            background: var(--accent, #1e3a8a);
            color: #ffffff;
          }
          .ks-btn--primary:hover {
            filter: brightness(0.9);
          }

          .ks-label {
            font-size: 13px;
            color: #718096;
            width: 100%;
            margin-bottom: -2px;
            margin-top: 4px;
          }

          .ks-mail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            width: 100%;
            margin-bottom: 6px;
          }
          .ks-mail-grid a {
            text-align: center;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 500;
            background: #fff;
            color: #2d3748;
            border: 1px solid #cbd5e0;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.15s;
          }
          .ks-mail-grid a:hover {
            background: #f7fafc;
            border-color: #a0aec0;
          }

          .ks-btn--native {
            display: none;
            width: 100%;
            margin-top: 4px;
            border: 1px dashed #cbd5e0;
            background: #f7fafc;
            color: #718096;
            font-size: 13px;
          }
          .ks-btn--native:hover {
            border-color: var(--accent, #1e3a8a);
            color: var(--accent, #1e3a8a);
            background: var(--accent-weak, #eaf2fb);
          }

          .ks-toast {
            position: fixed;
            left: 50%;
            bottom: 24px;
            transform: translateX(-50%) translateY(20px);
            background: #1a202c;
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
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
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

      // Кнопка "Открыть системное меню" показывается только если API доступно
      const hasNativeShare = typeof navigator.share === 'function';
      const nativeBtnStyle = hasNativeShare ? 'inline-flex' : 'none';

      this.shadowRoot.innerHTML = `
        ${this.getStyles()}
        <slot></slot>

        <div class="ks-modal" role="dialog" aria-modal="true"
             aria-hidden="true" aria-labelledby="ks-title">
          <div class="ks-backdrop" data-ks-close></div>
          <div class="ks-dialog">
            <button type="button" class="ks-close" aria-label="Закрыть"
                    title="Закрыть" data-ks-close>&times;</button>
            <h3 class="ks-title" id="ks-title">Отправить коллегам</h3>
            <p class="ks-hint">Полный текст карточки со ссылкой внизу. Можно скопировать и вставить в любой чат или почту.</p>

            <textarea class="ks-textarea" readonly aria-label="Текст для отправки"></textarea>

            <button type="button" class="ks-btn ks-btn--primary"
                    data-ks-action="copy_text">
              📋 Скопировать текст и ссылку
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

            <button type="button" class="ks-btn ks-btn--native"
                    data-ks-action="native" style="display: ${nativeBtnStyle};">
              📱 Открыть системное меню
            </button>
          </div>
        </div>

        <div class="ks-toast" role="status" aria-live="polite"></div>
      `;

      // Закрытие (крестик + фон)
      this.shadowRoot.querySelectorAll('[data-ks-close]').forEach((el) => {
        el.addEventListener('click', () => this._closeModal());
      });

      // Обработка кликов по кнопкам модалки
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
                catalog, method: 'email', email_provider: provider, text: sText, url: sUrl
              }
            }));
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