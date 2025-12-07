// CyberSib - Киберполигон СПТ
// Главный JavaScript файл

class CyberSibApp {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('🚀 CyberSib Professional инициализирован');
        
        // Инициализация компонентов
        this.initDatabase();
        this.initUI();
        this.initEventListeners();
        this.initTerminal();
        this.loadContent();
        
        // Показ уведомления о загрузке
        this.showNotification('CyberSib Professional загружен! Добро пожаловать', 'success');
    }
    
    // ===== БАЗА ДАННЫХ =====
    initDatabase() {
        this.db = {
            users: this.loadFromStorage('cybersib_users') || [],
            labs: this.loadFromStorage('cybersib_labs') || this.getDefaultLabs(),
            progress: this.loadFromStorage('cybersib_progress') || [],
            currentUser: this.loadFromStorage('cybersib_currentUser') || null,
            settings: this.loadFromStorage('cybersib_settings') || {},
            ctfScores: this.loadFromStorage('cybersib_ctfScores') || []
        };
        
        this.saveDatabase();
        
        // Создаем демо-данные если база пуста
        if (this.db.users.length === 0) {
            this.createDemoData();
        }
    }
    
    getDefaultLabs() {
        return [
            {
                id: 1,
                title: 'Основы Linux',
                description: 'Изучение базовых команд и структуры файловой системы',
                difficulty: 'beginner',
                points: 10,
                time: '2 часа',
                category: 'linux',
                requirements: 'Базовые знания ОС',
                status: 'available',
                content: `# Лабораторная работа №1: Основы Linux

## Цель работы
Освоить базовые команды Linux терминала, научиться работе с файловой системой и основными утилитами.

## Теоретическая часть
Linux — семейство Unix-подобных операционных систем. Основные особенности:
- Открытый исходный код
- Многозадачность и многопользовательский режим
- Безопасность и стабильность
- Широкие возможности кастомизации

## Практическая часть

### Задание 1: Навигация по файловой системе
\`\`\`bash
# 1. Перейдите в домашнюю директорию
cd ~

# 2. Создайте папку 'lab1'
mkdir lab1

# 3. Перейдите в созданную папку
cd lab1

# 4. Выведите текущий путь
pwd
\`\`\`

### Задание 2: Работа с файлами
\`\`\`bash
# 1. Создайте текстовый файл
echo "Hello, CyberSib!" > hello.txt

# 2. Просмотрите содержимое файла
cat hello.txt

# 3. Создайте копию файла
cp hello.txt hello_backup.txt
\`\`\`

## Контрольные вопросы
1. Чем отличается \`cp\` от \`mv\`?
2. Что делает команда \`chmod 755 file.sh\`?
3. Как просмотреть скрытые файлы?

## Дополнительные материалы
- [Linux Journey](https://linuxjourney.com/) - интерактивное обучение
- [OverTheWire: Bandit](https://overthewire.org/wargames/bandit/) - игра для обучения`
            },
            {
                id: 2,
                title: 'Сетевой анализ с Wireshark',
                description: 'Анализ сетевого трафика и выявление аномалий',
                difficulty: 'beginner',
                points: 15,
                time: '3 часа',
                category: 'network',
                requirements: 'Основы сетевых технологий',
                status: 'available',
                content: '# Лабораторная работа №2: Сетевой анализ...'
            },
            {
                id: 3,
                title: 'Веб-уязвимости: SQL Injection',
                description: 'Изучение и эксплуатация SQL-инъекций',
                difficulty: 'intermediate',
                points: 20,
                time: '4 часа',
                category: 'web',
                requirements: 'Базовые знания SQL и веб-технологий',
                status: 'available'
            },
            {
                id: 4,
                title: 'Атаки на Active Directory',
                description: 'Комплексные атаки на домен Windows',
                difficulty: 'advanced',
                points: 30,
                time: '6 часов',
                category: 'windows',
                requirements: 'Знание Windows Server',
                status: 'available'
            },
            {
                id: 5,
                title: 'CTF: Basic Cryptography',
                description: 'Базовые задачи по криптографии',
                difficulty: 'ctf',
                points: 25,
                time: 'Неограниченно',
                category: 'crypto',
                requirements: 'Все уровни',
                status: 'available'
            },
            {
                id: 6,
                title: 'Forensics: Анализ диска',
                description: 'Восстановление данных и анализ файловой системы',
                difficulty: 'intermediate',
                points: 20,
                time: '3 часа',
                category: 'forensics',
                requirements: 'Знание файловых систем',
                status: 'available'
            },
            {
                id: 7,
                title: 'Python для пентестинга',
                description: 'Создание скриптов для автоматизации тестирования',
                difficulty: 'intermediate',
                points: 25,
                time: '4 часа',
                category: 'programming',
                requirements: 'Базовые знания Python',
                status: 'available'
            },
            {
                id: 8,
                title: 'Metasploit Framework',
                description: 'Работа с фреймворком для эксплуатации уязвимостей',
                difficulty: 'advanced',
                points: 30,
                time: '5 часов',
                category: 'exploitation',
                requirements: 'Знание сетей и ОС',
                status: 'available'
            }
        ];
    }
    
    createDemoData() {
        // Демо-пользователи для коммерческой версии
        const demoUsers = [
            {
                id: 1,
                username: 'demo',
                email: 'demo@cybersib.ru',
                password: 'demo2024',
                group: 'Демо-группа',
                role: 'student',
                points: 45,
                completedLabs: 3,
                rank: 1,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'admin',
                email: 'admin@cybersib.ru',
                password: 'admin2024',
                group: 'Администраторы',
                role: 'admin',
                points: 0,
                completedLabs: 0,
                rank: 0,
                createdAt: new Date().toISOString()
            }
        ];
        
        // Демо-прогресс
        const demoProgress = [
            { userId: 1, labId: 1, status: 'completed', score: 9, startedAt: '2024-01-15', completedAt: '2024-01-16' },
            { userId: 1, labId: 2, status: 'completed', score: 14, startedAt: '2024-01-20', completedAt: '2024-01-21' },
            { userId: 1, labId: 3, status: 'in_progress', score: 0, startedAt: '2024-02-01', completedAt: null }
        ];
        
        // Демо-CTF результаты
        const demoCtfScores = [
            { userId: 1, username: 'demo', score: 150, solved: 5, rank: 1 },
            { userId: 3, username: 'hacker_pro', score: 130, solved: 4, rank: 2 },
            { userId: 4, username: 'security_expert', score: 110, solved: 4, rank: 3 },
            { userId: 5, username: 'new_user', score: 80, solved: 3, rank: 4 },
            { userId: 6, username: 'ctf_master', score: 75, solved: 3, rank: 5 }
        ];
        
        this.db.users = demoUsers;
        this.db.progress = demoProgress;
        this.db.ctfScores = demoCtfScores;
        
        this.saveDatabase();
    }
    
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Ошибка загрузки из хранилища:', e);
            return null;
        }
    }
    
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Ошибка сохранения в хранилище:', e);
        }
    }
    
    saveDatabase() {
        this.saveToStorage('cybersib_users', this.db.users);
        this.saveToStorage('cybersib_labs', this.db.labs);
        this.saveToStorage('cybersib_progress', this.db.progress);
        this.saveToStorage('cybersib_currentUser', this.db.currentUser);
        this.saveToStorage('cybersib_settings', this.db.settings);
        this.saveToStorage('cybersib_ctfScores', this.db.ctfScores);
    }
    
    // ===== ПОЛЬЗОВАТЕЛИ =====
    register(username, email, password, group) {
        // Проверка существующего пользователя
        if (this.db.users.find(u => u.username === username)) {
            return { success: false, error: 'Пользователь с таким логином уже существует' };
        }
        
        if (this.db.users.find(u => u.email === email)) {
            return { success: false, error: 'Пользователь с таким email уже существует' };
        }
        
        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            group,
            role: 'student',
            points: 0,
            completedLabs: 0,
            rank: this.db.users.length + 1,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        
        this.db.users.push(newUser);
        this.saveDatabase();
        
        return { success: true, user: newUser };
    }
    
    login(username, password) {
        const user = this.db.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            user.lastActive = new Date().toISOString();
            this.db.currentUser = user;
            this.saveDatabase();
            
            // Обновляем UI
            this.updateUserUI();
            
            return { success: true, user };
        }
        
        return { success: false, error: 'Неверный логин или пароль' };
    }
    
    logout() {
        this.db.currentUser = null;
        this.saveDatabase();
        
        // Обновляем UI
        this.updateUserUI();
        this.showNotification('Вы вышли из системы', 'info');
    }
    
    updateUserUI() {
        const user = this.db.currentUser;
        const userNameElement = document.getElementById('userName');
        const userDropdown = document.getElementById('userDropdown');
        
        if (user) {
            userNameElement.textContent = user.username;
            
            // Обновляем меню пользователя
            const loginBtn = document.getElementById('loginBtn');
            const registerBtn = document.getElementById('registerBtn');
            const profileBtn = document.getElementById('profileBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            const settingsBtn = document.getElementById('settingsBtn');
            
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (profileBtn) profileBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (settingsBtn) settingsBtn.style.display = 'block';
            
            // Показываем имя в профиле
            document.getElementById('profileUserName').textContent = user.username;
            document.getElementById('profileUserRole').textContent = user.role === 'student' ? 'Студент' : 'Администратор';
            document.getElementById('profileUserGroup').textContent = user.group;
            document.getElementById('profilePoints').textContent = user.points;
            document.getElementById('profileLabs').textContent = user.completedLabs;
            document.getElementById('profileRank').textContent = user.rank;
            
            this.showNotification(`Добро пожаловать, ${user.username}!`, 'success');
        } else {
            userNameElement.textContent = 'Гость';
            
            // Обновляем меню пользователя
            const loginBtn = document.getElementById('loginBtn');
            const registerBtn = document.getElementById('registerBtn');
            const profileBtn = document.getElementById('profileBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            const settingsBtn = document.getElementById('settingsBtn');
            
            if (loginBtn) loginBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'block';
            if (profileBtn) profileBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (settingsBtn) settingsBtn.style.display = 'none';
        }
    }
    
    // ===== ЛАБОРАТОРИИ =====
    loadLabs() {
        const container = document.getElementById('labsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.db.labs.forEach(lab => {
            const progress = this.db.progress.find(p => 
                p.userId === (this.db.currentUser?.id || 0) && p.labId === lab.id
            );
            
            const labCard = this.createLabCard(lab, progress);
            container.appendChild(labCard);
        });
        
        // Инициализация фильтрации
        setTimeout(() => {
            this.initLabFilters();
        }, 0);
    }
    
    createLabCard(lab, progress) {
        const card = document.createElement('div');
        card.className = 'lab-card';
        card.dataset.difficulty = lab.difficulty;
        card.dataset.category = lab.category;
        
        let statusText = 'Начать';
        let statusClass = '';
        
        if (progress) {
            if (progress.status === 'completed') {
                statusText = `Завершено (${progress.score}/${lab.points})`;
                statusClass = 'completed';
            } else if (progress.status === 'in_progress') {
                statusText = 'Продолжить';
                statusClass = 'in-progress';
            }
        }
        
        card.innerHTML = `
            <div class="lab-header">
                <span class="lab-difficulty difficulty-${lab.difficulty}">
                    ${this.getDifficultyLabel(lab.difficulty)}
                </span>
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
                <button class="lab-btn ${statusClass}" data-lab-id="${lab.id}">
                    <i class="fas fa-play"></i>
                    <span>${statusText}</span>
                </button>
            </div>
        `;
        
        // Добавляем обработчик клика
        const btn = card.querySelector('.lab-btn');
        btn.addEventListener('click', () => this.openLabModal(lab.id));
        
        return card;
    }
    
    getDifficultyLabel(difficulty) {
        const labels = {
            'beginner': 'Начинающий',
            'intermediate': 'Средний',
            'advanced': 'Продвинутый',
            'ctf': 'CTF'
        };
        return labels[difficulty] || difficulty;
    }
    
    initLabFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('labSearch');
        
        if (filterBtns.length === 0) return;
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Убираем активный класс у всех кнопок
                filterBtns.forEach(b => b.classList.remove('active'));
                // Добавляем активный класс текущей кнопке
                btn.classList.add('active');
                
                this.filterLabs(btn.dataset.filter, searchInput ? searchInput.value : '');
            });
        });
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const activeFilter = document.querySelector('.filter-btn.active');
                this.filterLabs(activeFilter?.dataset.filter || 'all', searchInput.value);
            });
        }
        
        // Инициализируем фильтрацию по умолчанию
        this.filterLabs('all', '');
    }
    
    filterLabs(filter, searchTerm = '') {
        const cards = document.querySelectorAll('.lab-card');
        
        cards.forEach(card => {
            const difficulty = card.dataset.difficulty;
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.lab-description').textContent.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            let matchesFilter = filter === 'all' || difficulty === filter;
            let matchesSearch = !searchTerm || 
                title.includes(searchLower) || 
                description.includes(searchLower);
            
            card.style.display = matchesFilter && matchesSearch ? 'block' : 'none';
        });
    }
    
    openLabModal(labId) {
        if (!this.db.currentUser) {
            this.showNotification('Сначала войдите в систему', 'warning');
            this.openModal('loginModal');
            return;
        }
        
        const lab = this.db.labs.find(l => l.id === labId);
        if (!lab) return;
        
        const modal = document.getElementById('labModal');
        const title = document.getElementById('labModalTitle');
        const body = modal.querySelector('.modal-body');
        
        title.textContent = lab.title;
        
        // Проверяем прогресс пользователя
        const progress = this.db.progress.find(p => 
            p.userId === this.db.currentUser.id && p.labId === lab.id
        );
        
        body.innerHTML = `
            <div class="lab-modal-content">
                <div class="lab-info">
                    <div class="lab-meta">
                        <span class="badge difficulty-${lab.difficulty}">
                            ${this.getDifficultyLabel(lab.difficulty)}
                        </span>
                        <span class="points">
                            <i class="fas fa-star"></i> ${lab.points} очков
                        </span>
                        <span class="time">
                            <i class="fas fa-clock"></i> ${lab.time}
                        </span>
                    </div>
                    
                    <p class="lab-description">${lab.description}</p>
                    
                    <div class="lab-requirements">
                        <h4><i class="fas fa-graduation-cap"></i> Требования:</h4>
                        <p>${lab.requirements}</p>
                    </div>
                    
                    ${progress ? `
                        <div class="lab-progress">
                            <h4><i class="fas fa-chart-line"></i> Ваш прогресс:</h4>
                            <p>Статус: ${progress.status === 'completed' ? 'Завершено' : 'В процессе'}</p>
                            <p>Оценка: ${progress.score}/${lab.points}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="lab-actions">
                    <button class="btn btn-primary btn-block" id="startLabBtn">
                        <i class="fas fa-play-circle"></i>
                        ${progress ? (progress.status === 'completed' ? 'Повторить' : 'Продолжить') : 'Начать лабораторию'}
                    </button>
                    
                    <button class="btn btn-outline btn-block" id="viewGuideBtn">
                        <i class="fas fa-book"></i> Открыть руководство
                    </button>
                </div>
            </div>
        `;
        
        // Добавляем обработчики
        const startBtn = body.querySelector('#startLabBtn');
        const guideBtn = body.querySelector('#viewGuideBtn');
        
        startBtn.addEventListener('click', () => this.startLab(lab.id));
        guideBtn.addEventListener('click', () => this.showLabGuide(lab));
        
        this.openModal('labModal');
    }
    
    startLab(labId) {
        if (!this.db.currentUser) return;
        
        const lab = this.db.labs.find(l => l.id === labId);
        if (!lab) return;
        
        // Создаем или обновляем прогресс
        let progress = this.db.progress.find(p => 
            p.userId === this.db.currentUser.id && p.labId === lab.id
        );
        
        if (!progress) {
            progress = {
                userId: this.db.currentUser.id,
                labId: lab.id,
                status: 'in_progress',
                score: 0,
                startedAt: new Date().toISOString(),
                completedAt: null,
                attempts: 1
            };
            this.db.progress.push(progress);
        } else {
            progress.status = 'in_progress';
            progress.attempts++;
        }
        
        this.saveDatabase();
        
        // Закрываем модальное окно
        this.closeModal('labModal');
        
        // Показываем уведомление
        this.showNotification(`Лаборатория "${lab.title}" запущена!`, 'success');
        
        // Обновляем список лабораторий
        this.loadLabs();
    }
    
    showLabGuide(lab) {
        // Закрываем текущее модальное окно
        this.closeModal('labModal');
        
        // Открываем документацию с руководством
        this.showDocument('lab' + lab.id);
        this.switchPage('docs');
    }
    
    completeLab(userId, labId, score) {
        const progress = this.db.progress.find(p => p.userId === userId && p.labId === labId);
        const lab = this.db.labs.find(l => l.id === labId);
        const user = this.db.users.find(u => u.id === userId);
        
        if (progress && lab && user) {
            progress.status = 'completed';
            progress.score = score;
            progress.completedAt = new Date().toISOString();
            
            // Обновляем статистику пользователя
            user.points += score;
            user.completedLabs++;
            
            this.saveDatabase();
            
            // Показываем уведомление
            this.showNotification(`Лаборатория завершена! Вы получили ${score} очков`, 'success');
            
            // Обновляем UI
            this.updateUserUI();
            this.loadLabs();
            
            return { success: true };
        }
        
        return { success: false };
    }
    
    // ===== CTF =====
    loadCTFLeaderboard() {
        const container = document.getElementById('leaderboardBody');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Сортируем по очкам
        const sortedScores = [...this.db.ctfScores].sort((a, b) => b.score - a.score);
        
        sortedScores.forEach((player, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${player.username}</strong></td>
                <td>${player.score}</td>
                <td>${player.solved}</td>
                <td>
                    <span class="badge ${index < 3 ? 'top-rank' : ''}">
                        ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '#' + (index + 1)}
                    </span>
                </td>
            `;
            container.appendChild(row);
        });
    }
    
    // ===== ДОКУМЕНТАЦИЯ =====
    loadDocumentation() {
        const navLinks = document.querySelectorAll('.docs-nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Убираем активный класс у всех ссылок
                navLinks.forEach(l => l.classList.remove('active'));
                // Добавляем активный класс текущей ссылке
                link.classList.add('active');
                
                // Загружаем документ
                const docId = link.dataset.doc;
                this.showDocument(docId);
            });
        });
        
        // Загружаем первый документ по умолчанию
        this.showDocument('about');
    }
    
    showDocument(docId) {
        const viewer = document.getElementById('docViewer');
        if (!viewer) return;
        
        let content = '';
        
        switch(docId) {
            case 'about':
                content = this.getAboutDocument();
                break;
            case 'license':
                content = this.getLicenseDocument();
                break;
            case 'rules':
                content = this.getRulesDocument();
                break;
            case 'privacy':
                content = this.getPrivacyDocument();
                break;
            case 'team':
                content = this.getTeamDocument();
                break;
            case 'setup':
                content = this.getSetupDocument();
                break;
            case 'access':
                content = this.getAccessDocument();
                break;
            case 'report':
                content = this.getReportDocument();
                break;
            default:
                content = '<h1>Документ не найден</h1><p>Выберите другой документ из меню.</p>';
        }
        
        viewer.innerHTML = content;
    }
    
    getAboutDocument() {
        return `
            <h1>О проекте CyberSib</h1>
            
            <div class="alert alert-success">
                <i class="fas fa-graduation-cap"></i>
                <strong>Образовательная платформа, созданная студентами для студентов</strong>
            </div>
            
            <p><strong>CyberSib</strong> — это студенческий проект, созданный для практического обучения информационной безопасности. Платформа разрабатывается студентами IT-специальностей Сибирского политехнического техникума.</p>
            
            <h2>🎓 Кто мы?</h2>
            <ul>
                <li><strong>Студенты</strong> специальности "Информационная безопасность"</li>
                <li><strong>Будущие специалисты</strong> в области кибербезопасности</li>
                <li><strong>Энтузиасты</strong>, которые хотят сделать обучение практическим</li>
                <li><strong>Команда</strong> единомышленников, объединенных общей целью</li>
            </ul>
            
            <h2>🎯 Наша миссия</h2>
            <p>Создать доступную и понятную образовательную среду, где каждый студент может:</p>
            <ul>
                <li>Получить практические навыки в безопасной среде</li>
                <li>Подготовиться к реальным задачам в IT-безопасности</li>
                <li>Развить навыки командной работы и решения проблем</li>
                <li>Создать портфолио выполненных проектов</li>
                <li>Подготовиться к трудоустройству в IT-сфере</li>
            </ul>
            
            <h2>🏫 Наш партнер</h2>
            <div class="alert alert-info">
                <i class="fas fa-university"></i>
                <strong>Сибирский политехнический техникум</strong><br>
                Кемеровская область - Кузбасс, г. Кемерово, ул. Павленко, 1А
            </div>
            
            <h2>👥 Наша команда</h2>
            <p>Мы — студенты 2-3 курсов, которые:</p>
            <ul>
                <li><strong>Разрабатывают</strong> платформу и лабораторные работы</li>
                <li><strong>Тестируют</strong> функционал и безопасность</li>
                <li><strong>Создают</strong> документацию и учебные материалы</li>
                <li><strong>Помогают</strong> другим студентам в обучении</li>
            </ul>
            
            <h2>🚀 Этапы развития</h2>
            <ol>
                <li><strong>2024-2025</strong> - Разработка и тестирование (текущий этап)</li>
                <li><strong>2025-2026</strong> - Внедрение в учебный процесс СПТ</li>
                <li><strong>2026-2027</strong> - Масштабирование для других учебных заведений</li>
                <li><strong>2027+</strong> - Коммерческое развитие платформы</li>
            </ol>
            
            <h2>🤝 Присоединиться к проекту</h2>
            <p>Если ты студент и хочешь:</p>
            <ul>
                <li>Участвовать в разработке</li>
                <li>Тестировать лабораторные работы</li>
                <li>Предложить идеи для улучшения</li>
                <li>Просто узнать больше о кибербезопасности</li>
            </ul>
            
            <div class="contact-options">
                <a href="https://t.me/spt42" target="_blank" class="btn btn-primary">
                    <i class="fab fa-telegram"></i> Написать в Telegram
                </a>
                <a href="mailto:cyberrange@spt.edu" class="btn btn-outline">
                    <i class="fas fa-envelope"></i> Написать на почту
                </a>
            </div>
            
            <div class="alert alert-warning" style="margin-top: var(--space-xl);">
                <i class="fas fa-heart"></i>
                <strong>Создано с ❤️ студентами для студентов</strong><br>
                Проект находится в активной разработке. Мы открыты для предложений и сотрудничества!
            </div>
        `;
    }
    
    getTeamDocument() {
        return `
            <h1>Наша команда</h1>
            
            <div class="alert alert-info">
                <i class="fas fa-users"></i>
                <strong>Студенческая команда разработчиков</strong><br>
                Все участники — студенты Сибирского политехнического техникума
            </div>
            
            <div class="team-grid">
                <div class="team-member">
                    <div class="team-avatar">
                        <i class="fas fa-code"></i>
                    </div>
                    <h3>Разработчики</h3>
                    <p class="team-role">Фронтенд и бэкенд</p>
                    <p class="team-info">Студенты 2-3 курсов, разрабатывающие платформу на Python, JavaScript, HTML/CSS</p>
                    <p class="team-contacts">
                        <i class="fab fa-github"></i> Пишем код, тестируем, дебажим<br>
                        <i class="fas fa-laptop-code"></i> Создаем интерфейсы и логику
                    </p>
                </div>
                
                <div class="team-member">
                    <div class="team-avatar">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3>Специалисты по безопасности</h3>
                    <p class="team-role">Тестирование и безопасность</p>
                    <p class="team-info">Студенты, проверяющие безопасность платформы и создающие лабораторные работы</p>
                    <p class="team-contacts">
                        <i class="fas fa-bug"></i> Ищем уязвимости<br>
                        <i class="fas fa-flask"></i> Создаем практические задания
                    </p>
                </div>
                
                <div class="team-member">
                    <div class="team-avatar">
                        <i class="fas fa-book"></i>
                    </div>
                    <h3>Учебные материалы</h3>
                    <p class="team-role">Документация и обучение</p>
                    <p class="team-info">Студенты, создающие инструкции, руководства и помогающие другим в обучении</p>
                    <p class="team-contacts">
                        <i class="fas fa-file-alt"></i> Пишем документацию<br>
                        <i class="fas fa-chalkboard-teacher"></i> Помогаем с обучением
                    </p>
                </div>
            </div>
            
            <h2>🏫 Руководство проекта</h2>
            <div class="alert alert-success">
                <i class="fas fa-user-tie"></i>
                <strong>Кураторы от техникума</strong><br>
                Преподаватели СПТ, оказывающие методическую поддержку и консультации
            </div>
            
            <h2>🎯 Как мы работаем?</h2>
            <ul>
                <li><strong>Еженедельные встречи</strong> - обсуждение прогресса и планов</li>
                <li><strong>Распределение задач</strong> - каждый работает над тем, что ему интересно</li>
                <li><strong>Взаимопомощь</strong> - помогаем друг другу в обучении и разработке</li>
                <li><strong>Постоянное обучение</strong> - изучаем новые технологии в процессе</li>
            </ul>
            
            <h2>🤝 Присоединиться к команде</h2>
            <p>Мы всегда рады новым участникам! Если ты:</p>
            <ul>
                <li>Студент СПТ или другого учебного заведения</li>
                <li>Интересуешься IT и кибербезопасностью</li>
                <li>Хочешь получить реальный опыт разработки</li>
                <li>Готов учиться и помогать другим</li>
            </ul>
            
            <div class="contact-options">
                <a href="https://t.me/spt42" target="_blank" class="btn btn-primary">
                    <i class="fab fa-telegram"></i> Написать в общий чат
                </a>
                <a href="mailto:cyberrange@spt.edu" class="btn btn-outline">
                    <i class="fas fa-envelope"></i> Отправить заявку
                </a>
            </div>
            
            <div class="alert alert-warning" style="margin-top: var(--space-xl);">
                <i class="fas fa-handshake"></i>
                <strong>Открыты для сотрудничества!</strong><br>
                Готовы делиться опытом, помогать другим студенческим проектам и развивать IT-сообщество.
            </div>
        `;
    }
    
    getLicenseDocument() {
        return `
            <h1>Лицензионное соглашение</h1>
            
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Коммерческая лицензия</strong> CyberSib Platform
            </div>
            
            <h2>1. Права использования</h2>
            <p>1.1. CyberSib Platform является коммерческим продуктом и предоставляется по лицензионному соглашению.</p>
            <p>1.2. Права на использование платформы предоставляются на основании договора.</p>
            <p>1.3. Запрещается любое копирование, модификация или распространение платформы без письменного разрешения.</p>
            
            <h2>2. Для образовательных учреждений</h2>
            <p>2.1. Образовательные учреждения могут использовать платформу в учебных целях.</p>
            <p>2.2. Предоставляются специальные образовательные лицензии.</p>
            <p>2.3. Студенты получают доступ в рамках учебного процесса.</p>
            
            <h2>3. Для корпоративных клиентов</h2>
            <p>3.1. Корпоративные клиенты получают расширенный функционал.</p>
            <p>3.2. Доступны индивидуальные лабораторные работы.</p>
            <p>3.3. Предоставляется техническая поддержка и обучение.</p>
            
            <h2>4. Контакты для лицензирования</h2>
            <p>По вопросам лицензирования:</p>
            <ul>
                <li><strong>Email:</strong> license@cybersib.ru</li>
                <li><strong>Телефон:</strong> +7 (XXX) XXX-XX-XX</li>
                <li><strong>Контакты для договоров:</strong> legal@cybersib.ru</li>
            </ul>
            
            <h2>5. Техническая поддержка</h2>
            <p>5.1. Поддержка предоставляется в рабочее время.</p>
            <p>5.2. Экстренная поддержка — 24/7 для корпоративных клиентов.</p>
            <p>5.3. Обновления и патчи безопасности предоставляются регулярно.</p>
            
            <div class="alert alert-info">
                <i class="fas fa-file-contract"></i>
                <strong>Лицензионное соглашение:</strong> Использование платформы означает принятие условий лицензионного соглашения.
            </div>
        `;
    }
    
    getRulesDocument() {
        return `
            <h1>Правила использования платформы</h1>
            
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Внимание!</strong> Нарушение правил может привести к блокировке доступа.
            </div>
            
            <h2>1. Общие положения</h2>
            <p>1.1. Платформа "CyberSib" является коммерческим продуктом.</p>
            <p>1.2. Все пользователи обязаны соблюдать законодательство РФ.</p>
            <p>1.3. Администрация платформы оставляет за собой право изменять правила.</p>
            
            <h2>2. Цели использования</h2>
            <p>2.1. Платформа предназначена исключительно для:</p>
            <ul>
                <li>Учебных и исследовательских целей</li>
                <li>Подготовки к соревнованиям по кибербезопасности</li>
                <li>Выполнения лабораторных работ</li>
                <li>Развития практических навыков</li>
            </ul>
            
            <h2>3. Запрещенные действия</h2>
            <p>3.1. Запрещается использовать платформу для:</p>
            <ul>
                <li>Проведения реальных атак на системы вне платформы</li>
                <li>Нарушения работы платформы другими пользователями</li>
                <li>Распространения вредоносного ПО</li>
                <li>Обхода систем аутентификации</li>
                <li>Любых противоправных действий</li>
            </ul>
            
            <h2>4. Безопасность</h2>
            <p>4.1. Все действия выполняются в изолированной среде.</p>
            <p>4.2. Запрещается пытаться выйти за пределы изоляции.</p>
            <p>4.3. Обязательно соблюдение этических норм.</p>
            
            <h2>5. Ответственность</h2>
            <p>5.1. Пользователь несет ответственность за свои действия.</p>
            <p>5.2. Администрация не несет ответственности за неправомерное использование.</p>
            <p>5.3. Все действия логируются и могут быть использованы как доказательства.</p>
            
            <h2>6. Контакты</h2>
            <p>По всем вопросам:</p>
            <ul>
                <li><strong>Техническая поддержка:</strong> support@cybersib.ru</li>
                <li><strong>Экстренные случаи:</strong> security@cybersib.ru</li>
                <li><strong>Telegram поддержка:</strong> @cybersib_support</li>
            </ul>
            
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <strong>Согласие:</strong> Используя платформу CyberSib, вы подтверждаете согласие с правилами.
            </div>
        `;
    }
    
    getPrivacyDocument() {
        return `
            <h1>Политика конфиденциальности</h1>
            
            <h2>1. Сбор данных</h2>
            <p>Мы собираем минимально необходимые данные:</p>
            <ul>
                <li>Имя пользователя (логин)</li>
                <li>Академическая группа или организация</li>
                <li>Статистика выполнения работ</li>
                <li>IP-адрес (для мониторинга)</li>
            </ul>
            
            <h2>2. Использование данных</h2>
            <p>Данные используются исключительно для:</p>
            <ul>
                <li>Аутентификации и авторизации</li>
                <li>Отслеживания учебного прогресса</li>
                <li>Улучшения образовательного процесса</li>
                <li>Обеспечения безопасности платформы</li>
            </ul>
            
            <h2>3. Защита данных</h2>
            <p>3.1. Все данные хранятся на защищенных серверах.</p>
            <p>3.2. Используется шифрование передаваемых данных.</p>
            <p>3.3. Регулярно проводятся проверки безопасности.</p>
            
            <h2>4. Права пользователей</h2>
            <p>Каждый пользователь имеет право:</p>
            <ul>
                <li>На доступ к своим данным</li>
                <li>На исправление информации</li>
                <li>На удаление аккаунта</li>
                <li>На получение копии данных</li>
            </ul>
            
            <h2>5. Контакты</h2>
            <p>По вопросам конфиденциальности:</p>
            <p><strong>Email:</strong> privacy@cybersib.ru</p>
            <p><strong>Телефон:</strong> +7 (XXX) XXX-XX-XX</p>
            
            <div class="alert alert-info">
                <i class="fas fa-shield-alt"></i>
                <strong>Последнее обновление:</strong> ${new Date().toLocaleDateString('ru-RU')}
            </div>
        `;
    }
    
    getSetupDocument() {
        return `
            <h1>Настройка рабочей среды</h1>
            
            <h2>1. Требования к оборудованию</h2>
            <ul>
                <li>Процессор: Intel Core i5 или аналогичный (минимум 4 ядра)</li>
                <li>Оперативная память: 8 ГБ (рекомендуется 16 ГБ)</li>
                <li>Свободное место на диске: 50 ГБ</li>
                <li>Поддержка виртуализации (VT-x/AMD-V)</li>
                <li>Стабильное интернет -соединение</li>
            </ul>
            
            <h2>2. Установка ПО</h2>
            
            <h3>2.1. Виртуализация</h3>
            <p><strong>VMware Workstation Player (бесплатно для личного использования)</strong></p>
            <pre><code># Скачать с официального сайта:
https://www.vmware.com/products/workstation-player.html

# Установить, следуя инструкциям установщика</code></pre>
            
            <h3>2.2. Kali Linux</h3>
            <pre><code># 1. Скачать образ:
https://www.kali.org/get-kali/

# 2. Создать виртуальную машину:
- Тип: Linux
- Версия: Debian (64-bit)
- Память: 4096 МБ
- Диск: 50 ГБ

# 3. Установить гостевые дополнения</code></pre>
            
            <h2>3. Подключение к платформе</h2>
            <pre><code># SSH доступ:
ssh student@platform.cybersib.ru -p 2222
Пароль: [выдается при регистрации]

# Веб-интерфейс:
https://platform.cybersib.ru
Логин: ваш логин
Пароль: ваш пароль</code></pre>
            
            <h2>4. Быстрый старт</h2>
            <ol>
                <li>Зарегистрируйтесь на платформе</li>
                <li>Запустите виртуальную машину с Kali Linux</li>
                <li>Подключитесь к платформе по SSH</li>
                <li>Начните первую лабораторную работу</li>
            </ol>
            
            <div class="alert alert-success">
                <i class="fas fa-life-ring"></i>
                <strong>Нужна помощь?</strong> support@cybersib.ru
            </div>
        `;
    }
    
    getAccessDocument() {
        return `
            <h1>Подключение к платформе</h1>
            
            <h2>1. Доступные методы подключения</h2>
            
            <table class="access-table">
                <thead>
                    <tr>
                        <th>Метод</th>
                        <th>Назначение</th>
                        <th>Порт</th>
                        <th>Учетные данные</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>SSH</strong></td>
                        <td>Доступ к терминалу Linux машин</td>
                        <td>2222</td>
                        <td>Ваш логин/пароль</td>
                    </tr>
                    <tr>
                        <td><strong>RDP</strong></td>
                        <td>Доступ к Windows машинам</td>
                        <td>3389</td>
                        <td>Administrator/Passw0rd!</td>
                    </tr>
                    <tr>
                        <td><strong>Веб-интерфейс</strong></td>
                        <td>Основной доступ к платформе</td>
                        <td>443</td>
                        <td>Ваш логин/пароль</td>
                    </tr>
                </tbody>
            </table>
            
            <h2>2. SSH подключение</h2>
            
            <h3>2.1. Linux/macOS</h3>
            <pre><code># Базовое подключение
ssh ваш_логин@platform.cybersib.ru -p 2222

# С пробросом портов
ssh -L 8080:localhost:80 ваш_логин@platform.cybersib.ru -p 2222</code></pre>
            
            <h2>3. Доступ к веб-приложениям</h2>
            <pre><code># После подключения по SSH:
ssh -L 8080:192.168.1.100:80 ваш_логин@platform.cybersib.ru -p 2222

# Откройте в браузере:
http://localhost:8080</code></pre>
            
            <h2>4. Файловый доступ</h2>
            <pre><code># SFTP доступ:
sftp -P 2222 ваш_логин@platform.cybersib.ru

# SMB доступ (Windows):
\\\\192.168.1.100\\share</code></pre>
            
            <h2>5. Безопасность подключения</h2>
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Важные правила:</strong>
                <ul>
                    <li>Не передавайте учетные данные</li>
                    <li>Используйте сложные пароли</li>
                    <li>Выходите из системы после работы</li>
                    <li>Сообщайте о подозрительной активности</li>
                </ul>
            </div>
        `;
    }
    
    getReportDocument() {
        return `
            <h1>Отчетность по лабораторным работам</h1>
            
            <h2>1. Требования к отчету</h2>
            <p>Каждая лабораторная работа должна сопровождаться отчетом, содержащим:</p>
            <ol>
                <li>Титульный лист</li>
                <li>Цель работы</li>
                <li>Теоретическая часть</li>
                <li>Практическая часть</li>
                <li>Контрольные вопросы</li>
                <li>Выводы</li>
            </ol>
            
            <h2>2. Оформление отчета</h2>
            <ul>
                <li><strong>Формат:</strong> PDF</li>
                <li><strong>Шрифт:</strong> Times New Roman, 14pt</li>
                <li><strong>Межстрочный интервал:</strong> 1.5</li>
                <li><strong>Скриншоты:</strong> с подписями</li>
                <li><strong>Код:</strong> с подсветкой синтаксиса</li>
            </ul>
            
            <h2>3. Система оценки</h2>
            <table class="grading-table">
                <thead>
                    <tr>
                        <th>Критерий</th>
                        <th>Макс. баллов</th>
                        <th>Описание</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Полнота выполнения</td>
                        <td>40</td>
                        <td>Все задания выполнены</td>
                    </tr>
                    <tr>
                        <td>Качество отчета</td>
                        <td>30</td>
                        <td>Структура и оформление</td>
                    </tr>
                    <tr>
                        <td>Понимание материала</td>
                        <td>20</td>
                        <td>Ответы на вопросы</td>
                    </tr>
                    <tr>
                        <td>Творческий подход</td>
                        <td>10</td>
                        <td>Дополнительные исследования</td>
                    </tr>
                </tbody>
            </table>
            
            <h2>4. Сроки сдачи</h2>
            <ul>
                <li><strong>Стандартный срок:</strong> 1 неделя</li>
                <li><strong>Просрочка:</strong> -10% за неделю</li>
                <li><strong>Пересдача:</strong> не более 2 раз</li>
            </ul>
            
            <h2>5. Загрузка отчетов</h2>
            <ol>
                <li>Войдите в личный кабинет</li>
                <li>Перейдите к завершенной работе</li>
                <li>Нажмите "Загрузить отчет"</li>
                <li>Выберите файл PDF</li>
                <li>Добавьте комментарий</li>
            </ol>
            
            <h2>6. Полезные советы</h2>
            <div class="tips">
                <div class="tip">
                    <i class="fas fa-lightbulb"></i>
                    <strong>Делайте скриншоты</strong>
                    <p>Используйте инструменты для создания скриншотов</p>
                </div>
                
                <div class="tip">
                    <i class="fas fa-code"></i>
                    <strong>Сохраняйте команды</strong>
                    <p>Используйте команду script для записи сессии</p>
                </div>
                
                <div class="tip">
                    <i class="fas fa-book"></i>
                    <strong>Ссылайтесь на источники</strong>
                    <p>Указывайте использованные материалы</p>
                </div>
            </div>
        `;
    }
    
    // ===== ТЕРМИНАЛ =====
    initTerminal() {
        this.terminalOutput = document.getElementById('terminalOutput');
        this.terminalCmd = document.getElementById('terminalCmd');
        
        if (!this.terminalOutput || !this.terminalCmd) return;
        
        // Инициализируем терминал
        this.clearTerminal();
        this.addTerminalLines([
            "> Добро пожаловать в CyberSib!",
            "> Образовательная платформа для обучения кибербезопасности",
            "> Создана студентами для студентов",
            ">",
            "> Системная информация:",
            "> • Загружено лабораторных работ: " + this.db.labs.length,
            "> • Активных пользователей: " + this.db.users.length,
            "> • Последнее обновление: " + new Date().toLocaleDateString('ru-RU'),
            ">",
            "> Доступные команды:",
            "> • help - показать справку",
            "> • labs - список лабораторных",
            "> • status - статус системы",
            "> • clear - очистить терминал",
            "> • about - о проекте",
            ">",
            "> Введите 'help' для начала работы..."
        ]);
        
        // Обработчик ввода команд
        this.terminalCmd.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = this.terminalCmd.value.trim();
                this.processTerminalCommand(command);
                this.terminalCmd.value = '';
            }
        });
        
        // Обработчик колесика мыши для терминала
        this.terminalOutput.addEventListener('wheel', (e) => {
            // Прокручиваем только терминал, не всю страницу
            e.stopPropagation();
        });
        
        // Фокус на поле ввода при клике в терминал
        this.terminalOutput.addEventListener('click', (e) => {
            // Клик только в область вывода фокусирует поле ввода
            if (e.target === this.terminalOutput || e.target.classList.contains('terminal-line')) {
                this.terminalCmd.focus();
                e.preventDefault();
            }
        });
        
        // Автофокус на поле ввода
        setTimeout(() => {
            this.terminalCmd.focus();
        }, 500);
    }
    
    clearTerminal() {
        if (this.terminalOutput) {
            this.terminalOutput.innerHTML = '';
        }
    }
    
    addTerminalLines(lines) {
        if (!this.terminalOutput) return;
        
        lines.forEach(line => {
            const lineElement = document.createElement('div');
            lineElement.className = 'terminal-line';
            lineElement.textContent = line;
            this.terminalOutput.appendChild(lineElement);
        });
        
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }
    
    addTerminalLine(text, type = 'normal') {
        if (!this.terminalOutput) return;
        
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.textContent = text;
        
        this.terminalOutput.appendChild(line);
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }
    
    processTerminalCommand(command) {
        if (!command) return;
        
        // Выводим команду
        this.addTerminalLine(`root@cybersib-platform:~$ ${command}`);
        
        // Обрабатываем команду
        const cmd = command.toLowerCase().split(' ')[0];
        const args = command.split(' ').slice(1);
        
        switch(cmd) {
            case 'help':
                this.showTerminalHelp();
                break;
                
            case 'labs':
                this.showTerminalLabs();
                break;
                
            case 'status':
                this.showTerminalStatus();
                break;
                
            case 'clear':
                this.clearTerminal();
                break;
                
            case 'user':
                this.showTerminalUser(args);
                break;
                
            case 'connect':
                this.showTerminalConnect();
                break;
                
            case 'about':
                this.showTerminalAbout();
                break;
                
            case 'demo':
                this.showTerminalDemo();
                break;
                
            default:
                this.addTerminalLine(`Команда '${command}' не найдена. Введите 'help' для справки.`, 'error');
        }
    }
    
    showTerminalHelp() {
        this.addTerminalLine('Доступные команды:', 'info');
        this.addTerminalLine('  help                - показать эту справку');
        this.addTerminalLine('  labs                - список лабораторных работ');
        this.addTerminalLine('  status              - статус системы и статистика');
        this.addTerminalLine('  user [info/login]   - информация о пользователе');
        this.addTerminalLine('  about               - информация о проекте');
        this.addTerminalLine('  clear               - очистить терминал');
        this.addTerminalLine('');
        this.addTerminalLine('Примеры:', 'info');
        this.addTerminalLine('  user info           - информация о текущем пользователе');
        this.addTerminalLine('  labs beginner       - лабораторные для начинающих');
        this.addTerminalLine('  about               - узнать о проекте CyberSib');
    }
    
    showTerminalLabs() {
        this.addTerminalLine('Доступные лабораторные работы:', 'info');
        
        this.db.labs.forEach(lab => {
            const progress = this.db.progress.find(p => 
                p.userId === (this.db.currentUser?.id || 0) && p.labId === lab.id
            );
            
            let status = '🔴 НЕ НАЧАТО';
            if (progress) {
                status = progress.status === 'completed' ? '🟢 ЗАВЕРШЕНО' : '🟡 В ПРОЦЕССЕ';
            }
            
            this.addTerminalLine(`  ${lab.id}. ${lab.title} [${this.getDifficultyLabel(lab.difficulty)}] ${status}`);
        });
    }
    
    showTerminalStatus() {
        const user = this.db.currentUser;
        
        this.addTerminalLine('Статус системы CyberSib:', 'info');
        this.addTerminalLine(`  • Пользователь: ${user ? user.username : 'Гость'}`);
        this.addTerminalLine(`  • Лабораторных работ: ${this.db.labs.length}`);
        this.addTerminalLine(`  • Пользователей в системе: ${this.db.users.length}`);
        this.addTerminalLine(`  • Выполнено работ: ${this.db.progress.filter(p => p.status === 'completed').length}`);
        this.addTerminalLine(`  • Всего очков: ${this.db.users.reduce((sum, u) => sum + u.points, 0)}`);
        this.addTerminalLine('');
        this.addTerminalLine('Статус сервера: 🟢 ОНЛАЙН', 'success');
        this.addTerminalLine('Лицензия: Коммерческая');
        this.addTerminalLine('Время работы: 24/7');
    }
    
    showTerminalUser(args) {
        if (args[0] === 'login') {
            this.addTerminalLine('Для входа в систему нажмите на иконку пользователя или введите "demo" для демо-доступа.', 'info');
            return;
        }
        
        const user = this.db.currentUser;
        
        if (user) {
            this.addTerminalLine('Информация о пользователе:', 'info');
            this.addTerminalLine(`  • Имя: ${user.username}`);
            this.addTerminalLine(`  • Группа: ${user.group}`);
            this.addTerminalLine(`  • Роль: ${user.role === 'student' ? 'Студент' : 'Администратор'}`);
            this.addTerminalLine(`  • Очки: ${user.points}`);
            this.addTerminalLine(`  • Завершено работ: ${user.completedLabs}`);
            this.addTerminalLine(`  • Рейтинг: ${user.rank}`);
        } else {
            this.addTerminalLine('Вы не авторизованы. Введите "demo" для демо-доступа или "user login" для информации о входе.', 'warning');
        }
    }
    
    showTerminalConnect() {
        this.addTerminalLine('Информация о подключении:', 'info');
        this.addTerminalLine('  SSH: ssh ваш_логин@platform.cybersib.ru -p 2222');
        this.addTerminalLine('  Веб-интерфейс: https://platform.cybersib.ru');
        this.addTerminalLine('');
        this.addTerminalLine('Демо-доступ:');
        this.addTerminalLine('  Логин: demo');
        this.addTerminalLine('  Пароль: demo2024');
        this.addTerminalLine('');
        this.addTerminalLine('Техническая поддержка: support@cybersib.ru');
    }
    
    showTerminalAbout() {
        this.addTerminalLine('О проекте CyberSib:', 'info');
        this.addTerminalLine('');
        this.addTerminalLine('  🎓 Образовательная платформа для студентов');
        this.addTerminalLine('  👥 Создана студентами IT-специальностей');
        this.addTerminalLine('  🏫 Партнер: Сибирский политехнический техникум');
        this.addTerminalLine('  🚀 Цель: практическое обучение кибербезопасности');
        this.addTerminalLine('');
        this.addTerminalLine('  🔧 Технологии: Python/Flask, JavaScript, HTML/CSS');
        this.addTerminalLine('  🎯 Для кого: студенты, начинающие специалисты');
        this.addTerminalLine('  📚 Что дает: реальные навыки, лабораторные работы');
        this.addTerminalLine('');
        this.addTerminalLine('  🌐 Сайт: https://cybersib-spt.ru');
        this.addTerminalLine('  📧 Контакты: cyberrange@spt.edu');
        this.addTerminalLine('  💬 Telegram: @spt42');
        this.addTerminalLine('');
        this.addTerminalLine('  "От теории к практике, от студентов - для студентов!"', 'success');
    }
    
    showTerminalDemo() {
        // Автоматический вход с демо-учетными данными
        const result = this.login('demo', 'demo2024');
        
        if (result.success) {
            this.addTerminalLine('Демо-доступ активирован! Добро пожаловать, demo.', 'success');
            this.addTerminalLine('Теперь вы можете использовать все функции платформы.', 'info');
        } else {
            this.addTerminalLine('Не удалось активировать демо-доступ.', 'error');
        }
    }
    
    // ===== UI =====
    initUI() {
        // Обновляем UI пользователя
        this.updateUserUI();
        
        // Обновляем статистику на главной
        this.updateStats();
        
        // Инициализируем анимацию частиц
        this.initParticles();
    }
    
    updateStats() {
        // Обновляем счетчики на главной
        const totalLabs = document.getElementById('totalLabs');
        const totalMachines = document.getElementById('totalMachines');
        const activeUsers = document.getElementById('activeUsers');
        
        if (totalLabs) totalLabs.textContent = this.db.labs.length;
        if (totalMachines) totalMachines.textContent = '8';
        if (activeUsers) activeUsers.textContent = this.db.users.length;
    }
    
    initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        // Создаем частицы
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Случайные параметры
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const delay = Math.random() * 20;
            const duration = Math.random() * 10 + 15;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}%`;
            particle.style.background = i % 3 === 0 ? 
                `rgba(${this.getCSSVariable('--primary-rgb')}, 0.5)` :
                i % 3 === 1 ?
                `rgba(${this.getCSSVariable('--secondary-rgb')}, 0.5)` :
                `rgba(${this.getCSSVariable('--accent-rgb')}, 0.5)`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            container.appendChild(particle);
        }
    }
    
    getCSSVariable(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
    
    // ===== СИСТЕМА УВЕДОМЛЕНИЙ =====
    showNotification(message, type = 'info', duration = 5000) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'check-circle' :
                    type === 'error' ? 'exclamation-circle' :
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Добавляем стили, если их еще нет
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--dark-lighter);
                    border-left: 4px solid;
                    border-color: var(--primary);
                    padding: 15px 20px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    z-index: 9999;
                    transform: translateX(120%);
                    transition: transform var(--transition-normal);
                    max-width: 400px;
                    box-shadow: var(--shadow-xl);
                    border: 1px solid var(--gray);
                }
                
                .notification-success {
                    border-color: var(--secondary);
                }
                
                .notification-error {
                    border-color: var(--accent);
                }
                
                .notification-warning {
                    border-color: #ffbd2e;
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                }
                
                .notification-content i {
                    font-size: 1.2rem;
                }
                
                .notification-success .notification-content i { color: var(--secondary); }
                .notification-error .notification-content i { color: var(--accent); }
                .notification-warning .notification-content i { color: #ffbd2e; }
                .notification-info .notification-content i { color: var(--primary); }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm);
                    transition: all var(--transition-fast);
                }
                
                .notification-close:hover {
                    background: rgba(var(--accent-rgb), 0.1);
                    color: var(--accent);
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Показываем уведомление
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Кнопка закрытия
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Автоматическое закрытие
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
        
        return notification;
    }
    
    // ===== МОДАЛЬНЫЕ ОКНА =====
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
    
    // ===== НАВИГАЦИЯ =====
    switchPage(pageId) {
        // Скрываем все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Показываем выбранную страницу
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Обновляем активную ссылку в навигации
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Прокручиваем к началу страницы
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Загружаем контент для страницы
        this.loadPageContent(pageId);
    }
    
    loadPageContent(pageId) {
        switch(pageId) {
            case 'labs':
                this.loadLabs();
                break;
            case 'ctf':
                this.loadCTFLeaderboard();
                break;
            case 'docs':
                this.loadDocumentation();
                break;
            case 'contacts':
                // Контакты уже загружены
                break;
        }
    }
    
    // ===== ЗАГРУЗКА КОНТЕНТА =====
    loadContent() {
        // Загружаем лаборатории
        this.loadLabs();
        
        // Загружаем таблицу лидеров CTF
        this.loadCTFLeaderboard();
        
        // Загружаем документацию
        this.loadDocumentation();
    }
    
    // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
    initEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.switchPage(page);
                
                // Закрываем мобильное меню если открыто
                const navMenu = document.getElementById('navMenu');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            });
        });
        
        // Логотип также ведет на главную
        const logo = document.querySelector('.logo[data-page]');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPage('home');
            });
        }
        
        // Мобильное меню
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                const navMenu = document.getElementById('navMenu');
                if (navMenu) {
                    navMenu.classList.toggle('active');
                }
            });
        }
        
        // Пользовательское меню
        const userInfo = document.getElementById('userInfo');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userInfo && userDropdown) {
            userInfo.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            // Закрытие при клике вне меню
            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });
        }
        
        // Модальные окна
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
        
        // Форма входа
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;
                
                const result = this.login(username, password);
                
                if (result.success) {
                    this.closeModal('loginModal');
                    loginForm.reset();
                } else {
                    this.showNotification(result.error, 'error');
                }
            });
        }
        
        // Форма регистрации
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = document.getElementById('regUsername').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const group = document.getElementById('regGroup').value;
                
                if (!group) {
                    this.showNotification('Выберите группу', 'warning');
                    return;
                }
                
                const result = this.register(username, email, password, group);
                
                if (result.success) {
                    this.showNotification('Регистрация успешна! Теперь вы можете войти.', 'success');
                    
                    // Переключаемся на вкладку входа
                    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
                    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                    
                    document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
                    document.getElementById('loginForm').classList.add('active');
                    
                    registerForm.reset();
                } else {
                    this.showNotification(result.error, 'error');
                }
            });
        }
        
        // Быстрый демо-доступ
        const quickDemoBtn = document.getElementById('quickDemoBtn');
        if (quickDemoBtn) {
            quickDemoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Автоматический вход с демо-учетными данными
                const result = this.login('demo', 'demo2024');
                
                if (result.success) {
                    this.showNotification('Демо-доступ активирован! Добро пожаловать.', 'success');
                } else {
                    this.showNotification('Не удалось войти с демо-доступом', 'error');
                }
            });
        }
        
        // Кнопка "Начать обучение"
        const startLearningBtn = document.getElementById('startLearningBtn');
        if (startLearningBtn) {
            startLearningBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPage('labs');
            });
        }
        
        // Кнопка "Документация"
        const openDocsBtn = document.getElementById('openDocsBtn');
        if (openDocsBtn) {
            openDocsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPage('docs');
            });
        }
        
        // Вкладки в формах
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                // Переключаем вкладки
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tabName + 'Form').classList.add('active');
            });
        });
        
        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Кнопка профиля
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!this.db.currentUser) {
                    this.showNotification('Сначала войдите в систему', 'warning');
                    this.openModal('loginModal');
                    return;
                }
                
                this.openModal('profileModal');
            });
        }
        
        // Кнопка настроек
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!this.db.currentUser) {
                    this.showNotification('Сначала войдите в систему', 'warning');
                    this.openModal('loginModal');
                    return;
                }
                
                this.showNotification('Настройки временно недоступны', 'info');
            });
        }
        
        // Кнопка "Забыли пароль?"
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Функция восстановления пароля в разработке', 'info');
            });
        }
        
        // Кнопка просмотра правил
        const viewRulesBtn = document.getElementById('viewRulesBtn');
        if (viewRulesBtn) {
            viewRulesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDocument('rules');
                this.switchPage('docs');
                this.closeModal('loginModal');
            });
        }
        
        // Форма обратной связи
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const name = document.getElementById('feedbackName').value;
                const email = document.getElementById('feedbackEmail').value;
                const type = document.getElementById('feedbackType').value;
                const message = document.getElementById('feedbackMessage').value;
                
                // Здесь должна быть логика отправки на сервер
                // Для демо просто показываем уведомление
                
                this.showNotification('Сообщение отправлено! Мы ответим вам в течение 24 часов.', 'success');
                feedbackForm.reset();
            });
        }
        
        // Кнопки CTF категорий
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Раздел в разработке. Скоро будет доступно!', 'info');
            });
        });
        
        // Кнопки быстрых ссылок в документации
        const downloadRulesBtn = document.getElementById('downloadRulesBtn');
        if (downloadRulesBtn) {
            downloadRulesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Скачивание правил временно недоступно', 'info');
            });
        }
        
        const contactSupportBtn = document.getElementById('contactSupportBtn');
        if (contactSupportBtn) {
            contactSupportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPage('contacts');
            });
        }
        
        // Кнопки в футере
        document.querySelectorAll('.footer-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = btn.dataset.page;
                const doc = btn.dataset.doc;
                
                if (page) {
                    this.switchPage(page);
                } else if (doc) {
                    this.showDocument(doc);
                    this.switchPage('docs');
                } else if (btn.id === 'toolsBtn') {
                    this.showNotification('Раздел инструментов в разработке', 'info');
                }
            });
        });
        
        // Вкладки профиля
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                // Убираем активный класс у всех вкладок
                document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.profile-pane').forEach(p => p.classList.remove('active'));
                
                // Добавляем активный класс текущей вкладке
                tab.classList.add('active');
                document.getElementById(tabName + 'Pane').classList.add('active');
            });
        });
        
        // Закрытие всех выпадающих меню при клике вне их
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-section')) {
                const dropdown = document.getElementById('userDropdown');
                if (dropdown) dropdown.classList.remove('show');
            }
            
            if (!e.target.closest('.mobile-menu-btn') && !e.target.closest('.nav-menu')) {
                const navMenu = document.getElementById('navMenu');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
        
        // Обработка Escape для закрытия модальных окон
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
                
                const dropdown = document.getElementById('userDropdown');
                if (dropdown) dropdown.classList.remove('show');
                
                const navMenu = document.getElementById('navMenu');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
        
        // Кнопки входа и регистрации в выпадающем меню
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('loginModal');
            });
        }
        
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('loginModal');
                // Переключаем на вкладку регистрации
                setTimeout(() => {
                    const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
                    if (registerTab) {
                        registerTab.click();
                    }
                }, 100);
            });
        }
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Создаем глобальный объект приложения
    window.cyberSibApp = new CyberSibApp();
    
    // Инициализация завершена
    console.log('✅ CyberSib Professional готов к работе!');
});