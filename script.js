// CyberSib - Киберполигон СПТ
// Главный JavaScript файл

class CyberSibApp {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
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
        
        // Устанавливаем CSRF токен
        this.setCSRFToken();
        
        // Показ уведомления о загрузке
        this.showNotification('CyberSib Professional загружен! Добро пожаловать', 'success');
    }
    
    // ===== БЕЗОПАСНОСТЬ =====
    generateCSRFToken() {
        return 'csrf_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    setCSRFToken() {
        const csrfInputs = document.querySelectorAll('input[id*="csrf"], #csrfToken');
        csrfInputs.forEach(input => {
            input.value = this.csrfToken;
        });
    }
    
    validateCSRFToken(token) {
        return token === this.csrfToken;
    }
    
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return input.replace(/[&<>"'`=\/]/g, match => map[match]);
    }
    
    hashPassword(password) {
        // Простая хэш-функция для демо (в продакшене используйте bcrypt)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'demo_hash_' + Math.abs(hash).toString(16);
    }
    
    // ===== БАЗА ДАННЫХ =====
    initDatabase() {
        this.db = {
            users: this.loadFromStorage('cybersib_users') || [],
            labs: this.loadFromStorage('cybersib_labs') || this.getDefaultLabs(),
            progress: this.loadFromStorage('cybersib_progress') || [],
            currentUser: this.loadFromStorage('cybersib_currentUser') || null,
            settings: this.loadFromStorage('cybersib_settings') || {},
            ctfScores: this.loadFromStorage('cybersib_ctfScores') || [],
            achievements: this.loadFromStorage('cybersib_achievements') || this.getDefaultAchievements(),
            certificates: this.loadFromStorage('cybersib_certificates') || [],
            securityLogs: this.loadFromStorage('cybersib_securityLogs') || []
        };
        
        this.saveDatabase();
        
        // Создаем демо-данные если база пуста
        if (this.db.users.length === 0) {
            this.createDemoData();
        }
        
        // Логируем инициализацию
        this.logSecurityEvent(null, 'system', 'init', 'Инициализация приложения');
    }
    
    getDefaultLabs() {
        return [
            {
                id: 1,
                title: 'Основы Linux и командной строки',
                description: 'Изучение базовых команд Linux, работа с файловой системой и утилитами',
                difficulty: 'beginner',
                points: 10,
                time: '2 часа',
                category: 'linux',
                requirements: 'Базовые знания ОС',
                status: 'available',
                content: `# Лабораторная работа №1: Основы Linux...`
            },
            {
                id: 2,
                title: 'Сетевой анализ с Wireshark',
                description: 'Захват и анализ сетевого трафика, выявление аномалий',
                difficulty: 'beginner',
                points: 15,
                time: '3 часа',
                category: 'network',
                requirements: 'Основы сетевых технологий',
                status: 'available'
            },
            {
                id: 3,
                title: 'Веб-уязвимости: SQL Injection',
                description: 'Поиск и эксплуатация SQL-инъекций в веб-приложениях',
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
                description: 'Базовые задачи по криптографии и стеганографии',
                difficulty: 'intermediate',
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
            },
            {
                id: 9,
                title: 'Социальная инженерия',
                description: 'Методы социальной инженерии и фишинга',
                difficulty: 'beginner',
                points: 15,
                time: '2 часа',
                category: 'social',
                requirements: 'Базовые знания',
                status: 'available'
            },
            {
                id: 10,
                title: 'Криптография: RSA',
                description: 'Изучение и взлом RSA шифрования',
                difficulty: 'advanced',
                points: 35,
                time: '5 часов',
                category: 'crypto',
                requirements: 'Знание математики',
                status: 'available'
            },
            {
                id: 11,
                title: 'Мобильная безопасность',
                description: 'Анализ мобильных приложений на уязвимости',
                difficulty: 'intermediate',
                points: 25,
                time: '4 часа',
                category: 'mobile',
                requirements: 'Знание Android/iOS',
                status: 'available'
            },
            {
                id: 12,
                title: 'Анализ вредоносного ПО',
                description: 'Статический и динамический анализ malware',
                difficulty: 'advanced',
                points: 40,
                time: '6 часов',
                category: 'malware',
                requirements: 'Знание ассемблера',
                status: 'available'
            },
            {
                id: 13,
                title: 'Безопасность IoT устройств',
                description: 'Тестирование безопасности IoT устройств',
                difficulty: 'intermediate',
                points: 30,
                time: '5 часов',
                category: 'iot',
                requirements: 'Знание сетей',
                status: 'available'
            },
            {
                id: 14,
                title: 'Облачная безопасность',
                description: 'Аудит безопасности облачных инфраструктур',
                difficulty: 'advanced',
                points: 35,
                time: '6 часов',
                category: 'cloud',
                requirements: 'Знание AWS/Azure',
                status: 'available'
            },
            {
                id: 15,
                title: 'CTF Final Challenge',
                description: 'Комплексная задача с элементами всех категорий',
                difficulty: 'ctf',
                points: 50,
                time: 'Неограниченно',
                category: 'ctf',
                requirements: 'Опыт во всех категориях',
                status: 'available'
            }
        ];
    }
    
    getDefaultAchievements() {
        return [
            {
                id: 1,
                name: 'Первые шаги',
                description: 'Зарегистрировался на платформе',
                icon: 'fa-baby',
                points: 0,
                unlocked: false
            },
            {
                id: 2,
                name: 'Первый успех',
                description: 'Выполнил первую лабораторную работу',
                icon: 'fa-trophy',
                points: 10,
                unlocked: false
            },
            {
                id: 3,
                name: 'Эксперт Linux',
                description: 'Выполнил все Linux лаборатории',
                icon: 'fa-linux',
                points: 50,
                unlocked: false
            },
            {
                id: 4,
                name: 'Мастер ИБ',
                description: 'Набрал 100 очков',
                icon: 'fa-user-secret',
                points: 100,
                unlocked: false
            },
            {
                id: 5,
                name: 'CTF Ниндзя',
                description: 'Решил 10 CTF задач',
                icon: 'fa-flag',
                points: 500,
                unlocked: false
            },
            {
                id: 6,
                name: 'Неутомимый исследователь',
                description: 'Выполнил 5 лабораторных работ',
                icon: 'fa-search',
                points: 150,
                unlocked: false
            },
            {
                id: 7,
                name: 'Криптограф',
                description: 'Выполнил все криптографические лаборатории',
                icon: 'fa-key',
                points: 200,
                unlocked: false
            },
            {
                id: 8,
                name: 'Веб-хакер',
                description: 'Выполнил все веб-лаборатории',
                icon: 'fa-globe',
                points: 180,
                unlocked: false
            },
            {
                id: 9,
                name: 'Профессионал',
                description: 'Набрал 500 очков',
                icon: 'fa-star',
                points: 500,
                unlocked: false
            },
            {
                id: 10,
                name: 'Легенда CyberSib',
                description: 'Выполнил все лабораторные работы',
                icon: 'fa-crown',
                points: 1000,
                unlocked: false
            }
        ];
    }
    
    createDemoData() {
        // Демо-пользователи
        const demoUsers = [
            {
                id: 1,
                username: 'demo',
                email: 'demo@cybersib.ru',
                passwordHash: this.hashPassword('demo2024'),
                group: 'Демо-группа',
                role: 'student',
                points: 245,
                completedLabs: 7,
                ctfRating: 1250,
                rank: 'Эксперт',
                createdAt: '2024-01-01',
                lastActive: new Date().toISOString()
            },
            {
                id: 2,
                username: 'admin',
                email: 'admin@cybersib.ru',
                passwordHash: this.hashPassword('admin2024'),
                group: 'Администраторы',
                role: 'admin',
                points: 0,
                completedLabs: 0,
                ctfRating: 1500,
                rank: 'Администратор',
                createdAt: '2024-01-01',
                lastActive: new Date().toISOString()
            },
            {
                id: 3,
                username: 'hacker_pro',
                email: 'hacker@example.com',
                passwordHash: this.hashPassword('hacker123'),
                group: 'ИБ-21',
                role: 'student',
                points: 380,
                completedLabs: 10,
                ctfRating: 1350,
                rank: 'Мастер',
                createdAt: '2024-02-01',
                lastActive: new Date().toISOString()
            }
        ];
        
        // Демо-прогресс
        const demoProgress = [
            { userId: 1, labId: 1, status: 'completed', score: 9, startedAt: '2024-01-15', completedAt: '2024-01-16' },
            { userId: 1, labId: 2, status: 'completed', score: 14, startedAt: '2024-01-20', completedAt: '2024-01-21' },
            { userId: 1, labId: 3, status: 'in_progress', score: 12, startedAt: '2024-02-01', completedAt: null },
            { userId: 1, labId: 4, status: 'completed', score: 28, startedAt: '2024-02-10', completedAt: '2024-02-12' },
            { userId: 1, labId: 5, status: 'completed', score: 22, startedAt: '2024-02-15', completedAt: '2024-02-16' }
        ];
        
        // Демо-CTF результаты
        const demoCtfScores = [
            { userId: 1, username: 'demo', score: 350, solved: 8, rank: 1, rating: 1250 },
            { userId: 3, username: 'hacker_pro', score: 420, solved: 10, rank: 2, rating: 1350 },
            { userId: 4, username: 'security_expert', score: 380, solved: 9, rank: 3, rating: 1300 },
            { userId: 5, username: 'ctf_master', score: 310, solved: 7, rank: 4, rating: 1200 },
            { userId: 6, username: 'new_user', score: 150, solved: 4, rank: 5, rating: 1100 },
            { userId: 7, username: 'web_hacker', score: 280, solved: 6, rank: 6, rating: 1150 },
            { userId: 8, username: 'crypto_guru', score: 320, solved: 7, rank: 7, rating: 1180 },
            { userId: 9, username: 'forensics_pro', score: 290, solved: 6, rank: 8, rating: 1160 },
            { userId: 10, username: 'reverse_engineer', score: 340, solved: 8, rank: 9, rating: 1220 },
            { userId: 11, username: 'python_ninja', score: 270, solved: 5, rank: 10, rating: 1140 }
        ];
        
        // Демо-достижения
        const demoAchievements = [...this.db.achievements];
        demoAchievements[0].unlocked = true; // Первые шаги
        demoAchievements[1].unlocked = true; // Первый успех
        demoAchievements[3].unlocked = true; // Мастер ИБ
        demoAchievements[5].unlocked = true; // Неутомимый исследователь
        
        this.db.users = demoUsers;
        this.db.progress = demoProgress;
        this.db.ctfScores = demoCtfScores;
        this.db.achievements = demoAchievements;
        
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
        this.saveToStorage('cybersib_achievements', this.db.achievements);
        this.saveToStorage('cybersib_certificates', this.db.certificates);
        this.saveToStorage('cybersib_securityLogs', this.db.securityLogs);
    }
    
    logSecurityEvent(userId, action, details, severity = 'info') {
        const logEntry = {
            id: Date.now(),
            userId: userId,
            action: action,
            details: details,
            severity: severity,
            timestamp: new Date().toISOString(),
            ip: '127.0.0.1', // В реальном приложении получать IP пользователя
            userAgent: navigator.userAgent
        };
        
        this.db.securityLogs.push(logEntry);
        
        // Ограничиваем размер логов (последние 1000 записей)
        if (this.db.securityLogs.length > 1000) {
            this.db.securityLogs = this.db.securityLogs.slice(-1000);
        }
        
        this.saveToStorage('cybersib_securityLogs', this.db.securityLogs);
        
        console.log(`[SECURITY] ${severity.toUpperCase()}: ${action} - ${details}`);
    }
    
    // ===== ПОЛЬЗОВАТЕЛИ =====
    register(username, email, password, group) {
        // Санитизация ввода
        username = this.sanitizeInput(username.trim());
        email = this.sanitizeInput(email.trim().toLowerCase());
        
        // Валидация
        if (!username || username.length < 3) {
            return { success: false, error: 'Логин должен содержать не менее 3 символов' };
        }
        
        if (!this.validateEmail(email)) {
            return { success: false, error: 'Неверный формат email' };
        }
        
        if (password.length < 8) {
            return { success: false, error: 'Пароль должен содержать не менее 8 символов' };
        }
        
        // Проверка существующего пользователя
        if (this.db.users.find(u => u.username === username)) {
            return { success: false, error: 'Пользователь с таким логином уже существует' };
        }
        
        if (this.db.users.find(u => u.email === email)) {
            return { success: false, error: 'Пользователь с таким email уже существует' };
        }
        
        const hashedPassword = this.hashPassword(password);
        
        const newUser = {
            id: Date.now(),
            username,
            email,
            passwordHash: hashedPassword,
            group,
            role: 'student',
            points: 0,
            completedLabs: 0,
            ctfRating: 1000,
            rank: 'Новичок',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            isActive: true,
            emailVerified: false
        };
        
        this.db.users.push(newUser);
        this.saveDatabase();
        
        // Разблокируем достижение "Первые шаги"
        this.unlockAchievement(newUser.id, 1);
        
        // Логируем регистрацию
        this.logSecurityEvent(newUser.id, 'register', `Новый пользователь: ${username}`, 'info');
        
        return { success: true, user: newUser };
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    login(username, password) {
        const user = this.db.users.find(u => 
            (u.username === username || u.email === username) && 
            u.passwordHash === this.hashPassword(password)
        );
        
        if (user) {
            if (!user.isActive) {
                return { success: false, error: 'Аккаунт заблокирован' };
            }
            
            user.lastActive = new Date().toISOString();
            this.db.currentUser = user;
            this.saveDatabase();
            
            // Обновляем UI
            this.updateUserUI();
            
            // Логируем вход
            this.logSecurityEvent(user.id, 'login', 'Успешный вход в систему', 'info');
            
            return { success: true, user };
        }
        
        // Логируем неудачную попытку входа
        this.logSecurityEvent(null, 'login_failed', `Неудачная попытка входа для: ${username}`, 'warning');
        
        return { success: false, error: 'Неверный логин или пароль' };
    }
    
    logout() {
        if (this.db.currentUser) {
            this.logSecurityEvent(this.db.currentUser.id, 'logout', 'Выход из системы', 'info');
        }
        
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
            const dashboardBtn = document.getElementById('dashboardBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            const settingsBtn = document.getElementById('settingsBtn');
            
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (profileBtn) profileBtn.style.display = 'block';
            if (dashboardBtn) dashboardBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (settingsBtn) settingsBtn.style.display = 'block';
            
            // Показываем имя в профиле
            const profileUserName = document.getElementById('profileUserName');
            const profileUserRole = document.getElementById('profileUserRole');
            const profileUserGroup = document.getElementById('profileUserGroup');
            const profilePoints = document.getElementById('profilePoints');
            const profileLabs = document.getElementById('profileLabs');
            const profileRank = document.getElementById('profileRank');
            
            if (profileUserName) profileUserName.textContent = user.username;
            if (profileUserRole) profileUserRole.textContent = this.getRoleLabel(user.role);
            if (profileUserGroup) profileUserGroup.textContent = user.group;
            if (profilePoints) profilePoints.textContent = user.points;
            if (profileLabs) profileLabs.textContent = user.completedLabs;
            if (profileRank) profileRank.textContent = user.rank;
            
            this.showNotification(`Добро пожаловать, ${user.username}!`, 'success');
        } else {
            userNameElement.textContent = 'Гость';
            
            // Обновляем меню пользователя
            const loginBtn = document.getElementById('loginBtn');
            const registerBtn = document.getElementById('registerBtn');
            const profileBtn = document.getElementById('profileBtn');
            const dashboardBtn = document.getElementById('dashboardBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            const settingsBtn = document.getElementById('settingsBtn');
            
            if (loginBtn) loginBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'block';
            if (profileBtn) profileBtn.style.display = 'none';
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (settingsBtn) settingsBtn.style.display = 'none';
        }
    }
    
    getRoleLabel(role) {
        const roles = {
            'student': 'Студент',
            'teacher': 'Преподаватель',
            'admin': 'Администратор',
            'sponsor': 'Спонсор'
        };
        return roles[role] || role;
    }
    
    unlockAchievement(userId, achievementId) {
        const achievement = this.db.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveDatabase();
            
            this.showNotification(`Достижение получено: ${achievement.name}!`, 'success');
            
            // Логируем получение достижения
            this.logSecurityEvent(userId, 'achievement_unlocked', achievement.name, 'info');
            
            return true;
        }
        return false;
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
        card.className = 'lab-card animate-slide-up';
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
            'ctf': 'CTF',
            'expert': 'Эксперт'
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
                            <p>Попыток: ${progress.attempts || 1}</p>
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
        
        // Логируем просмотр лаборатории
        this.logSecurityEvent(this.db.currentUser.id, 'lab_view', `Просмотр лаборатории: ${lab.title}`, 'info');
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
            progress.attempts = (progress.attempts || 1) + 1;
        }
        
        this.saveDatabase();
        
        // Закрываем модальное окно
        this.closeModal('labModal');
        
        // Показываем уведомление
        this.showNotification(`Лаборатория "${lab.title}" запущена!`, 'success');
        
        // Логируем запуск лаборатории
        this.logSecurityEvent(this.db.currentUser.id, 'lab_start', `Запуск лаборатории: ${lab.title}`, 'info');
        
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
            
            // Обновляем рейтинг
            if (user.points >= 1000) user.rank = 'Легенда';
            else if (user.points >= 500) user.rank = 'Профессионал';
            else if (user.points >= 250) user.rank = 'Эксперт';
            else if (user.points >= 100) user.rank = 'Мастер';
            else if (user.points >= 50) user.rank = 'Опытный';
            else user.rank = 'Новичок';
            
            this.saveDatabase();
            
            // Проверяем достижения
            this.checkAchievements(userId);
            
            // Показываем уведомление
            this.showNotification(`Лаборатория завершена! Вы получили ${score} очков`, 'success');
            
            // Логируем завершение лаборатории
            this.logSecurityEvent(userId, 'lab_complete', `Завершена лаборатория: ${lab.title} (${score} очков)`, 'info');
            
            // Обновляем UI
            this.updateUserUI();
            this.loadLabs();
            
            return { success: true };
        }
        
        return { success: false };
    }
    
    checkAchievements(userId) {
        const user = this.db.users.find(u => u.id === userId);
        if (!user) return;
        
        // Проверяем достижения на основе очков
        if (user.points >= 10) this.unlockAchievement(userId, 2); // Первый успех
        if (user.points >= 100) this.unlockAchievement(userId, 4); // Мастер ИБ
        if (user.points >= 150) this.unlockAchievement(userId, 6); // Неутомимый исследователь
        if (user.points >= 500) this.unlockAchievement(userId, 9); // Профессионал
        if (user.points >= 1000) this.unlockAchievement(userId, 10); // Легенда CyberSib
    }
    
    // ===== CTF =====
    loadCTFContent() {
        this.loadCTFLeaderboard();
        this.initCTFTabs();
    }
    
    initCTFTabs() {
        const tabs = document.querySelectorAll('.ctf-tab');
        const panes = document.querySelectorAll('.ctf-pane');
        
        if (tabs.length === 0) return;
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                // Убираем активный класс у всех вкладок
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                // Добавляем активный класс текущей вкладке
                tab.classList.add('active');
                document.getElementById(tabName + 'Pane').classList.add('active');
                
                // Загружаем контент для активной вкладки
                if (tabName === 'leaderboard') {
                    this.loadCTFLeaderboard();
                }
            });
        });
    }
    
    loadCTFLeaderboard() {
        const container = document.getElementById('leaderboardBody');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Сортируем по рейтингу
        const sortedScores = [...this.db.ctfScores].sort((a, b) => b.rating - a.rating);
        
        sortedScores.forEach((player, index) => {
            const row = document.createElement('tr');
            row.className = 'animate-slide-up';
            row.style.animationDelay = `${index * 0.05}s`;
            
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
            case 'licenses':
                content = this.getLicensesDocument();
                break;
            case 'security':
                content = this.getSecurityDocument();
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
        
        // Логируем просмотр документации
        if (this.db.currentUser) {
            this.logSecurityEvent(this.db.currentUser.id, 'docs_view', `Просмотр документа: ${docId}`, 'info');
        }
    }
    
    getLicensesDocument() {
        return `
            <h1>Лицензии и использование</h1>
            
            <div class="alert alert-info">
                <i class="fas fa-balance-scale"></i>
                <strong>Лицензионная информация платформы CyberSib</strong>
            </div>
            
            <h2>📜 Основная лицензия</h2>
            <p><strong>Лицензия: MIT License</strong></p>
            <pre><code>MIT License

Copyright (c) 2025 Сибирский политехнический техникум, Кемерово

Данная лицензия разрешает лицам, получившим копию данного программного 
обеспечения и сопутствующей документации (в дальнейшем «Программное 
обеспечение»), безвозмездно использовать Программное обеспечение без 
ограничений, включая неограниченное право на использование, копирование, 
изменение, слияние, публикацию, распространение, сублицензирование и/или 
продажу копий Программного обеспечения...</code></pre>
            
            <h2>🔐 Лицензии компонентов</h2>
            
            <table class="access-table">
                <thead>
                    <tr>
                        <th>Компонент</th>
                        <th>Версия</th>
                        <th>Лицензия</th>
                        <th>Ссылка</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Flask</td>
                        <td>2.3.3</td>
                        <td>BSD-3-Clause</td>
                        <td><a href="https://flask.palletsprojects.com/" target="_blank">Ссылка</a></td>
                    </tr>
                    <tr>
                        <td>SQLite</td>
                        <td>3.40+</td>
                        <td>Public Domain</td>
                        <td><a href="https://sqlite.org/" target="_blank">Ссылка</a></td>
                    </tr>
                    <tr>
                        <td>Font Awesome</td>
                        <td>6.4.0</td>
                        <td>Font Awesome Free License</td>
                        <td><a href="https://fontawesome.com/license/free" target="_blank">Ссылка</a></td>
                    </tr>
                    <tr>
                        <td>Google Fonts</td>
                        <td>-</td>
                        <td>SIL Open Font License</td>
                        <td><a href="https://fonts.google.com/" target="_blank">Ссылка</a></td>
                    </tr>
                    <tr>
                        <td>Cryptography</td>
                        <td>41.0+</td>
                        <td>Apache-2.0 & BSD-3-Clause</td>
                        <td><a href="https://cryptography.io/" target="_blank">Ссылка</a></td>
                    </tr>
                </tbody>
            </table>
            
            <h2>🎓 Образовательная лицензия</h2>
            <p><strong>Для учебных заведений:</strong></p>
            <ul>
                <li>Бесплатное использование в образовательных целях</li>
                <li>Возможность модификации под нужды учебного процесса</li>
                <li>Техническая поддержка для партнерских учреждений</li>
                <li>Доступ к исходному коду для изучения</li>
            </ul>
            
            <h2>🏢 Коммерческая лицензия</h2>
            <p><strong>Для корпоративных клиентов:</strong></p>
            <ul>
                <li>Индивидуальная настройка платформы</li>
                <li>Приоритетная техническая поддержка 24/7</li>
                <li>Обучение персонала</li>
                <li>Интеграция с корпоративными системами</li>
                <li>Гарантия обновлений и безопасности</li>
            </ul>
            
            <h2>📄 Использование контента</h2>
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Важно:</strong> Лабораторные работы и учебные материалы защищены авторским правом.
                Запрещено коммерческое использование без письменного разрешения.
            </div>
            
            <h2>🤝 Сотрудничество</h2>
            <p>Для получения коммерческой лицензии или партнерства:</p>
            <div class="contact-options">
                <a href="mailto:license@cybersib.ru" class="btn btn-primary">
                    <i class="fas fa-envelope"></i> license@cybersib.ru
                </a>
                <a href="https://t.me/spt42" target="_blank" class="btn btn-outline">
                    <i class="fab fa-telegram"></i> Telegram для обсуждения
                </a>
            </div>
            
            <div class="alert alert-success" style="margin-top: var(--space-xl);">
                <i class="fas fa-heart"></i>
                <strong>Открытость и развитие:</strong> Мы верим в открытое образование и готовы сотрудничать 
                с учебными заведениями для развития IT-образования в России.
            </div>
        `;
    }
    
    getSecurityDocument() {
        return `
            <h1>Безопасность данных</h1>
            
            <div class="alert alert-success">
                <i class="fas fa-shield-alt"></i>
                <strong>Безопасность - наш приоритет</strong>
            </div>
            
            <h2>🔒 Шифрование данных</h2>
            <p>Мы используем современные методы шифрования для защиты ваших данных:</p>
            
            <h3>Хэширование паролей</h3>
            <pre><code>Алгоритм: PBKDF2 с HMAC-SHA256
Итерации: 100,000
Соль: 16 байт (уникальная для каждого пользователя)
Формат: pbkdf2:sha256:100000$[соль]$[хэш]</code></pre>
            
            <h3>Шифрование конфиденциальных данных</h3>
            <pre><code>Алгоритм: Fernet (AES-128-CBC с HMAC-SHA256)
Библиотека: cryptography
Ключ: производный от мастер-ключа через PBKDF2
Дополнительная защита: уникальная соль для каждого шифрования</code></pre>
            
            <h2>🛡️ Защита от атак</h2>
            
            <h3>SQL Injection</h3>
            <ul>
                <li>Использование параметризованных запросов</li>
                <li>Валидация всех входных данных</li>
                <li>Экранирование специальных символов</li>
                <li>Регулярное тестирование на уязвимости</li>
            </ul>
            
            <h3>XSS (Cross-Site Scripting)</h3>
            <ul>
                <li>Экранирование HTML-сущностей</li>
                <li>Content Security Policy (CSP)</li>
                <li>HTTP-only куки для сессий</li>
                <li>Валидация всех пользовательских данных</li>
            </ul>
            
            <h3>CSRF (Cross-Site Request Forgery)</h3>
            <ul>
                <li>CSRF-токены для всех форм</li>
                <li>Проверка Origin/Referer заголовков</li>
                <li>SameSite куки атрибуты</li>
            </ul>
            
            <h2>📊 Логирование безопасности</h2>
            <p>Все действия пользователей записываются в логи безопасности:</p>
            <ul>
                <li>Входы и выходы из системы</li>
                <li>Изменение паролей и настроек</li>
                <li>Запуск и завершение лабораторных работ</li>
                <li>Подозрительная активность</li>
                <li>Ошибки и исключения</li>
            </ul>
            
            <h2>🔐 Хранение данных</h2>
            <table class="access-table">
                <thead>
                    <tr>
                        <th>Тип данных</th>
                        <th>Хранение</th>
                        <th>Шифрование</th>
                        <th>Срок хранения</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Пароли</td>
                        <td>Хэшированные</td>
                        <td>PBKDF2-SHA256</td>
                        <td>Бессрочно</td>
                    </tr>
                    <tr>
                        <td>Персональные данные</td>
                        <td>База данных</td>
                        <td>Частичное</td>
                        <td>До удаления аккаунта</td>
                    </tr>
                    <tr>
                        <td>Логи безопасности</td>
                        <td>Отдельная БД</td>
                        <td>Не шифруются</td>
                        <td>1 год</td>
                    </tr>
                    <tr>
                        <td>Файлы пользователей</td>
                        <td>Файловая система</td>
                        <td>AES-256</td>
                        <td>До удаления</td>
                    </tr>
                </tbody>
            </table>
            
            <h2>🔍 Аудит безопасности</h2>
            <p>Мы регулярно проводим:</p>
            <ul>
                <li>Статический анализ кода (SAST)</li>
                <li>Динамическое тестирование (DAST)</li>
                <li>Пентестинг независимыми специалистами</li>
                <li>Аудит зависимостей</li>
                <li>Проверки на уязвимости OWASP Top 10</li>
            </ul>
            
            <h2>🚨 Инциденты безопасности</h2>
            <p>В случае обнаружения уязвимости:</p>
            <ol>
                <li>Сообщите на security@cybersib.ru</li>
                <li>Мы ответим в течение 24 часов</li>
                <li>Исправим уязвимость в течение 72 часов</li>
                <li>Проинформируем пользователей при необходимости</li>
            </ol>
            
            <h2>📞 Контакты безопасности</h2>
            <div class="alert alert-info">
                <i class="fas fa-phone-alt"></i>
                <div>
                    <strong>Ответственный за безопасность:</strong> Роман Белоногов<br>
                    <strong>Email:</strong> security@cybersib.ru<br>
                    <strong>Telegram:</strong> @plushkihapki (для срочных вопросов)<br>
                    <strong>PGP ключ:</strong> доступен по запросу
                </div>
            </div>
            
            <div class="alert alert-warning" style="margin-top: var(--space-xl);">
                <i class="fas fa-exclamation-circle"></i>
                <strong>Последнее обновление:</strong> ${new Date().toLocaleDateString('ru-RU')}<br>
                Документ обновляется по мере внедрения новых мер безопасности.
            </div>
        `;
    }
    
    // Остальные методы getDocument() остаются без изменений, только добавляем логирование
    
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
            "> • Версия безопасности: 2.1.0",
            ">",
            "> Доступные команды:",
            "> • help - показать справку",
            "> • labs - список лабораторных",
            "> • status - статус системы",
            "> • clear - очистить терминал",
            "> • about - о проекте",
            "> • security - информация о безопасности",
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
        
        // ИСПРАВЛЕНИЕ ПРОКРУТКИ КОЛЕСИКОМ
        this.terminalOutput.addEventListener('wheel', (e) => {
            e.stopPropagation();
            
            const atTop = this.terminalOutput.scrollTop === 0;
            const atBottom = this.terminalOutput.scrollTop + 
                            this.terminalOutput.clientHeight >= 
                            this.terminalOutput.scrollHeight - 1;
            
            // Если достигли границ, разрешаем дальнейшую прокрутку страницы
            if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
                return true;
            }
            
            // В остальных случаях блокируем прокрутку страницы
            e.preventDefault();
        });
        
        // Фокус на поле ввода при клике в терминал
        this.terminalOutput.addEventListener('click', (e) => {
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
                
            case 'security':
                this.showTerminalSecurity();
                break;
                
            case 'demo':
                this.showTerminalDemo();
                break;
                
            default:
                this.addTerminalLine(`Команда '${command}' не найдена. Введите 'help' для справки.`, 'error');
        }
        
        // Логируем команду
        if (this.db.currentUser) {
            this.logSecurityEvent(this.db.currentUser.id, 'terminal_command', `Выполнена команда: ${command}`, 'info');
        }
    }
    
    showTerminalSecurity() {
        this.addTerminalLine('Информация о безопасности CyberSib:', 'info');
        this.addTerminalLine('');
        this.addTerminalLine('  🔒 Меры безопасности:');
        this.addTerminalLine('  • Хэширование паролей: PBKDF2-SHA256 (100,000 итераций)');
        this.addTerminalLine('  • Шифрование данных: Fernet (AES-128-CBC + HMAC-SHA256)');
        this.addTerminalLine('  • Защита от SQL Injection: параметризованные запросы');
        this.addTerminalLine('  • Защита от XSS: экранирование HTML-сущностей');
        this.addTerminalLine('  • CSRF защита: токены для всех форм');
        this.addTerminalLine('  • Логирование: все действия записываются');
        this.addTerminalLine('');
        this.addTerminalLine('  📊 Хранение данных:');
        this.addTerminalLine('  • Пароли: только хэши (никогда не в открытом виде)');
        this.addTerminalLine('  • Персональные данные: частичное шифрование');
        this.addTerminalLine('  • Логи: 1 год хранения, регулярный аудит');
        this.addTerminalLine('');
        this.addTerminalLine('  🚨 Сообщить об уязвимости: security@cybersib.ru', 'warning');
    }
    
    // Остальные методы терминала остаются без изменений
    
    // ===== UI И АНИМАЦИИ =====
    initUI() {
        // Обновляем UI пользователя
        this.updateUserUI();
        
        // Обновляем статистику на главной
        this.updateStats();
        
        // Инициализируем анимацию частиц
        this.initParticles();
        
        // Инициализируем анимации для карточек
        this.initAnimations();
    }
    
    initAnimations() {
        // Добавляем анимации для карточек при прокрутке
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Наблюдаем за карточками
        document.querySelectorAll('.lab-card, .feature-card, .category-card, .contact-card').forEach(card => {
            observer.observe(card);
        });
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
            
            // Обновляем CSRF токен
            this.setCSRFToken();
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
                this.loadCTFContent();
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
        
        // Загружаем CTF контент
        this.loadCTFContent();
        
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
                
                // Проверка CSRF токена
                const csrfToken = document.getElementById('csrfTokenModal')?.value;
                if (!csrfToken || !this.validateCSRFToken(csrfToken)) {
                    this.showNotification('Ошибка безопасности. Обновите страницу.', 'error');
                    return;
                }
                
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
            // Проверка силы пароля
            const passwordInput = document.getElementById('regPassword');
            const confirmInput = document.getElementById('regConfirmPassword');
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            
            if (passwordInput && strengthBar && strengthText) {
                passwordInput.addEventListener('input', () => {
                    const password = passwordInput.value;
                    const strength = this.checkPasswordStrength(password);
                    
                    strengthBar.style.width = `${strength.percentage}%`;
                    strengthBar.style.background = strength.color;
                    strengthText.textContent = `Надежность: ${strength.text}`;
                    strengthText.style.color = strength.color;
                });
                
                confirmInput.addEventListener('input', () => {
                    if (confirmInput.value !== passwordInput.value) {
                        confirmInput.style.borderColor = 'var(--accent)';
                    } else {
                        confirmInput.style.borderColor = '';
                    }
                });
            }
            
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Проверка CSRF токена
                const csrfToken = document.getElementById('csrfTokenModal')?.value;
                if (!csrfToken || !this.validateCSRFToken(csrfToken)) {
                    this.showNotification('Ошибка безопасности. Обновите страницу.', 'error');
                    return;
                }
                
                const username = document.getElementById('regUsername').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const confirmPassword = document.getElementById('regConfirmPassword').value;
                const group = document.getElementById('regGroup').value;
                
                if (!group) {
                    this.showNotification('Выберите группу', 'warning');
                    return;
                }
                
                if (password !== confirmPassword) {
                    this.showNotification('Пароли не совпадают', 'error');
                    return;
                }
                
                if (password.length < 8) {
                    this.showNotification('Пароль должен содержать не менее 8 символов', 'error');
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
                this.loadProfileContent();
            });
        }
        
        // Кнопка личного кабинета
        const dashboardBtn = document.getElementById('dashboardBtn');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!this.db.currentUser) {
                    this.showNotification('Сначала войдите в систему', 'warning');
                    this.openModal('loginModal');
                    return;
                }
                
                this.showNotification('Личный кабинет в разработке. Доступен в следующем обновлении.', 'info');
            });
        }
        
        // Кнопка настроек
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!this.db.currentUser) {
                    this.showNotification('Сначала войдите в системе', 'warning');
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
        
        // Кнопка просмотра политики конфиденциальности
        const viewPrivacyBtn = document.getElementById('viewPrivacyBtn');
        if (viewPrivacyBtn) {
            viewPrivacyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDocument('privacy');
                this.switchPage('docs');
            });
        }
        
        // Форма обратной связи
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Проверка CSRF токена
                const csrfToken = document.getElementById('csrfToken')?.value;
                if (!csrfToken || !this.validateCSRFToken(csrfToken)) {
                    this.showNotification('Ошибка безопасности. Обновите страницу.', 'error');
                    return;
                }
                
                const name = document.getElementById('feedbackName').value;
                const email = document.getElementById('feedbackEmail').value;
                const type = document.getElementById('feedbackType').value;
                const message = document.getElementById('feedbackMessage').value;
                
                // Санитизация ввода
                const sanitizedName = this.sanitizeInput(name);
                const sanitizedMessage = this.sanitizeInput(message);
                
                // Логируем обратную связь
                this.logSecurityEvent(
                    this.db.currentUser?.id || null,
                    'feedback',
                    `Обратная связь от ${sanitizedName} (${email}): ${type}`,
                    'info'
                );
                
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
        
        // Кнопка уведомления о турнире
        const notifyTournamentBtn = document.getElementById('notifyTournamentBtn');
        if (notifyTournamentBtn) {
            notifyTournamentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Вы будете уведомлены о старте турнира!', 'success');
            });
        }
        
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
        
        // Форма смены пароля
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showNotification('Смена пароля временно недоступна', 'info');
            });
        }
        
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
        
        // Загрузка профиля при открытии модального окна
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.addEventListener('click', (e) => {
                if (e.target === profileModal) {
                    this.loadProfileContent();
                }
            });
        }
    }
    
    loadProfileContent() {
        if (!this.db.currentUser) return;
        
        // Загружаем достижения
        this.loadAchievements();
        
        // Загружаем активность
        this.loadUserActivity();
    }
    
    loadAchievements() {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.db.achievements.forEach(achievement => {
            const achievementCard = document.createElement('div');
            achievementCard.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            achievementCard.innerHTML = `
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <h5>${achievement.name}</h5>
                <p>${achievement.description}</p>
                <small>${achievement.points} очков</small>
            `;
            
            container.appendChild(achievementCard);
        });
    }
    
    loadUserActivity() {
        const container = document.getElementById('activityLog');
        if (!container || !this.db.currentUser) return;
        
        // Получаем логи пользователя (последние 10)
        const userLogs = this.db.securityLogs
            .filter(log => log.userId === this.db.currentUser.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
        
        if (userLogs.length === 0) {
            container.innerHTML = '<p>История активности пуста</p>';
            return;
        }
        
        let html = '<div class="activity-list">';
        userLogs.forEach(log => {
            const time = new Date(log.timestamp).toLocaleString('ru-RU');
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-${this.getLogIcon(log.action)}"></i>
                    </div>
                    <div class="activity-info">
                        <strong>${this.getLogActionText(log.action)}</strong>
                        <small>${time}</small>
                        <p>${log.details}</p>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }
    
    getLogIcon(action) {
        const icons = {
            'login': 'sign-in-alt',
            'logout': 'sign-out-alt',
            'register': 'user-plus',
            'lab_start': 'play',
            'lab_complete': 'check-circle',
            'achievement_unlocked': 'trophy',
            'feedback': 'comment',
            'docs_view': 'book',
            'terminal_command': 'terminal'
        };
        return icons[action] || 'info-circle';
    }
    
    getLogActionText(action) {
        const texts = {
            'login': 'Вход в систему',
            'logout': 'Выход из системы',
            'register': 'Регистрация',
            'lab_start': 'Запуск лаборатории',
            'lab_complete': 'Завершение лаборатории',
            'achievement_unlocked': 'Получено достижение',
            'feedback': 'Отправлена обратная связь',
            'docs_view': 'Просмотр документации',
            'terminal_command': 'Команда в терминале'
        };
        return texts[action] || action;
    }
    
    checkPasswordStrength(password) {
        let score = 0;
        
        // Длина пароля
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Наличие цифр
        if (/\d/.test(password)) score += 1;
        
        // Наличие букв в разных регистрах
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
        
        // Наличие специальных символов
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        const levels = [
            { text: 'очень слабый', color: '#ff4444', percentage: 20 },
            { text: 'слабый', color: '#ff8844', percentage: 40 },
            { text: 'средний', color: '#ffcc44', percentage: 60 },
            { text: 'сильный', color: '#88cc44', percentage: 80 },
            { text: 'очень сильный', color: '#44cc44', percentage: 100 }
        ];
        
        return levels[Math.min(score, levels.length - 1)];
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Создаем глобальный объект приложения
    window.cyberSibApp = new CyberSibApp();
    
    // Инициализация завершена
    console.log('✅ CyberSib Professional готов к работе!');
    
    // Отслеживание Google Analytics событий
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
});