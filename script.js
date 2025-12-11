// ===== КОНСТАНТЫ И ПЕРЕМЕННЫЕ =====
const API_BASE_URL = 'http://localhost:5000/api';
let currentUser = null;
let labsData = [];
let ctfData = [];
let leaderboardData = [];

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('CyberSib Platform Initializing...');
    
    // Инициализация всех компонентов
    initNavigation();
    initTerminal();
    initModals();
    initLabs();
    initCTF();
    initDocs();
    initForms();
    initUserState();
    initBackgroundAnimation();
    
    // Загрузка данных
    loadMockData();
    
    console.log('CyberSib Platform Ready!');
});

// ===== ФОНОВАЯ АНИМАЦИЯ =====
function initBackgroundAnimation() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Случайный размер
        const size = Math.random() * 4 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Случайная позиция
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Случайный цвет
        const colors = [
            'var(--primary)',
            'var(--secondary)',
            'var(--accent)',
            'var(--primary-light)'
        ];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.opacity = Math.random() * 0.7 + 0.3;
        
        // Случайная задержка и продолжительность анимации
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.animation = `float ${duration}s linear ${delay}s infinite`;
        
        particlesContainer.appendChild(particle);
    }
}

// ===== НАВИГАЦИЯ =====
function initNavigation() {
    // Переключение между страницами
    document.querySelectorAll('[data-page]').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.dataset.page;
            switchPage(pageId);
            
            // Обновление активного состояния в навигации
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Выпадающее меню пользователя
    const userInfo = document.getElementById('userInfo');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userInfo && userDropdown) {
        userInfo.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', function() {
            userDropdown.classList.remove('show');
        });
    }
    
    // Кнопки пользователя
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const profileBtn = document.getElementById('profileBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', () => openModal('loginModal'));
    if (registerBtn) registerBtn.addEventListener('click', () => openModal('loginModal'));
    if (profileBtn) profileBtn.addEventListener('click', () => openModal('profileModal'));
    if (dashboardBtn) dashboardBtn.addEventListener('click', () => switchPage('dashboard'));
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
    
    // Кнопки главной страницы
    const startLearningBtn = document.getElementById('startLearningBtn');
    const openDocsBtn = document.getElementById('openDocsBtn');
    const quickDemoBtn = document.getElementById('quickDemoBtn');
    
    if (startLearningBtn) startLearningBtn.addEventListener('click', () => switchPage('labs'));
    if (openDocsBtn) openDocsBtn.addEventListener('click', () => switchPage('docs'));
    if (quickDemoBtn) quickDemoBtn.addEventListener('click', () => quickDemoAccess());
    
    // Кнопки в футере
    document.querySelectorAll('.footer-link').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.page) {
                switchPage(this.dataset.page);
            } else if (this.dataset.doc) {
                showDocument(this.dataset.doc);
            }
        });
    });
}

