// menu.js - версия 2.2.0: компактное горизонтальное меню проекта «Классик» + ОКЕИ + Google Analytics
(() => {
  'use strict';

  const METRIKA_COUNTER_ID = 105817342;
  const GOOGLE_ANALYTICS_ID = 'G-SM54ENZHYS';

  // Конфигурация справочников
  const projectsCatalog = [
    {
      label: 'ПП 1875',
      title: 'ОКПД2 + ПП РФ № 1875',
      url: 'https://prog815.github.io/okpd2-pp1875/',
      match: '/okpd2-pp1875/',
      goal: 'nav_pp1875'
    },
    {
      label: 'ОКПД2',
      title: 'Справочник ОКПД2',
      url: 'https://prog815.github.io/okpd2/',
      match: '/okpd2/',
      goal: 'nav_okpd2'
    },
    {
      label: 'ОКВЭД2',
      title: 'Справочник ОКВЭД2',
      url: 'https://prog815.github.io/okved2/',
      match: '/okved2/',
      goal: 'nav_okved2'
    },
    {
      label: 'ОКТМО',
      title: 'Справочник ОКТМО',
      url: 'https://prog815.github.io/oktmo/',
      match: '/oktmo/',
      goal: 'nav_oktmo'
    },
    {
      label: 'ОКАТО',
      title: 'Справочник ОКАТО',
      url: 'https://prog815.github.io/okato/',
      match: '/okato/',
      goal: 'nav_okato'
    },
    {
      label: 'ОКЕИ',
      title: 'Справочник ОКЕИ',
      url: 'https://prog815.github.io/okei/',
      match: '/okei/',
      goal: 'nav_okei'
    },
    {
      label: 'ОКОГУ',
      title: 'Справочник ОКОГУ',
      url:   'https://prog815.github.io/okogu/',
      match: '/okogu/',
      goal:  'nav_okogu'
    },
    { 
      label:'ОКОПФ', 
      title:'Справочник ОКОПФ',
      url:'https://prog815.github.io/okopf/', 
      match:'/okopf/', 
      goal:'nav_okopf' 
    },
    {
      label: 'ОКФС',
      title: 'Справочник ОКФС',
      url: 'https://prog815.github.io/okfs/',
      match: '/okfs/',
      goal: 'nav_okfs'
    }
  ];

  // Единственная внешняя ссылка: ВК-сообщество «Классик»
  const communityLink = {
    url: 'https://vk.com/klassik_rf',
    desktopLabel: 'Мы в ВК',
    mobileLabel: 'ВК',
    title: 'ВК-сообщество «Классик»: новости проекта, обсуждения и обратная связь',
    ariaLabel: 'ВК-сообщество «Классик»: новости проекта, обсуждения и обратная связь',
    goal: 'social_vk'
  };

  // Google Analytics 4
  class GoogleAnalytics {
    static init() {
      if (window._commonMenuGoogleAnalyticsInitialized) {
        return;
      }

      window._commonMenuGoogleAnalyticsInitialized = true;

      // Отслеживаем клики по общему меню
      this.addClickTracking();

      const catalog = this.getCatalog();

      // Если Google Analytics уже была загружена где-то ранее,
      // повторно не грузим тег, но пробуем добавить catalog для будущих событий.
      if (typeof window.gtag === 'function') {
        window.gtag('config', GOOGLE_ANALYTICS_ID, {
          send_page_view: false,
          catalog: catalog
        });

        console.log(
          `ℹ️ Google Analytics уже была загружена. Добавили catalog=${catalog} без повторного page_view.`
        );

        return;
      }

      // Стандартная инициализация dataLayer и gtag
      window.dataLayer = window.dataLayer || [];

      window.gtag = function () {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());

      // Отправляем настройку GA4 вместе с параметром справочника
      window.gtag('config', GOOGLE_ANALYTICS_ID, {
        catalog: catalog
      });

      // Динамически добавляем скрипт Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;

      const parent = document.head || document.documentElement;

      if (parent) {
        parent.appendChild(script);
      }

      console.log(
        `✅ Google Analytics подключена через menu.js (ID: ${GOOGLE_ANALYTICS_ID}, catalog: ${catalog})`
      );
    }

    static getCatalog() {
      const path = window.location.pathname.replace(/index\.html$/i, '');
      const normalizedPath = path.endsWith('/') ? path : `${path}/`;

      // Порядок важен: okpd2-pp1875 должен идти раньше okpd2
      const match = normalizedPath.match(
        /^\/(okpd2-pp1875|okpd2|oktmo|okved2|okato|okei)\//
      );

      return match ? match[1] : 'other';
    }

    static addClickTracking() {
      if (window._commonMenuGoogleAnalyticsClicksAttached) {
        return;
      }

      window._commonMenuGoogleAnalyticsClicksAttached = true;

      document.addEventListener(
        'click',
        (event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          // composedPath нужен для корректной работы с Shadow DOM
          const path =
            typeof event.composedPath === 'function'
              ? event.composedPath()
              : [];

          const link =
            path.find((node) => node && node.nodeName === 'A') ||
            (event.target && event.target.closest
              ? event.target.closest('a')
              : null);

          if (!link) {
            return;
          }

          // Переиспользуем data-metrika-goal, который уже есть в меню
          const goal = link.getAttribute('data-metrika-goal');

          if (!goal || typeof window.gtag !== 'function') {
            return;
          }

          window.gtag('event', 'menu_click', {
            catalog: this.getCatalog(),
            goal: goal,
            link_url: link.href,
            link_text: (link.textContent || '').trim().slice(0, 100)
          });
        },
        true
      );
    }
  }

  // Яндекс.Метрика
  class YandexMetrika {
    static init() {
      // Если счетчик уже есть, повторно не инициализируем
      if (window.ym && window.ym.a) {
        return;
      }

      this.addGoalTracking();

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = `
        (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {
            if (document.scripts[j].src === r) {
              return;
            }
          }
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(${METRIKA_COUNTER_ID}, 'init', {
          ssr: true,
          webvisor: true,
          clickmap: true,
          ecommerce: "dataLayer",
          accurateTrackBounce: true,
          trackLinks: true
        });
      `;

      const noscript = document.createElement('noscript');
      noscript.innerHTML = `
        <div>
          <img
            src="https://mc.yandex.ru/watch/${METRIKA_COUNTER_ID}"
            style="position:absolute; left:-9999px;"
            alt=""
          />
        </div>
      `;

      const parent = document.head || document.documentElement;

      if (parent) {
        parent.appendChild(script);
        parent.appendChild(noscript);
      }

      console.log(`✅ Яндекс.Метрика подключена (счетчик: ${METRIKA_COUNTER_ID})`);
    }

    static addGoalTracking() {
      // Защита от повторного навешивания обработчика
      if (window._commonMenuMetrikaGoalsAttached) {
        return;
      }

      window._commonMenuMetrikaGoalsAttached = true;

      document.addEventListener(
        'click',
        (event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          // composedPath нужен для корректной работы с Shadow DOM
          const path =
            typeof event.composedPath === 'function'
              ? event.composedPath()
              : [];

          const link =
            path.find((node) => node && node.nodeName === 'A') ||
            (event.target && event.target.closest
              ? event.target.closest('a')
              : null);

          if (!link) {
            return;
          }

          const goal = link.getAttribute('data-metrika-goal');

          if (goal && window.ym) {
            window.ym(METRIKA_COUNTER_ID, 'reachGoal', goal);
          }
        },
        true
      );
    }
  }

  // Основной компонент меню
  class CommonProjectsMenu extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      // Рендерим только один раз
      if (!this.shadowRoot.firstChild) {
        this.render();
      }

      // Инициализируем Google Analytics при первом подключении компонента
      GoogleAnalytics.init();

      // Инициализируем Яндекс.Метрику при первом подключении компонента
      if (!window._commonMenuYandexMetrikaInitialized) {
        YandexMetrika.init();
        window._commonMenuYandexMetrikaInitialized = true;
      }
    }

    isCurrentPage(matchPath) {
      const path = window.location.pathname.replace(/index\.html$/i, '');
      const currentPath = path.endsWith('/') ? path : `${path}/`;
      return currentPath.startsWith(matchPath);
    }

    getStyles() {
      return `
        <style>
          :host {
            display: block;
            margin: 0;
          }

          .menu {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }

          .menu--sticky {
            position: sticky;
            top: 0;
            z-index: 1000;
          }

          .menu__items {
            display: flex;
            flex: 1 1 auto;
            min-width: 0;
            gap: 6px;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .menu__items::-webkit-scrollbar {
            display: none;
          }

          .menu__item {
            flex: 0 0 auto;
            display: inline-flex;
            align-items: center;
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid transparent;
            color: #334155;
            text-decoration: none;
            font-size: 14px;
            line-height: 1.2;
            white-space: nowrap;
          }

          .menu__item:hover {
            background: #f8fafc;
            color: #0f172a;
          }

          .menu__item:focus-visible,
          .menu__community:focus-visible {
            outline: 2px solid #1e3a8a;
            outline-offset: 2px;
          }

          .menu__item--active {
            background: #eaf2fb;
            border-color: #8fc1e8;
            color: #1e3a8a;
            font-weight: 600;
          }

          .menu__item--active:hover {
            background: #dcebf9;
          }

          .menu__community {
            flex: 0 0 auto;
            margin-left: auto;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 999px;
            background: #1e3a8a;
            color: #ffffff;
            text-decoration: none;
            font-size: 14px;
            line-height: 1.2;
            white-space: nowrap;
          }

          .menu__community:hover {
            background: #172e6e;
            color: #ffffff;
          }

          .menu__community-mobile {
            display: none;
          }

          @media (max-width: 640px) {
            .menu {
              padding: 6px 8px;
              gap: 6px;
            }

            .menu__item {
              padding: 5px 8px;
              font-size: 13px;
            }

            .menu__community {
              padding: 5px 8px;
              font-size: 13px;
            }

            .menu__community-desktop {
              display: none;
            }

            .menu__community-mobile {
              display: inline;
            }
          }
        </style>
      `;
    }

    render() {
      const stickyClass = this.hasAttribute('sticky') ? ' menu--sticky' : '';

      const menuItems = projectsCatalog
        .map((project) => {
          const isActive = this.isCurrentPage(project.match);

          return `
            <a
              class="menu__item${isActive ? ' menu__item--active' : ''}"
              href="${project.url}"
              title="${project.title}"
              ${isActive ? 'aria-current="page"' : ''}
              data-metrika-goal="${project.goal}"
            >
              ${project.label}
            </a>
          `;
        })
        .join('');

      const template = `
        ${this.getStyles()}

        <nav
          class="menu${stickyClass}"
          aria-label="Навигация по справочникам"
          data-menu-version="2.2.0"
          data-yandex-metrika="integrated"
          data-google-analytics="integrated"
          data-ga-measurement-id="${GOOGLE_ANALYTICS_ID}"
          data-counter-id="${METRIKA_COUNTER_ID}"
        >
          <div class="menu__items">
            ${menuItems}
          </div>

          <a
            class="menu__community"
            href="${communityLink.url}"
            target="_blank"
            rel="noopener noreferrer"
            title="${communityLink.title}"
            aria-label="${communityLink.ariaLabel}"
            data-metrika-goal="${communityLink.goal}"
          >
            <span class="menu__community-desktop">${communityLink.desktopLabel}</span>
            <span class="menu__community-mobile">${communityLink.mobileLabel}</span>
          </a>
        </nav>
      `;

      this.shadowRoot.innerHTML = template;

      // Если активный пункт не виден на мобильных, подводим его в видимую область
      const activeItem = this.shadowRoot.querySelector('.menu__item--active');

      if (activeItem) {
        activeItem.scrollIntoView({
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }

  // Регистрация кастомного элемента
  if (!customElements.get('common-projects-menu')) {
    customElements.define('common-projects-menu', CommonProjectsMenu);
  }

  // Проверка загрузки Яндекс.Метрики, отладочная информация
  setTimeout(() => {
    if (window.ym) {
      console.log('✅ Яндекс.Метрика успешно загружена');
    } else {
      console.log('ℹ️ Яндекс.Метрика загружается...');
    }
  }, 2000);
})();