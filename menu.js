// menu.js - версия 1.3 с Яндекс.Метрикой

// Конфигурация проектов
const projectsCatalog = [
  {
    name: 'Справочник ОКПД2',
    url: 'https://prog815.github.io/okpd2/',
    icon: '🔍',
    description: 'Полный классификатор ОКПД2 с поиском'
  },
  {
    name: 'Справочник ОКВЭД2',
    url: 'https://prog815.github.io/okved2/',
    icon: '🏢',
    description: 'Классификатор видов экономической деятельности'
  },
  {
    name: 'Справочник ОКТМО',
    url: 'https://prog815.github.io/oktmo/',
    icon: '🏢',
    description: 'Классификатор территорий муниципальных образований',
    badge: 'Новый'
  },
  {
    name: 'Справочник ПП 1875',
    url: 'https://prog815.github.io/okpd2-pp1875/',
    icon: '⚖️',
    description: 'Национальный режим для ОКПД2',
    badge: 'Нацрежим'
  }
];

// Социальные сети и контакты (горизонтальный ряд иконок)
const socialLinks = [
  {
    name: 'Telegram-канал',
    url: 'https://t.me/smart_tabs',
    icon: '📢',
    description: 'Новости проекта и обратная связь'
  }
];

// Яндекс.Метрика счетчик
class YandexMetrika {
  static init() {
    // Проверяем, не был ли уже инициализирован счетчик
    if (window.ym && window.ym.a) {
      return;
    }

    const counterId = 105817342;
    
    // Создаем скрипт Яндекс.Метрики
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${counterId}', 'ym');

      ym(${counterId}, 'init', {
          ssr:true,
          webvisor:true,
          clickmap:true,
          ecommerce:"dataLayer",
          accurateTrackBounce:true,
          trackLinks:true
      });
    `;
    
    // Создаем noscript для пользователей без JS
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${counterId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
    
    // Вставляем в head документа
    document.head.appendChild(script);
    document.head.appendChild(noscript);
    
    // Логирование для отладки
    console.log(`✅ Яндекс.Метрика подключена (счетчик: ${counterId})`);
    
    // Добавляем атрибуты для отслеживания целей на ссылках
    this.addGoalTracking();
  }
  
  static addGoalTracking() {
    // Отслеживание кликов по ссылкам навигации
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      const isProjectLink = projectsCatalog.some(project => 
        href && (href === project.url || href.includes(project.url.replace('https://prog815.github.io/', '')))
      );
      
      const isSocialLink = socialLinks.some(social => 
        href && href === social.url
      );
      
      if (isProjectLink && window.ym) {
        const projectName = link.querySelector('.menu-text')?.textContent || 'unknown';
        const goalName = `nav_to_${projectName.replace(/\s+/g, '_').toLowerCase()}`;
        window.ym(105817342, 'reachGoal', goalName);
      }
      
      if (isSocialLink && window.ym) {
        const socialName = link.getAttribute('title') || link.getAttribute('aria-label') || 'unknown';
        const goalName = `social_${socialName.replace(/\s+/g, '_').toLowerCase()}`;
        window.ym(105817342, 'reachGoal', goalName);
      }
    });
  }
}

// Основной класс компонента
class CommonProjectsMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    
    // Инициализируем Яндекс.Метрику при первом подключении компонента
    if (!window._yandexMetrikaInitialized) {
      YandexMetrika.init();
      window._yandexMetrikaInitialized = true;
    }
  }

  // Получение текущего URL без параметров
  getCleanUrl() {
    return window.location.href.split('?')[0].split('#')[0];
  }

  // Проверка, является ли ссылка текущей страницей
  isCurrentPage(url) {
    // Сравниваем путь (pathname) - это самое надежное
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const targetPath = new URL(url).pathname.replace(/\/$/, '');
    
    return currentPath === targetPath;
  }

  // Генерация стилей
  getStyles() {
    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          margin: 20px 0;
        }

        .common-menu {
          background: #ffffff;
          border: 1px solid #e1e4e8;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .menu-header {
          padding: 12px 16px;
          background: #f6f8fa;
          border-bottom: 1px solid #e1e4e8;
        }

        .menu-title {
          font-weight: 600;
          color: #24292e;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .menu-title::before {
          content: '📚';
        }

        .menu-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .menu-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          text-decoration: none;
          color: #24292e;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.15s ease;
          position: relative;
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .menu-item:hover {
          background-color: #f6f8fa;
        }

        .menu-item.active {
          background-color: #f0f7ff;
          border-left: 3px solid #0969da;
        }

        .menu-item.active::before {
          content: '→';
          position: absolute;
          left: 4px;
          color: #0969da;
          font-weight: bold;
        }

        .menu-item.active .menu-text {
          color: #0969da;
          font-weight: 500;
        }

        .menu-icon {
          margin-right: 12px;
          font-size: 18px;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .menu-text {
          flex-grow: 1;
          min-width: 0;
        }

        .menu-badge {
          background: #d73a49;
          color: white;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 10px;
          font-weight: 600;
          margin-left: 8px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Секция социальных сетей */
        .social-section {
          padding: 16px;
          border-top: 1px solid #e1e4e8;
          background: #fafbfc;
        }

        .social-label {
          font-size: 13px;
          color: #6a737d;
          margin-bottom: 12px;
          text-align: center;
          font-weight: 500;
        }

        .social-icons {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: 1px solid #e1e4e8;
          font-size: 20px;
          text-decoration: none;
          color: #24292e;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
        }

        .social-icon:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #0969da;
        }

        .social-icon:active {
          transform: translateY(0);
        }

        /* Специальные стили для Telegram */
        .social-icon[title*="Telegram"] {
          background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%);
          color: white;
          border-color: #0088cc;
        }

        .social-icon[title*="Telegram"]:hover {
          background: linear-gradient(135deg, #0077b5 0%, #0066a3 100%);
          box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
        }

        /* Адаптивные стили */
        @media (max-width: 768px) {
          .common-menu {
            border-radius: 6px;
          }
          
          .menu-item {
            padding: 14px 16px;
          }
          
          .social-icon {
            width: 44px;
            height: 44px;
            font-size: 22px;
          }
          
          .social-icons {
            gap: 20px;
          }
        }

        @media (max-width: 480px) {
          .menu-header {
            padding: 10px 12px;
          }
          
          .menu-item {
            padding: 12px 14px;
          }
          
          .menu-icon {
            margin-right: 10px;
            font-size: 16px;
            width: 20px;
          }
          
          .menu-badge {
            font-size: 10px;
            padding: 2px 6px;
          }
          
          .social-icons {
            gap: 16px;
          }
          
          .social-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
          
          .social-section {
            padding: 14px;
          }
        }
      </style>
    `;
  }