function switchPage(pageId) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показать выбранную страницу
    const targetPage = document.getElementById(`${pageId}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Прокрутка вверх
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Закрыть мобильное меню если открыто
        const navMenu = document.getElementById('navMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
        
        // Обновить данные если необходимо
        if (pageId === 'labs') loadLabs();
        if (pageId === 'ctf') loadCTFData();
        if (pageId === 'docs') showDocument('about');
        
        console.log(`Переключено на страницу: ${pageId}`);
    }
}

// ===== ТЕРМИНАЛ =====
function initTerminal() {
    const terminalCmd = document.getElementById('terminalCmd');
    const terminalOutput = document.getElementById('terminalOutput');
    
    if (!terminalCmd || !terminalOutput) return;
    
    // Начальное сообщение в терминале
    addTerminalOutput('Добро пожаловать в CyberSib терминал!', 'info');
    addTerminalOutput('Введите "help" для списка доступных команд', 'info');
    addTerminalOutput('');
    
    // Обработка команд
    terminalCmd.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim().toLowerCase();
            this.value = '';
            
            // Отображение введенной команды
            addTerminalOutput(`root@cybersib-spt:~$ ${command}`, 'command');
            
            // Обработка команд
            processCommand(command);
            
            // Автоскролл к последнему сообщению
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    });
    
    // Фокус на терминал при клике
    terminalOutput.addEventListener('click', () => {
        terminalCmd.focus();
    });
}

function addTerminalOutput(text, type = 'normal') {
    const terminalOutput = document.getElementById('terminalOutput');
    if (!terminalOutput) return;
    
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    
    terminalOutput.appendChild(line);
    
    // Ограничить количество строк (сохраняем последние 100)
    const lines = terminalOutput.querySelectorAll('.terminal-line');
    if (lines.length > 100) {
        lines[0].remove();
    }
}

function processCommand(command) {
    const commands = {
        'help': `
Доступные команды:
• help - показать эту справку
• labs - информация о лабораторных
• ctf - информация о CTF задачах
• status - статус системы
• users - статистика пользователей
• clear - очистить терминал
• about - информация о проекте
• demo - быстрый демо-доступ
• connect [ip] - подключиться к лаборатории
• flag [hash] - отправить флаг
• scan - сканировать сеть
• whoami - информация о текущем пользователе
        `,
        'labs': `
Доступные лабораторные работы:

1. Основы Linux (начальный уровень)
   • Работа с командной строкой
   • Управление процессами
   • Права доступа и пользователи

2. Сетевая разведка (средний уровень)
   • Использование Nmap
   • Анализ сетевого трафика
   • Обнаружение уязвимостей

3. Web Exploitation (продвинутый уровень)
   • SQL инъекции
   • XSS атаки
   • Подбор паролей

Для запуска лаборатории перейдите в раздел "Лаборатории"
        `,
        'ctf': `
CTF Challenges:

[Web]
• SQL Injection 101 (50 баллов)
• XSS Challenge (75 баллов)
• File Upload Vulnerability (100 баллов)

[Crypto]
• Basic Caesar Cipher (30 баллов)
• RSA Challenge (150 баллов)
• Hash Cracking (80 баллов)

[Forensics]
• Memory Dump Analysis (120 баллов)
• Network Packet Analysis (90 баллов)

Используйте команду "flag [hash]" для отправки решения
        `,
        'status': `
Статус системы CyberSib:
✓ Сервисы онлайн
✓ Лаборатории доступны
✓ CTF система работает
✓ База данных активна

Статистика:
• Пользователей онлайн: ${Math.floor(Math.random() * 50) + 20}
• Активных лабораторий: ${Math.floor(Math.random() * 15) + 5}
• Решенных CTF задач: ${Math.floor(Math.random() * 200) + 50}
• Общее время работы: 24/7
        `,
        'users': `
Статистика пользователей:
• Всего зарегистрировано: 148
• Активных сегодня: ${Math.floor(Math.random() * 40) + 15}
• Завершено лабораторий: 842
• Набрано CTF очков: 15420

Топ-5 пользователей:
1. cyber_master - 2450 очков
2. hackerman - 2100 очков
3. root_access - 1980 очков
4. security_guru - 1850 очков
5. newbie_hacker - 1650 очков
        `,
        'about': `
CyberSib - Киберполигон Сибирского политехнического техникума

Версия: 2.1.0 (Бета)
Запущен: Декабрь 2025
Разработчик: Белоногов Роман Дмитриевич
Локация: Кемерово, Кузбасс

Цель проекта: создание безопасной среды для
практического обучения информационной безопасности.

Технологии: Node.js, Python, Vagrant, VirtualBox
Лицензия: Образовательная
        `,
        'demo': `
Запуск демо-доступа...
Подключение к демо-лаборатории...
Виртуальная машина запущена!
IP адрес: 192.168.56.101

Демо-задачи:
1. Найдите скрытый файл в системе
2. Получите доступ к учетной записи root
3. Извлеките флаг из защищенного файла

Формат флага: CSIB{md5_hash}
Используйте команду "flag [hash]" для отправки
        `,
        'scan': `
Начало сканирования сети...
Обнаружены активные хосты:

192.168.56.101 - Демо-лаборатория (Kali Linux)
192.168.56.102 - Уязвимый Web сервер
192.168.56.103 - Сервер баз данных
192.168.56.104 - Файловый сервер

Открытые порты на 192.168.56.102:
• 22/tcp   - SSH
• 80/tcp   - HTTP
• 443/tcp  - HTTPS
• 3306/tcp - MySQL

Рекомендация: Проведите тестирование на проникновение
        `,
        'whoami': currentUser 
            ? `Текущий пользователь: ${currentUser.username}
Роль: ${currentUser.role}
Группа: ${currentUser.group}
Очки: ${currentUser.points}
Лабораторий завершено: ${currentUser.completedLabs}`
            : 'Вы не авторизованы. Используйте команду "demo" для демо-доступа или войдите в систему.',
        'clear': () => {
            const terminalOutput = document.getElementById('terminalOutput');
            if (terminalOutput) {
                terminalOutput.innerHTML = '';
                addTerminalOutput('Терминал очищен.', 'info');
                addTerminalOutput('');
            }
            return null;
        }
    };
    
    if (command === 'clear') {
        commands.clear();
        return;
    }
    
    if (commands[command]) {
        if (typeof commands[command] === 'function') {
            commands[command]();
        } else {
            addTerminalOutput(commands[command]);
        }
    } else if (command.startsWith('connect ')) {
        const ip = command.replace('connect ', '').trim();
        addTerminalOutput(`Попытка подключения к ${ip}...`, 'warning');
        addTerminalOutput('Установка SSH соединения...', 'info');
        addTerminalOutput(`Подключено к ${ip} как root`, 'success');
        addTerminalOutput('Добро пожаловать в лабораторную среду!', 'info');
    } else if (command.startsWith('flag ')) {
        const flag = command.replace('flag ', '').trim();
        addTerminalOutput(`Проверка флага: ${flag}`, 'info');
        
        if (flag.match(/^CSIB\{[a-f0-9]{32}\}$/)) {
            addTerminalOutput('✓ Флаг правильный! Задача решена.', 'success');
            addTerminalOutput('+50 очков начислено на ваш счет', 'success');
        } else {
            addTerminalOutput('✗ Неверный формат флага', 'error');
            addTerminalOutput('Формат: CSIB{32_hex_characters}', 'info');
        }
    } else if (command) {
        addTerminalOutput(`Команда "${command}" не найдена. Введите "help" для справки.`, 'error');
    }
    
    addTerminalOutput('');
}

// ===== ЛАБОРАТОРИИ =====
function initLabs() {
    // Фильтрация по сложности
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Обновить активную кнопку
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // Фильтровать лаборатории
            const filter = this.dataset.filter;
            filterLabs(filter);
        });
    });
    
    // Поиск лабораторий
    const labSearch = document.getElementById('labSearch');
    if (labSearch) {
        labSearch.addEventListener('input', function() {
            searchLabs(this.value);
        });
    }
    
    // Загружаем лаборатории при первом открытии
    if (document.getElementById('labsPage')?.classList.contains('active')) {
        loadLabs();
    }
}

function loadLabs() {
    const labsContainer = document.getElementById('labsContainer');
    if (!labsContainer) return;
    
    // Мок данные для лабораторий
    const mockLabs = [
        {
            id: 1,
            title: "Основы Linux",
            description: "Изучение базовых команд Linux, работа с файловой системой и правами доступа",
            difficulty: "beginner",
            points: 10,
            time: "1 час",
            category: "linux",
            status: "available"
        },
        {
            id: 2,
            title: "Сетевая разведка с Nmap",
            description: "Освоение инструментов сетевого сканирования и обнаружения хостов",
            difficulty: "beginner",
            points: 15,
            time: "1.5 часа",
            category: "networking",
            status: "available"
        },
        {
            id: 3,
            title: "SQL Injection",
            description: "Поиск и эксплуатация SQL инъекций в уязвимых веб-приложениях",
            difficulty: "intermediate",
            points: 25,
            time: "2 часа",
            category: "web",
            status: "available"
        },
        {
            id: 4,
            title: "XSS Атаки",
            description: "Изучение механизмов межсайтового скриптинга и методов защиты",
            difficulty: "intermediate",
            points: 30,
            time: "2.5 часа",
            category: "web",
            status: "available"
        },
        {
            id: 5,
            title: "Buffer Overflow",
            description: "Эксплуатация переполнения буфера в бинарных приложениях",
            difficulty: "advanced",
            points: 50,
            time: "3 часа",
            category: "pwn",
            status: "locked"
        },
        {
            id: 6,
            title: "Forensics: Анализ памяти",
            description: "Исследование дампа памяти на наличие артефактов и ключей",
            difficulty: "advanced",
            points: 45,
            time: "2.5 часа",
            category: "forensics",
            status: "locked"
        },
        {
            id: 7,
            title: "CTF: Шифрование RSA",
            description: "Задача на взлом RSA шифрования с малой длиной ключа",
            difficulty: "ctf",
            points: 75,
            time: "Не ограничено",
            category: "crypto",
            status: "available"
        },
        {
            id: 8,
            title: "CTF: Reverse Engineering",
            description: "Анализ и взлом бинарного файла с защитой от отладки",
            difficulty: "ctf",
            points: 100,
            time: "Не ограничено",
            category: "reverse",
            status: "locked"
        }
    ];
    
    labsData = mockLabs;
    renderLabs(labsData);
}

function renderLabs(labs) {
    const labsContainer = document.getElementById('labsContainer');
    if (!labsContainer) return;
    
    labsContainer.innerHTML = '';
    
    labs.forEach(lab => {
        const labCard = document.createElement('div');
        labCard.className = 'lab-card';
        labCard.dataset.id = lab.id;
        labCard.dataset.difficulty = lab.difficulty;
        labCard.dataset.category = lab.category;
        
        // Определение цвета сложности
        let difficultyClass = '';
        let difficultyText = '';
        
        switch(lab.difficulty) {
            case 'beginner':
                difficultyClass = 'difficulty-beginner';
                difficultyText = 'Начинающий';
                break;
            case 'intermediate':
                difficultyClass = 'difficulty-intermediate';
                difficultyText = 'Средний';
                break;
            case 'advanced':
                difficultyClass = 'difficulty-advanced';
                difficultyText = 'Продвинутый';
                break;
            case 'ctf':
                difficultyClass = 'difficulty-ctf';
                difficultyText = 'CTF Задача';
                break;
        }
        
        labCard.innerHTML = `
            <div class="lab-header">
                <div class="lab-difficulty ${difficultyClass}">${difficultyText}</div>
                <h3>${lab.title}</h3>
                <p class="lab-description">${lab.description}</p>
                <div class="lab-meta">
                    <div class="lab-points">
                        <i class="fas fa-star"></i>
                        <span>${lab.points} очков</span>
                    </div>
                    <div class="lab-time">
                        <i class="fas fa-clock"></i>
                        <span>${lab.time}</span>
                    </div>
                </div>
            </div>
            <div class="lab-actions">
                <button class="lab-btn" onclick="openLabModal(${lab.id})" 
                        ${lab.status === 'locked' ? 'disabled' : ''}>
                    <i class="fas fa-play"></i>
                    ${lab.status === 'locked' ? 'Требуется доступ' : 'Запустить лабораторию'}
                </button>
            </div>
        `;
        
        labsContainer.appendChild(labCard);
    });
}

function filterLabs(difficulty) {
    if (difficulty === 'all') {
        renderLabs(labsData);
    } else {
        const filtered = labsData.filter(lab => lab.difficulty === difficulty);
        renderLabs(filtered);
    }
}

function searchLabs(query) {
    if (!query.trim()) {
        renderLabs(labsData);
        return;
    }
    
    const filtered = labsData.filter(lab => 
        lab.title.toLowerCase().includes(query.toLowerCase()) ||
        lab.description.toLowerCase().includes(query.toLowerCase()) ||
        lab.category.toLowerCase().includes(query.toLowerCase())
    );
    
    renderLabs(filtered);
}

function openLabModal(labId) {
    const lab = labsData.find(l => l.id === labId);
    if (!lab) return;
    
    const modalTitle = document.getElementById('labModalTitle');
    const modalBody = document.querySelector('#labModal .modal-body');
    
    if (modalTitle && modalBody) {
        modalTitle.innerHTML = `<i class="fas fa-flask"></i> ${lab.title}`;
        
        modalBody.innerHTML = `
            <div class="lab-modal-content">
                <div class="lab-info">
                    <div class="lab-difficulty ${getDifficultyClass(lab.difficulty)}">
                        ${getDifficultyText(lab.difficulty)}
                    </div>
                    <p><strong>Описание:</strong> ${lab.description}</p>
                    <div class="lab-details">
                        <div class="detail">
                            <i class="fas fa-star"></i>
                            <span>${lab.points} очков</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-clock"></i>
                            <span>${lab.time}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-tag"></i>
                            <span>${lab.category}</span>
                        </div>
                    </div>
                </div>
                
                <div class="lab-instructions">
                    <h4><i class="fas fa-list-ol"></i> Инструкция</h4>
                    <ol>
                        <li>Нажмите "Запустить лабораторию" для создания виртуальной машины</li>
                        <li>Подключитесь к ВМ через веб-интерфейс или SSH</li>
                        <li>Следуйте заданию и найдите флаг</li>
                        <li>Введите найденный флаг в специальное поле</li>
                        <li>Получите очки и переходите к следующей лаборатории</li>
                    </ol>
                </div>
                
                <div class="lab-warning">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>
                            <strong>Внимание!</strong> Все действия выполняются в изолированной среде.
                            Запрещается использовать эти знания для атак на реальные системы.
                        </div>
                    </div>
                </div>
                
                <div class="lab-actions-modal">
                    <button class="btn btn-primary" onclick="startLab(${labId})">
                        <i class="fas fa-play-circle"></i> Запустить лабораторию
                    </button>
                    <button class="btn btn-outline" onclick="closeModal('labModal')">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </div>
        `;
        
        openModal('labModal');
    }
}

function startLab(labId) {
    const lab = labsData.find(l => l.id === labId);
    if (!lab) return;
    
    addTerminalOutput(`Запуск лаборатории: ${lab.title}`, 'info');
    addTerminalOutput('Инициализация виртуальной машины...', 'info');
    addTerminalOutput('Конфигурация сети...', 'info');
    addTerminalOutput(`Лаборатория "${lab.title}" запущена!`, 'success');
    addTerminalOutput('IP адрес: 192.168.56.105', 'info');
    addTerminalOutput('Используйте команду "connect 192.168.56.105" для подключения', 'info');
    
    closeModal('labModal');
    
    // Показать уведомление
    showNotification(`Лаборатория "${lab.title}" запущена`, 'success');
}

// ===== CTF СИСТЕМА =====
function initCTF() {
    // Переключение вкладок CTF
    document.querySelectorAll('.ctf-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Обновить активную вкладку
            document.querySelectorAll('.ctf-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Показать соответствующую панель
            document.querySelectorAll('.ctf-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabId}Pane`).classList.add('active');
            
            // Загрузить данные если необходимо
            if (tabId === 'leaderboard') {
                loadLeaderboard();
            }
        });
    });
    
    // Обработка категорий CTF
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            filterCTFByCategory(category);
        });
    });
    
    // Кнопка уведомления о турнире
    const notifyBtn = document.getElementById('notifyTournamentBtn');
    if (notifyBtn) {
        notifyBtn.addEventListener('click', function() {
            showNotification('Вы будете уведомлены о старте турнира!', 'success');
            this.innerHTML = '<i class="fas fa-check"></i> Уведомление настроено';
            this.disabled = true;
        });
    }
    
    // Загружаем CTF данные при первом открытии
    if (document.getElementById('ctfPage')?.classList.contains('active')) {
        loadCTFData();
    }
}

