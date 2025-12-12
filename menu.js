// menu.js
// Версия 1.1 с социальными иконками
// Общий компонент навигационного меню для справочников
// Подключается как: <script src="https://prog815.github.io/common-menu/menu.js"></script>
// Использование: <common-projects-menu></common-projects-menu>

// Конфигурация проектов
const projectsCatalog = [
  {
    name: 'Справочник ОКПД2',
    url: 'https://prog815.github.io/okpd2/',
    icon: '🔍',
    description: 'Полный классификатор ОКПД2 с поиском'
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
  // Добавьте здесь другие соцсети при необходимости
];

// Основной класс компонента
class CommonProjectsMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    console.log('CommonProjectsMenu: компонент подключен, URL:', window.location.href);
    this.render();
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

    console.log('CommonProjectsMenu: сравнение путей:', {
        текущий_путь: currentPath,
        целевой_путь: targetPath,
        совпадают: currentPath === targetPath
    });

    return currentPath === targetPath;
    }

  // Генерация стилей
  // Метод getStyles() - должен возвращать строку со стилями
    getStyles() {
    return `
        <style>
        :host {
            display: block;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
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
            padding: 10px 16px;
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
            margin-right: 10px;
            font-size: 16px;
            width: 20px;
            text-align: center;
        }

        .menu-text {
            flex-grow: 1;
        }

        .menu-badge {
            background: #d73a49;
            color: white;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: 600;
            margin-left: 8px;
            white-space: nowrap;
        }

        /* Секция социальных сетей */
        .social-section {
            padding: 15px 16px 10px;
            border-top: 1px solid #e1e4e8;
            background: #fafbfc;
        }

        .social-label {
            font-size: 12px;
            color: #6a737d;
            margin-bottom: 10px;
            text-align: center;
        }

        .social-icons {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        .social-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: white;
            border: 1px solid #e1e4e8;
            font-size: 18px;
            text-decoration: none;
            color: #24292e;
            transition: all 0.2s ease;
            cursor: pointer;
            position: relative;
        }

        .social-icon:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #0969da;
        }

        .social-icon:active {
            transform: translateY(-1px);
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

        /* Индикатор нового окна для внешних ссылок */
        .social-icon::after {
            content: '';
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #0969da;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .social-icon:hover::after {
            opacity: 1;
        }

        /* Адаптивность для мобильных */
        @media (max-width: 768px) {
            .social-icon {
            width: 44px;
            height: 44px;
            font-size: 20px;
            }
            
            .social-icons {
            gap: 20px;
            }
            
            .social-section {
            padding: 20px 16px 15px;
            }
        }

        @media (max-width: 480px) {
            .social-icons {
            gap: 15px;
            }
            
            .social-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
            }
        }

        /* Улучшенные тултипы (подсказки) */
        .social-icon {
            position: relative;
        }

        /* Простые CSS тултипы для десктопа */
        @media (hover: hover) and (pointer: fine) {
            .social-icon:hover::before {
            content: attr(title);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #24292e;
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 8px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            animation: fadeInTooltip 0.2s ease forwards;
            }
            
            .social-icon:hover::after {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #24292e;
            margin-bottom: 0;
            opacity: 0;
            animation: fadeInTooltip 0.2s ease forwards;
            }
            
            @keyframes fadeInTooltip {
            to {
                opacity: 1;
            }
            }
        }

        /* Для тач-устройств показываем тултип при тапе */
        @media (hover: none) and (pointer: coarse) {
            .social-icon:active {
            transform: scale(0.95);
            }
        }

        .menu-footer {
            padding: 8px 16px;
            background: #f6f8fa;
            border-top: 1px solid #e1e4e8;
            text-align: right;
        }

        .menu-version {
            font-size: 11px;
            color: #6a737d;
        }

        /* Адаптивные стили для основного меню */
        @media (max-width: 768px) {
            .common-menu {
            border-radius: 6px;
            }
            
            .menu-item {
            padding: 12px 16px;
            }
            
            .menu-item.active::before {
            left: 2px;
            }
        }

        @media (max-width: 480px) {
            .menu-header {
            padding: 10px 12px;
            }
            
            .menu-item {
            padding: 10px 12px;
            }
            
            .menu-badge {
            font-size: 10px;
            padding: 1px 5px;
            }
        }
        </style>
    `;
    }

  // Генерация HTML-разметки
  getTemplate() {
    const currentUrl = this.getCleanUrl();
    
    // Основные проекты
    const menuItems = projectsCatalog.map(project => {
        const isActive = this.isCurrentPage(project.url);
        const activeClass = isActive ? 'active' : '';
        
        return `
        <a href="${project.url}" 
            class="menu-item ${activeClass}"
            title="${project.description}"
            ${isActive ? 'aria-current="page"' : ''}>
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
            aria-label="${social.name}">
            ${social.icon}
        </a>
        `;
    }).join('');

    return `
        <div class="common-menu" role="navigation" aria-label="Навигация по справочникам">
        <div class="menu-header">
            <div class="menu-title">Справочники prog815</div>
        </div>
        <div class="menu-list" role="list">
            ${menuItems}
        </div>
        
        ${socialLinks.length > 0 ? `
            <div class="social-section">
            <div class="social-label">Связь и обратная связь:</div>
            <div class="social-icons">
                ${socialIcons}
            </div>
            </div>
        ` : ''}
        
        <div class="menu-footer">
            <span class="menu-version">v1.1</span>
        </div>
        </div>
    `;
}

  // Рендеринг компонента
  render() {
    console.log('=== CommonProjectsMenu: начат рендеринг ===');
    
    const currentUrl = this.getCleanUrl();
    
    // Основные проекты
    const menuItems = projectsCatalog.map(project => {
        const isActive = this.isCurrentPage(project.url);
        const activeClass = isActive ? 'active' : '';
        
        console.log(`Проверка проекта "${project.name}":`, {
        projectUrl: project.url,
        isActive: isActive,
        currentPath: window.location.pathname,
        targetPath: new URL(project.url).pathname
        });
        
        return `
        <a href="${project.url}" 
            class="menu-item ${activeClass}"
            title="${project.description}"
            ${isActive ? 'aria-current="page"' : ''}>
            <span class="menu-icon">${project.icon}</span>
            <span class="menu-text">${project.name}</span>
            ${project.badge ? `<span class="menu-badge">${project.badge}</span>` : ''}
        </a>
        `;
    }).join('');

    // Социальные иконки (горизонтальный ряд)
    const socialIcons = socialLinks.map(social => {
        return `
        <a href="${social.url}" 
            class="social-icon"
            target="_blank"
            rel="noopener noreferrer"
            title="${social.description}"
            aria-label="${social.name}">
            ${social.icon}
        </a>
        `;
    }).join('');

    // Собираем весь HTML
    const template = `
        <div class="common-menu" role="navigation" aria-label="Навигация по справочникам">
        <div class="menu-header">
            <div class="menu-title">Справочники prog815</div>
        </div>
        <div class="menu-list" role="list">
            ${menuItems}
        </div>
        
        ${socialLinks.length > 0 ? `
            <div class="social-section">
            <div class="social-label">Связь и обратная связь:</div>
            <div class="social-icons">
                ${socialIcons}
            </div>
            </div>
        ` : ''}
        
        <div class="menu-footer">
            <span class="menu-version">v1.1</span>
        </div>
        </div>
    `;

    // Вставляем HTML и стили в Shadow DOM
    this.shadowRoot.innerHTML = `
        ${this.getStyles()}
        ${template}
    `;
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Добавляем обработчики для социальных иконок (для мобильных)
    this.addSocialTooltips();
    
    console.log('=== CommonProjectsMenu: рендеринг завершен ===');
    }

    // Метод для добавления тултипов на мобильных (опционально)
    addSocialTooltips() {
    const socialIcons = this.shadowRoot.querySelectorAll('.social-icon');
    
    // Проверяем, мобильное ли устройство
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) return; // На десктопе тултипы работают через CSS
    
    // Для тач-устройств добавляем обработку
    socialIcons.forEach(icon => {
        let tapTimer;
        let tooltip = null;
        
        const showTooltip = () => {
        const title = icon.getAttribute('title');
        if (!title) return;
        
        // Удаляем старый тултип, если есть
        if (tooltip) {
            tooltip.remove();
        }
        
        // Создаем новый тултип
        tooltip = document.createElement('div');
        tooltip.className = 'mobile-tooltip';
        tooltip.textContent = title;
        tooltip.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            white-space: nowrap;
            max-width: 90vw;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(tooltip);
        
        // Автоматически скрываем через 2 секунды
        setTimeout(() => {
            if (tooltip) {
            tooltip.remove();
            tooltip = null;
            }
        }, 2000);
        };
        
        const hideTooltip = () => {
        clearTimeout(tapTimer);
        if (tooltip) {
            setTimeout(() => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
            }, 300);
        }
        };
        
        // Долгий тап для показа тултипа
        icon.addEventListener('touchstart', (e) => {
        e.preventDefault();
        tapTimer = setTimeout(showTooltip, 500); // 0.5 секунды
        }, { passive: false });
        
        icon.addEventListener('touchend', (e) => {
        e.preventDefault();
        hideTooltip();
        }, { passive: false });
        
        icon.addEventListener('touchmove', (e) => {
        e.preventDefault();
        hideTooltip();
        }, { passive: false });
        
        // Обычный тап для перехода
        icon.addEventListener('click', (e) => {
        if (tapTimer) {
            clearTimeout(tapTimer);
        }
        // Открываем ссылку (браузер сам обработает)
        });
    });
    }

  // Добавление обработчиков событий
  addEventListeners() {
    const menuItems = this.shadowRoot.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (this.isCurrentPage(item.href)) {
          e.preventDefault(); // Предотвращаем переход на ту же страницу
        }
        // Для внешних переходов ничего не делаем - браузер обработает сам
      });
      
      // Добавляем всплывающую подсказку для десктопов
      item.addEventListener('mouseenter', () => {
        const title = item.getAttribute('title');
        if (title && window.innerWidth > 768) {
          // Можно добавить кастомную подсказку, если нужно
        }
      });
    });
  }
}