  // Рендеринг компонента
  render() {
    const currentUrl = this.getCleanUrl();
    
    // Основные проекты
    const menuItems = projectsCatalog.map(project => {
      const isActive = this.isCurrentPage(project.url);
      const activeClass = isActive ? 'active' : '';
      
      return `
        <a href="${project.url}" 
           class="menu-item ${activeClass}"
           title="${project.description}"
           ${isActive ? 'aria-current="page"' : ''}
           data-metrika-goal="nav_${project.name.replace(/\s+/g, '_').toLowerCase()}">
          <span class="menu-icon">${project.icon}</span>
          <span class="menu-text">${project.name}</span>
          ${project.badge ? `<span class="menu-badge">${project.badge}</span>` : ''}
        </a>
      `;
    }).join('');

    // Социальные иконки
    const socialIcons = socialLinks.map(social => {
      return `
        <a href="${social.url}" 
           class="social-icon"
           target="_blank"
           rel="noopener noreferrer"
           title="${social.description}"
           aria-label="${social.name}"
           data-metrika-goal="social_${social.name.replace(/\s+/g, '_').toLowerCase()}">
          ${social.icon}
        </a>
      `;
    }).join('');

    // Собираем весь HTML
    const template = `
      <div class="common-menu" role="navigation" aria-label="Навигация по справочникам">
        <div class="menu-header">
          <div class="menu-title">Другие справочники</div>
        </div>
        <div class="menu-list" role="list">
          ${menuItems}
        </div>
        
        ${socialLinks.length > 0 ? `
          <div class="social-section">
            <div class="social-label">Связь с разработчиком</div>
            <div class="social-icons">
              ${socialIcons}
            </div>
          </div>
        ` : ''}
        
        <!-- Скрытый элемент для идентификации версии с Яндекс.Метрикой -->
        <div style="display: none;" 
             data-yandex-metrika="integrated" 
             data-counter-id="105817342"
             data-version="1.3">
        </div>
      </div>
    `;

    // Вставляем HTML и стили в Shadow DOM
    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      ${template}
    `;
  }
}

// Регистрация кастомного элемента
if (!customElements.get('common-projects-menu')) {
  customElements.define('common-projects-menu', CommonProjectsMenu);
}

// Проверка загрузки Яндекс.Метрики (отладочная информация)
setTimeout(() => {
  if (window.ym) {
    console.log('✅ Яндекс.Метрика успешно загружена');
  } else {
    console.log('ℹ️ Яндекс.Метрика загружается...');
  }
}, 2000);