function loadCTFData() {
    // Мок данные для CTF
    const mockCTF = [
        { id: 1, title: "SQL Injection 101", category: "web", points: 50, solves: 42, status: "solved" },
        { id: 2, title: "XSS Challenge", category: "web", points: 75, solves: 28, status: "available" },
        { id: 3, title: "Basic Caesar Cipher", category: "crypto", points: 30, solves: 65, status: "solved" },
        { id: 4, title: "RSA Challenge", category: "crypto", points: 150, solves: 12, status: "available" },
        { id: 5, title: "Memory Dump Analysis", category: "forensics", points: 120, solves: 18, status: "available" },
        { id: 6, title: "Buffer Overflow", category: "pwn", points: 200, solves: 8, status: "locked" },
        { id: 7, title: "Reverse Me", category: "reverse", points: 180, solves: 10, status: "available" }
    ];
    
    ctfData = mockCTF;
}

function loadLeaderboard() {
    // Мок данные для таблицы лидеров
    const mockLeaderboard = [
        { rank: 1, name: "cyber_master", points: 2450, solved: 42, rating: "Элита" },
        { rank: 2, name: "hackerman", points: 2100, solved: 38, rating: "Эксперт" },
        { rank: 3, name: "root_access", points: 1980, solved: 35, rating: "Эксперт" },
        { rank: 4, name: "security_guru", points: 1850, solved: 32, rating: "Профессионал" },
        { rank: 5, name: "newbie_hacker", points: 1650, solved: 28, rating: "Профессионал" },
        { rank: 6, name: "dark_knight", points: 1420, solved: 25, rating: "Продвинутый" },
        { rank: 7, name: "white_hat", points: 1250, solved: 22, rating: "Продвинутый" },
        { rank: 8, name: "code_breaker", points: 1100, solved: 20, rating: "Средний" },
        { rank: 9, name: "net_runner", points: 950, solved: 18, rating: "Средний" },
        { rank: 10, name: "ctf_learner", points: 800, solved: 15, rating: "Начинающий" }
    ];
    
    leaderboardData = mockLeaderboard;
    renderLeaderboard();
}

function renderLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (!leaderboardBody) return;
    
    leaderboardBody.innerHTML = '';
    
    leaderboardData.forEach(player => {
        const row = document.createElement('tr');
        
        // Определение цвета для топ-3
        let rankClass = '';
        if (player.rank === 1) rankClass = 'text-warning';
        else if (player.rank === 2) rankClass = 'text-muted';
        else if (player.rank === 3) rankClass = 'text-accent';
        
        row.innerHTML = `
            <td class="${rankClass}">#${player.rank}</td>
            <td><i class="fas fa-user"></i> ${player.name}</td>
            <td>${player.points}</td>
            <td>${player.solved}</td>
            <td><span class="badge">${player.rating}</span></td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

function filterCTFByCategory(category) {
    // Здесь будет логика фильтрации CTF задач
    showNotification(`Показаны задачи категории: ${category}`, 'info');
}

// ===== ДОКУМЕНТАЦИЯ =====
function initDocs() {
    // Навигация по документации
    document.querySelectorAll('.docs-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const docId = this.dataset.doc;
            showDocument(docId);
            
            // Обновить активную ссылку
            document.querySelectorAll('.docs-nav-link').forEach(l => {
                l.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Быстрые ссылки
    const downloadRulesBtn = document.getElementById('downloadRulesBtn');
    const contactSupportBtn = document.getElementById('contactSupportBtn');
    
    if (downloadRulesBtn) {
        downloadRulesBtn.addEventListener('click', () => {
            showNotification('Файл правил скачивается...', 'info');
            // Здесь будет реальная логика скачивания
        });
    }
    
    if (contactSupportBtn) {
        contactSupportBtn.addEventListener('click', () => {
            switchPage('contacts');
        });
    }
}

function showDocument(docId) {
    const docViewer = document.getElementById('docViewer');
    if (!docViewer) return;
    
    const documents = {
        'about': `
            <h1>CyberSib: Выращиваем IT-щитовиков России</h1>
            
            <p>Мир цифровых технологий нуждается не просто в пользователях, а в защитниках, архитекторах и создателях. CyberSib — это первая русскоязычная платформа, где рождается новое поколение IT-специалистов, закаленных реальными вызовами.</p>
            
            <h2>Три ключевых столпа IT-силы:</h2>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <h3>Практическое обучение</h3>
                    <p>Глубокие курсы по кибербезопасности, системному администрированию и программированию от основ до продвинутых техник.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3>Живая экосистема</h3>
                    <p>Применяйте знания в сражениях на CTF-соревнованиях, развивайте свои идеи в IT-стартап-инкубаторе и получайте прямую связь с работодателями.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>Сообщество единомышленников</h3>
                    <p>Растите в среде таких же увлеченных специалистов, наставников и будущих коллег.</p>
                </div>
            </div>
            
            <h2>Наша миссия</h2>
            <p>Демократизировать доступ к качественному IT-образованию. Мы начинаем свой путь с регионов России, чтобы талант из любой точки страны мог получить знания, опыт и карьерный трамплин.</p>
            
            <div class="alert alert-info">
                <i class="fas fa-rocket"></i>
                <div>
                    <strong>Присоединяйтесь к CyberSib.</strong><br>
                    Здесь ваша теория становится практикой, а навыки — востребованной профессией.
                </div>
            </div>
            
            <blockquote>
                CyberSib — это живая экосистема для будущих IT-специалистов. Обучение, практика в CTF, стартапы и работа. Растем вместе с регионами России.
            </blockquote>
        `,
        'team': `
            <h1>Наша команда</h1>
            
            <div class="alert alert-warning">
                <i class="fas fa-tools"></i>
                <div>
                    <h3>Раздел в разработке</h3>
                    <p>Информация о нашей команде временно недоступна. Мы активно работаем над этим разделом.</p>
                    <p>В скором времени здесь появится информация о наших экспертах, наставниках и разработчиках.</p>
                </div>
            </div>
            
            <p>CyberSib развивается силами профессионального сообщества IT-специалистов, преподавателей и энтузиастов.</p>
            
            <div class="alert alert-info">
                <i class="fas fa-users"></i>
                <div>
                    <strong>Станьте частью нашей команды!</strong><br>
                    Если вы хотите внести вклад в развитие платформы, напишите нам на <a href="mailto:team@cybersib.ru">team@cybersib.ru</a>
                </div>
            </div>
        `,
        'rules': `
            <h1>Правила использования</h1>
            <p><strong>Версия 1.0 от 15.12.2024</strong></p>
            
            <h2>1. Общие положения</h2>
            <p>1.1. Платформа CyberSib предназначена исключительно для образовательных целей.</p>
            <p>1.2. Использование платформы означает согласие с данными правилами.</p>
            
            <h2>2. Права и обязанности пользователей</h2>
            <p>2.1. Пользователь обязуется:</p>
            <ul>
                <li>Использовать платформу только в учебных целях</li>
                <li>Не пытаться взломать или вывести из строя платформу</li>
                <li>Не использовать полученные знания для атак на реальные системы</li>
                <li>Сохранять конфиденциальность учетных данных</li>
            </ul>
            
            <h2>3. Доступ к лабораториям</h2>
            <p>3.1. Лабораторные работы доступны согласно тарифному плану:</p>
            
            <table class="access-table">
                <thead>
                    <tr>
                        <th>Тариф</th>
                        <th>Лаборатории</th>
                        <th>CTF</th>
                        <th>Поддержка</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Free</td>
                        <td>1 в месяц</td>
                        <td>Базовые</td>
                        <td>Электронная</td>
                    </tr>
                    <tr>
                        <td>Pro (600₽/мес)</td>
                        <td>Все</td>
                        <td>Полный доступ</td>
                        <td>Приоритетная</td>
                    </tr>
                    <tr>
                        <td>Premium (1200₽/мес)</td>
                        <td>Все + ранний доступ</td>
                        <td>+ Закрытые турниры</td>
                        <td>24/7</td>
                    </tr>
                </tbody>
            </table>
            
            <h2>4. Ответственность</h2>
            <p>4.1. Администрация не несет ответственности за неправомерное использование знаний, полученных на платформе.</p>
            <p>4.2. Нарушение правил ведет к блокировке аккаунта.</p>
            
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Важно:</strong> Все действия в лабораториях выполняются в изолированной среде.
                    Запрещается использовать эти техники против систем, на которые у вас нет разрешения.
                </div>
            </div>
        `,
        'privacy': `
            <h1>Политика конфиденциальности</h1>
            
            <h2>1. Собираемая информация</h2>
            <p>1.1. При регистрации мы собираем:</p>
            <ul>
                <li>Email адрес</li>
                <li>Имя пользователя</li>
                <li>Группу обучения</li>
            </ul>
            
            <p>1.2. В процессе использования:</p>
            <ul>
                <li>Результаты лабораторных работ</li>
                <li>CTF достижения</li>
                <li>Время активности</li>
            </ul>
            
            <h2>2. Использование информации</h2>
            <p>2.1. Данные используются для:</p>
            <ul>
                <li>Персонализации обучения</li>
                <li>Формирования рейтингов</li>
                <li>Улучшения платформы</li>
                <li>Академической отчетности</li>
            </ul>
            
            <h2>3. Защита данных</h2>
            <p>3.1. Мы используем:</p>
            <ul>
                <li>HTTPS шифрование</li>
                <li>Хеширование паролей (bcrypt)</li>
                <li>JWT токены для аутентификации</li>
                <li>Регулярные security аудиты</li>
            </ul>
        `,
        'setup': `
            <h1>Настройка среды</h1>
            
            <h2>Требования к системе</h2>
            <ul>
                <li>Процессор: 2+ ядра</li>
                <li>Оперативная память: 8+ ГБ</li>
                <li>Свободное место: 20+ ГБ</li>
                <li>Подключение к интернету</li>
            </ul>
            
            <h2>Установка необходимого ПО</h2>
            <h3>1. VirtualBox</h3>
            <pre><code># Для Ubuntu/Debian
sudo apt update
sudo apt install virtualbox virtualbox-ext-pack

# Для Windows
# Скачайте с официального сайта: https://www.virtualbox.org/</code></pre>
            
            <h3>2. Vagrant</h3>
            <pre><code># Для Ubuntu/Debian
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt update
sudo apt install vagrant

# Для Windows
# Скачайте с: https://www.vagrantup.com/downloads</code></pre>
            
            <h2>Подключение к платформе</h2>
            <p>После регистрации вы получите доступ к:</p>
            <ul>
                <li>Веб-интерфейсу лабораторий (noVNC)</li>
                <li>SSH доступу к виртуальным машинам</li>
                <li>Личному кабинету с прогрессом</li>
            </ul>
        `
    };
    
    docViewer.innerHTML = documents[docId] || `
        <h1>Документ не найден</h1>
        <p>Запрошенный документ временно недоступен.</p>
    `;
}

// ===== ФОРМЫ И АУТЕНТИФИКАЦИЯ =====
function initForms() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            loginUser(username, password, rememberMe);
        });
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const group = document.getElementById('regGroup').value;
            
            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают!', 'error');
                return;
            }
            
            registerUser(username, email, password, group);
        });
        
        // Индикатор силы пароля
        const passwordInput = document.getElementById('regPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value);
            });
        }
    }
    
    // Форма обратной связи
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitFeedback();
        });
    }
    
    // Форма смены пароля
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
    
    // Переключение вкладок входа/регистрации
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            document.querySelectorAll('.auth-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(`${tabId}Form`).classList.add('active');
        });
    });
    
    // Переключение вкладок профиля
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            document.querySelectorAll('.profile-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            document.querySelectorAll('.profile-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabId}Pane`).classList.add('active');
        });
    });
}