// Регистрация кастомного элемента
if (!customElements.get('common-projects-menu')) {
  customElements.define('common-projects-menu', CommonProjectsMenu);
}

// Автоматическая инициализация для демо-страницы
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем, находимся ли мы на демо-странице
  if (window.location.href.includes('/common-menu/') || 
      window.location.pathname.endsWith('demo.html')) {
    
    // Создаем демо-контейнер если его нет
    if (!document.querySelector('.demo-container')) {
      const demoHTML = `
        <div class="demo-container">
          <h1 class="demo-title">Демонстрация общего меню для справочников</h1>
          <div class="demo-instructions">
            <h3>Инструкция по подключению:</h3>
            <p>1. Добавьте этот скрипт перед закрывающим тегом <code>&lt;/body&gt;</code>:</p>
            <code>&lt;script src="https://prog815.github.io/common-menu/menu.js"&gt;&lt;/script&gt;</code>
            <p>2. Добавьте компонент в нужное место на странице:</p>
            <code>&lt;common-projects-menu&gt;&lt;/common-projects-menu&gt;</code>
          </div>
          <h3>Пример меню:</h3>
          <common-projects-menu></common-projects-menu>
          <div style="margin-top: 30px; padding: 15px; background: #f6f8fa; border-radius: 6px;">
            <h4>Тестирование активного состояния:</h4>
            <p>На этой странице все пункты меню должны быть неактивными (нет выделения).</p>
            <p>На страницах справочников (например, <a href="https://prog815.github.io/okpd2/">ОКПД2</a>) соответствующий пункт будет выделен.</p>
          </div>
        </div>
      `;
      
      // Вставляем демо в body, если он пустой или специально помечен
      if (document.body && (document.body.children.length === 0 || 
          document.body.innerHTML.includes('common-menu-demo'))) {
        document.body.innerHTML = demoHTML;
      }
    }
  }
});

// Экспорт для возможного использования в модульных системах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CommonProjectsMenu, projectsCatalog };
}