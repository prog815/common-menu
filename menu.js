// menu.js
// Версия 1.0
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

// Основной класс компонента
class CommonProjectsMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
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

        .menu-description {
          display: none; /* Скрыто по умолчанию */
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

        /* Стили для демо-страницы */
        .demo-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
        }

        .demo-title {
          font-size: 24px;
          margin-bottom: 20px;
          color: #24292e;
        }

        .demo-instructions {
          background: #f6f8fa;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 30px;
          border-left: 4px solid #0969da;
        }

        .demo-instructions code {
          background: #e1e4e8;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 13px;
        }

        /* Адаптивные стили */
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

    return `
      <div class="common-menu" role="navigation" aria-label="Навигация по справочникам">
        <div class="menu-header">
          <div class="menu-title">Справочники prog815</div>
        </div>
        <div class="menu-list" role="list">
          ${menuItems}
        </div>
        <div class="menu-footer">
          <span class="menu-version">v1.0</span>
        </div>
      </div>
    `;
  }

  // Рендеринг компонента
  render() {

    console.log('=== CommonProjectsMenu: начат рендеринг ===');
    console.log('Текущий URL:', window.location.href);
    console.log('Текущий pathname:', window.location.pathname);
    
    const currentUrl = this.getCleanUrl();
    
    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      ${this.getTemplate()}
    `;
    
    // Добавляем обработчики кликов для улучшения UX
    this.addEventListeners();
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