function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let text = 'Очень слабый';
    let color = 'var(--accent)';
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    strengthBar.style.width = `${strength}%`;
    
    if (strength >= 75) {
        text = 'Очень надежный';
        color = 'var(--secondary)';
    } else if (strength >= 50) {
        text = 'Хороший';
        color = 'var(--primary)';
    } else if (strength >= 25) {
        text = 'Слабый';
        color = 'var(--accent)';
    }
    
    strengthBar.style.background = color;
    strengthText.textContent = `Надежность: ${text}`;
    strengthText.style.color = color;
}

// ===== МОДАЛЬНЫЕ ОКНА =====
function initModals() {
    // Кнопки закрытия модальных окон
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Закрытие модальных окон при клике на фон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Кнопки открытия модальных окон
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const viewRulesBtn = document.getElementById('viewRulesBtn');
    const viewPrivacyBtn = document.getElementById('viewPrivacyBtn');
    
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
            showNotification('Функция восстановления пароля в разработке', 'info');
        });
    }
    
    if (viewRulesBtn) {
        viewRulesBtn.addEventListener('click', () => {
            showDocument('rules');
            closeModal('loginModal');
            switchPage('docs');
        });
    }
    
    if (viewPrivacyBtn) {
        viewPrivacyBtn.addEventListener('click', () => {
            showDocument('privacy');
            closeModal('loginModal');
            switchPage('docs');
        });
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== ПОЛЬЗОВАТЕЛЬ =====
function initUserState() {
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('cybersib_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUserUI(currentUser);
        } catch (e) {
            console.error('Ошибка загрузки пользователя:', e);
            localStorage.removeItem('cybersib_user');
        }
    }
}

function loginUser(username, password, rememberMe) {
    // Демо-пользователь
    if (username === 'demo' && password === 'demo2024') {
        currentUser = {
            id: 'demo-001',
            username: 'Демо Пользователь',
            email: 'demo@cybersib.spt',
            role: 'Студент',
            group: 'ИБ-23',
            points: 150,
            completedLabs: 3,
            subscription: 'free',
            avatar: 'demo'
        };
        
        if (rememberMe) {
            localStorage.setItem('cybersib_user', JSON.stringify(currentUser));
        }
        
        updateUserUI(currentUser);
        closeModal('loginModal');
        showNotification('Демо-вход выполнен успешно!', 'success');
        addTerminalOutput('Пользователь авторизован: Демо Пользователь', 'success');
        
        return;
    }
    
    // Здесь будет реальная аутентификация через API
    showNotification('Реальная аутентификация будет доступна после запуска бэкенда', 'info');
}

function registerUser(username, email, password, group) {
    // Валидация
    if (password.length < 8) {
        showNotification('Пароль должен быть не менее 8 символов', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        showNotification('Введите корректный email', 'error');
        return;
    }
    
    // Демо-регистрация
    currentUser = {
        id: 'user-' + Date.now(),
        username: username,
        email: email,
        role: 'Студент',
        group: group,
        points: 0,
        completedLabs: 0,
        subscription: 'free',
        avatar: 'new'
    };
    
    localStorage.setItem('cybersib_user', JSON.stringify(currentUser));
    updateUserUI(currentUser);
    closeModal('loginModal');
    showNotification('Регистрация успешна! Добро пожаловать в CyberSib!', 'success');
    addTerminalOutput(`Новый пользователь зарегистрирован: ${username}`, 'success');
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('cybersib_user');
    updateUserUI(null);
    showNotification('Вы вышли из системы', 'info');
    addTerminalOutput('Пользователь вышел из системы', 'info');
}

function updateUserUI(user) {
    const userName = document.getElementById('userName');
    const userAvatar = document.querySelector('.user-avatar i');
    
    if (userName) {
        userName.textContent = user ? user.username : 'Гость';
    }
    
    if (userAvatar) {
        userAvatar.className = user ? 'fas fa-user-secret' : 'fas fa-user';
    }
    
    // Обновить данные в профиле
    if (user) {
        document.getElementById('profileUserName').textContent = user.username;
        document.getElementById('profileUserRole').textContent = user.role;
        document.getElementById('profileUserGroup').textContent = user.group;
        document.getElementById('profilePoints').textContent = user.points;
        document.getElementById('profileLabs').textContent = user.completedLabs;
        document.getElementById('profileRank').textContent = calculateRank(user.points);
    }
    
    // Показать/скрыть элементы в зависимости от авторизации
    const authElements = document.querySelectorAll('.auth-only');
    const guestElements = document.querySelectorAll('.guest-only');
    
    authElements.forEach(el => {
        el.style.display = user ? 'flex' : 'none';
    });
    
    guestElements.forEach(el => {
        el.style.display = user ? 'none' : 'flex';
    });
}

function calculateRank(points) {
    if (points >= 2000) return 'Элита';
    if (points >= 1500) return 'Эксперт';
    if (points >= 1000) return 'Профессионал';
    if (points >= 500) return 'Продвинутый';
    if (points >= 100) return 'Средний';
    return 'Начинающий';
}

function changePassword() {
    showNotification('Смена пароля будет доступна после запуска бэкенда', 'info');
}

function submitFeedback() {
    const name = document.getElementById('feedbackName').value;
    const email = document.getElementById('feedbackEmail').value;
    const type = document.getElementById('feedbackType').value;
    const message = document.getElementById('feedbackMessage').value;
    
    if (!name || !email || !type || !message) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    // Здесь будет отправка на сервер
    showNotification('Сообщение отправлено! Спасибо за обратную связь.', 'success');
    
    // Очистить форму
    document.getElementById('feedbackForm').reset();
}

function quickDemoAccess() {
    addTerminalOutput('Инициализация демо-доступа...', 'info');
    addTerminalOutput('Создание временной учетной записи...', 'info');
    
    currentUser = {
        id: 'demo-temp',
        username: 'Демо-Гость',
        role: 'Гость',
        group: 'Демо',
        points: 0,
        completedLabs: 0,
        subscription: 'free'
    };
    
    updateUserUI(currentUser);
    showNotification('Демо-доступ активирован на 1 час', 'success');
    addTerminalOutput('Демо-доступ активирован. Введите "demo" в терминале для старта.', 'success');
}

// ===== УТИЛИТЫ =====
function loadMockData() {
    // Обновляем статистику на главной
    const activeUsers = document.getElementById('activeUsers');
    if (activeUsers) {
        activeUsers.textContent = Math.floor(Math.random() * 50) + 20;
    }
    
    // Загружаем лаборатории если открыта страница
    if (document.getElementById('labsPage')?.classList.contains('active')) {
        loadLabs();
    }
    
    // Загружаем CTF если открыта страница
    if (document.getElementById('ctfPage')?.classList.contains('active')) {
        loadCTFData();
        loadLeaderboard();
    }
    
    // Показываем документ если открыта документация
    if (document.getElementById('docsPage')?.classList.contains('active')) {
        showDocument('about');
    }
}

function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-exclamation-circle' :
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? 'var(--dark-lighter)' : 
                     type === 'error' ? 'rgba(255, 85, 0, 0.1)' : 
                     type === 'warning' ? 'rgba(255, 189, 46, 0.1)' : 'rgba(0, 179, 255, 0.1)'};
        border: 1px solid ${type === 'success' ? 'var(--secondary)' : 
                           type === 'error' ? 'var(--accent)' : 
                           type === 'warning' ? '#ffbd2e' : 'var(--primary)'};
        color: var(--light);
        padding: var(--space-md) var(--space-lg);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        min-width: 300px;
        max-width: 400px;
        z-index: 2001;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Кнопка закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Добавляем анимацию исчезновения
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

function getDifficultyClass(difficulty) {
    switch(difficulty) {
        case 'beginner': return 'difficulty-beginner';
        case 'intermediate': return 'difficulty-intermediate';
        case 'advanced': return 'difficulty-advanced';
        case 'ctf': return 'difficulty-ctf';
        default: return '';
    }
}

function getDifficultyText(difficulty) {
    switch(difficulty) {
        case 'beginner': return 'Начинающий';
        case 'intermediate': return 'Средний';
        case 'advanced': return 'Продвинутый';
        case 'ctf': return 'CTF Задача';
        default: return '';
    }
}

// Глобальные функции для вызова из HTML
window.openModal = openModal;
window.closeModal = closeModal;
window.switchPage = switchPage;
window.openLabModal = openLabModal;
window.startLab = startLab;
window.showDocument = showDocument;

console.log('CyberSib Platform Script Loaded Successfully');