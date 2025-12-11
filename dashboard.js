// ===== ЛИЧНЫЙ КАБИНЕТ =====

// Глобальные переменные
let dashboardData = {
    user: null,
    stats: null,
    progress: null,
    labs: [],
    achievements: [],
    certificates: [],
    activity: []
};

// Инициализация личного кабинета
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.dashboard-page')) {
        initDashboard();
    }
});

function initDashboard() {
    console.log('Инициализация личного кабинета...');
    
    // Проверяем авторизацию
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Инициализация компонентов
    initDashboardNavigation();
    initDashboardSections();
    initDashboardForms();
    loadDashboardData();
    initBackgroundAnimation();
    
    // Обновление данных каждые 30 секунд
    setInterval(updateDashboardStats, 30000);
    
    console.log('Личный кабинет инициализирован');
}

function initDashboardNavigation() {
    // Навигация по разделам
    document.querySelectorAll('.sidebar-link').forEach(link => {
        if (!link.classList.contains('logout')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href')?.replace('#', '');
                if (target) {
                    showDashboardSection(target);
                }
            });
        }
    });
    
    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.querySelector('.dashboard-sidebar').classList.toggle('active');
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
        
        document.addEventListener('click', function() {
            userDropdown.classList.remove('show');
        });
    }
    
    // Вкладки настроек
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            document.querySelectorAll('.settings-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            document.querySelectorAll('.settings-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabId}Pane`).classList.add('active');
        });
    });
    
    // Фильтры
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            applyFilter(filter);
        });
    });
}

function initDashboardSections() {
    // Показываем первый раздел по умолчанию
    showDashboardSection('overview');
}

function initDashboardForms() {
    // Форма профиля
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileSettings();
        });
    }
    
    // Форма безопасности
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
    
    // Загрузка аватара
    const avatarUpload = document.getElementById('avatarUpload');
    const settingsAvatar = document.getElementById('settingsAvatar');
    
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            uploadAvatar(e.target.files[0]);
        });
    }
    
    if (settingsAvatar) {
        settingsAvatar.addEventListener('change', function(e) {
            previewAvatar(e.target.files[0]);
        });
    }
    
    // Индикатор силы пароля
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
}

function showDashboardSection(sectionId) {
    // Скрыть все разделы
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Показать выбранный раздел
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Обновить активную ссылку в боковой панели
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
        
        // Закрыть выпадающее меню на мобильных
        document.querySelector('.user-dropdown')?.classList.remove('show');
        
        // Загрузить данные раздела если нужно
        loadSectionData(sectionId);
    }
}

function loadDashboardData() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Обновляем интерфейс пользователя
    updateUserUI(user);
    
    // Загружаем данные с сервера (или мок-данные)
    loadUserStats();
    loadUserProgress();
    loadUserLabs();
    loadUserAchievements();
    loadUserActivity();
    loadUserCertificates();
    
    // Обновляем приветствие
    updateGreeting();
}

function loadUserStats() {
    // Здесь будет запрос к API
    // Пока используем мок-данные
    const mockStats = {
        points: 1250,
        completed_labs: 8,
        ctf_solved: 15,
        rank: 'Профессионал',
        lab_points: 850,
        ctf_points: 400,
        weekly_change: {
            points: 150,
            labs: 2,
            ctf: 3
        },
        rank_progress: 65,
        next_rank: 'Эксперт',
        points_needed: 250
    };
    
    dashboardData.stats = mockStats;
    updateStatsUI(mockStats);
}

function loadUserProgress() {
    // Мок-данные прогресса
    const mockProgress = {
        overall: 45,
        by_category: [
            { name: 'Linux', progress: 80, color: 'var(--secondary)' },
            { name: 'Web', progress: 60, color: 'var(--primary)' },
            { name: 'Network', progress: 40, color: 'var(--accent)' },
            { name: 'Crypto', progress: 30, color: 'var(--primary-light)' }
        ],
        courses: [
            { name: 'Основы Linux', status: 'completed', progress: 100, grade: 95 },
            { name: 'Сетевая разведка', status: 'in_progress', progress: 70, grade: 85 },
            { name: 'Web Security', status: 'in_progress', progress: 40, grade: 75 },
            { name: 'Криптография', status: 'not_started', progress: 0, grade: 0 }
        ]
    };
    
    dashboardData.progress = mockProgress;
    updateProgressUI(mockProgress);
}

function loadUserLabs() {
    // Мок-данные лабораторий
    const mockLabs = [
        {
            id: 1,
            title: 'Основы Linux',
            description: 'Базовые команды и права доступа',
            status: 'completed',
            score: 100,
            time_spent: '2 часа',
            completed_at: '15.12.2024'
        },
        {
            id: 2,
            title: 'Сетевое сканирование',
            description: 'Использование Nmap',
            status: 'in_progress',
            score: 85,
            time_spent: '1.5 часа',
            started_at: '16.12.2024'
        },
        {
            id: 3,
            title: 'SQL Injection',
            description: 'Эксплуатация SQL уязвимостей',
            status: 'in_progress',
            score: 70,
            time_spent: '3 часа',
            started_at: '17.12.2024'
        }
    ];
    
    dashboardData.labs = mockLabs;
    updateLabsUI(mockLabs);
}

function loadUserAchievements() {
    // Мок-данные достижений
    const mockAchievements = [
        {
            id: 1,
            name: 'Первая кровь',
            description: 'Завершите первую лабораторию',
            icon: 'fas fa-trophy',
            earned: true,
            earned_at: '15.12.2024',
            rare: false
        },
        {
            id: 2,
            name: 'CTF новичок',
            description: 'Решите 5 CTF задач',
            icon: 'fas fa-flag',
            earned: true,
            earned_at: '16.12.2024',
            rare: false
        },
        {
            id: 3,
            name: 'Лабораторный маньяк',
            description: 'Завершите 10 лабораторий',
            icon: 'fas fa-flask',
            earned: false,
            progress: 8,
            required: 10,
            rare: false
        },
        {
            id: 4,
            name: 'Легенда платформы',
            description: 'Займите 1 место в рейтинге',
            icon: 'fas fa-crown',
            earned: false,
            progress: 5,
            required: 1,
            rare: true
        }
    ];
    
    dashboardData.achievements = mockAchievements;
    updateAchievementsUI(mockAchievements);
}

function loadUserActivity() {
    // Мок-данные активности
    const mockActivity = [
        {
            id: 1,
            type: 'lab_complete',
            title: 'Завершена лаборатория',
            description: 'Основы Linux - оценка 100/100',
            time: '2 часа назад',
            icon: 'fas fa-check-circle'
        },
        {
            id: 2,
            type: 'ctf_solve',
            title: 'Решена CTF задача',
            description: 'Basic Cryptography - 50 очков',
            time: '5 часов назад',
            icon: 'fas fa-flag'
        },
        {
            id: 3,
            type: 'login',
            title: 'Вход в систему',
            description: 'С нового устройства',
            time: 'Вчера, 14:30',
            icon: 'fas fa-sign-in-alt'
        }
    ];
    
    dashboardData.activity = mockActivity;
    updateActivityUI(mockActivity);
}

function loadUserCertificates() {
    // Пока заглушка
    dashboardData.certificates = [];
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'overview':
            // Данные уже загружены
            break;
        case 'progress':
            // Можно обновить данные прогресса
            break;
        case 'labs':
            // Можно обновить данные лабораторий
            break;
        case 'ctf':
            loadCTFStats();
            break;
    }
}

function loadCTFStats() {
    // Мок-данные CTF
    const mockCTF = {
        total_points: 400,
        solved_count: 15,
        categories_count: 4,
        position: 42,
        total_players: 150,
        recent_solves: [
            {
                id: 1,
                title: 'Basic Cryptography',
                category: 'crypto',
                points: 50,
                solved_at: '2 часа назад'
            },
            {
                id: 2,
                title: 'SQL Injection 101',
                category: 'web',
                points: 75,
                solved_at: '5 часов назад'
            }
        ]
    };
    
    updateCTFUI(mockCTF);
}

function updateUserUI(user) {
    // Обновляем имя пользователя
    document.querySelectorAll('#dashboardUserName, #sidebarUserName').forEach(el => {
        el.textContent = user.username;
    });
    
    // Обновляем роль
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    if (sidebarUserRole) {
        sidebarUserRole.textContent = user.role || 'Студент';
    }
    
    // Обновляем аватар
    updateAvatarUI(user);
}

function updateAvatarUI(user) {
    // Здесь можно добавить реальную загрузку аватара
    const avatarElements = document.querySelectorAll('.profile-avatar-large, .avatar-preview');
    avatarElements.forEach(avatar => {
        if (user.avatar) {
            avatar.innerHTML = `<img src="${user.avatar}" alt="${user.username}">`;
        } else {
            avatar.innerHTML = `<i class="fas fa-user-secret"></i>`;
        }
    });
}

function updateStatsUI(stats) {
    // Карточки статистики
    document.getElementById('statPoints').textContent = stats.points;
    document.getElementById('statLabs').textContent = stats.completed_labs;
    document.getElementById('statCTF').textContent = stats.ctf_solved;
    document.getElementById('statRank').textContent = stats.rank;
    
    // Тренды
    document.getElementById('pointsTrend').innerHTML = `
        <i class="fas fa-arrow-up"></i>
        <span>+${stats.weekly_change.points} за неделю</span>
    `;
    
    document.getElementById('labsTrend').innerHTML = `
        <i class="fas fa-arrow-up"></i>
        <span>+${stats.weekly_change.labs} за неделю</span>
    `;
    
    document.getElementById('ctfTrend').innerHTML = `
        <i class="fas fa-arrow-up"></i>
        <span>+${stats.weekly_change.ctf} за неделю</span>
    `;
    
    // Прогресс ранга
    const rankProgress = document.getElementById('rankProgress');
    if (rankProgress) {
        rankProgress.style.width = `${stats.rank_progress}%`;
    }
    
    document.getElementById('rankNext').textContent = 
        `Следующий ранг: ${stats.next_rank} (+${stats.points_needed} очков)`;
    
    // Боковая панель
    document.getElementById('sidebarPoints').textContent = stats.points;
    document.getElementById('sidebarLabs').textContent = stats.completed_labs;
    document.getElementById('sidebarCTF').textContent = stats.ctf_solved;
    document.getElementById('sidebarUserRank').textContent = stats.rank;
}

function updateProgressUI(progress) {
    // Круговой прогресс
    const overallProgress = document.getElementById('overallProgress');
    if (overallProgress) {
        overallProgress.style.background = 
            `conic-gradient(var(--primary) ${progress.overall}%, var(--gray) 0%)`;
        overallProgress.querySelector('.progress-value').textContent = `${progress.overall}%`;
    }
    
    // Прогресс по категориям
    const categoryList = document.getElementById('categoryProgressList');
    if (categoryList && progress.by_category) {
        categoryList.innerHTML = progress.by_category.map(category => `
            <div class="category-progress-item">
                <span class="category-name">${category.name}</span>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${category.progress}%; background: ${category.color}"></div>
                </div>
                <span class="category-percent">${category.progress}%</span>
            </div>
        `).join('');
    }
    
    // Детальный прогресс
    const progressTable = document.getElementById('detailedProgressTable');
    if (progressTable && progress.courses) {
        progressTable.innerHTML = progress.courses.map(course => `
            <tr>
                <td>${course.name}</td>
                <td>
                    <span class="status-badge ${course.status}">
                        ${course.status === 'completed' ? 'Завершено' : 
                          course.status === 'in_progress' ? 'В процессе' : 'Не начато'}
                    </span>
                </td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                    <span style="font-size: 0.9rem; color: var(--text-muted)">${course.progress}%</span>
                </td>
                <td>
                    <span style="font-weight: 600; color: ${course.grade >= 90 ? 'var(--secondary)' : 
                                                         course.grade >= 70 ? 'var(--primary)' : 'var(--accent)'}">
                        ${course.grade}%
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="continueCourse('${course.name}')">
                        ${course.status === 'completed' ? 'Повторить' : 'Продолжить'}
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function updateLabsUI(labs) {
    const labsGrid = document.getElementById('userLabsGrid');
    if (!labsGrid) return;
    
    // Сводная статистика
    const totalTime = labs.reduce((sum, lab) => {
        const hours = parseFloat(lab.time_spent) || 0;
        return sum + hours;
    }, 0);
    
    const averageScore = labs.length > 0 
        ? Math.round(labs.reduce((sum, lab) => sum + (lab.score || 0), 0) / labs.length)
        : 0;
    
    const totalAttempts = labs.reduce((sum, lab) => sum + (lab.attempts || 1), 0);
    
    document.getElementById('totalLabTime').textContent = `${totalTime.toFixed(1)} часов`;
    document.getElementById('averageScore').textContent = `${averageScore}%`;
    document.getElementById('totalAttempts').textContent = totalAttempts;
    
    // Сетка лабораторий
    labsGrid.innerHTML = labs.map(lab => `
        <div class="user-lab-card">
            <div class="lab-card-header">
                <span class="lab-status ${lab.status}">
                    ${lab.status === 'completed' ? 'Завершено' : 'В процессе'}
                </span>
                <span class="lab-score">${lab.score || 0}/100</span>
            </div>
            <div class="lab-card-content">
                <h4>${lab.title}</h4>
                <p>${lab.description}</p>
                <div class="lab-meta">
                    <span><i class="fas fa-clock"></i> ${lab.time_spent}</span>
                    <span>
                        ${lab.status === 'completed' 
                            ? `<i class="fas fa-calendar-check"></i> ${lab.completed_at}`
                            : `<i class="fas fa-calendar-plus"></i> ${lab.started_at}`}
                    </span>
                </div>
                <div class="lab-actions">
                    ${lab.status === 'completed'
                        ? `<button class="btn btn-outline btn-sm" onclick="reviewLab(${lab.id})">
                             <i class="fas fa-redo"></i> Повторить
                           </button>`
                        : `<button class="btn btn-primary btn-sm" onclick="continueLab(${lab.id})">
                             <i class="fas fa-play"></i> Продолжить
                           </button>`}
                    <button class="btn btn-ghost btn-sm" onclick="showLabReport(${lab.id})">
                        <i class="fas fa-chart-bar"></i> Отчет
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateAchievementsUI(achievements) {
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    const earnedCount = achievements.filter(a => a.earned).length;
    const totalCount = achievements.length;
    
    document.getElementById('earnedAchievements').textContent = earnedCount;
    document.getElementById('totalAchievements').textContent = totalCount;
    document.getElementById('achievementsBadge').textContent = earnedCount;
    
    achievementsGrid.innerHTML = achievements.map(achievement => `
        <div class="achievement-card ${achievement.earned ? '' : 'locked'} ${achievement.rare ? 'rare' : ''}">
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
            ${achievement.earned
                ? `<div class="achievement-progress">
                     <i class="fas fa-check"></i> Получено: ${achievement.earned_at}
                   </div>`
                : achievement.progress
                ? `<div class="achievement-progress">
                     Прогресс: ${achievement.progress}/${achievement.required}
                   </div>`
                : ''}
        </div>
    `).join('');
}

function updateActivityUI(activity) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = activity.map(item => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${item.icon}"></i>
            </div>
            <div class="activity-content">
                <h4 class="activity-title">${item.title}</h4>
                <p class="activity-description">${item.description}</p>
                <span class="activity-time">${item.time}</span>
            </div>
        </div>
    `).join('');
}

function updateCTFUI(ctfData) {
    document.getElementById('ctfTotalPoints').textContent = ctfData.total_points;
    document.getElementById('ctfSolved').textContent = ctfData.solved_count;
    document.getElementById('ctfCategories').textContent = ctfData.categories_count;
    document.getElementById('ctfPosition').textContent = ctfData.position;
    document.getElementById('totalPlayers').textContent = ctfData.total_players;
    
    const recentSolves = document.getElementById('recentCTFSolves');
    if (recentSolves && ctfData.recent_solves) {
        recentSolves.innerHTML = ctfData.recent_solves.map(solve => `
            <div class="ctf-solve-item">
                <div class="ctf-solve-category">
                    ${solve.category.substring(0, 3).toUpperCase()}
                </div>
                <div class="ctf-solve-content">
                    <h4 class="ctf-solve-title">${solve.title}</h4>
                    <span class="ctf-solve-points">+${solve.points} очков</span>
                </div>
                <span class="ctf-solve-time">${solve.solved_at}</span>
            </div>
        `).join('');
    }
}

function updateGreeting() {
    const hours = new Date().getHours();
    let greeting;
    
    if (hours < 6) greeting = 'Доброй ночи';
    else if (hours < 12) greeting = 'Доброе утро';
    else if (hours < 18) greeting = 'Добрый день';
    else greeting = 'Добрый вечер';
    
    const user = getCurrentUser();
    document.getElementById('dashboardGreeting').textContent = 
        `${greeting}, ${user?.username || 'пользователь'}! Готовы к новым вызовам?`;
}

function applyFilter(filter) {
    // Применение фильтров к различным разделам
    const activeSection = document.querySelector('.dashboard-section.active').id;
    
    switch(activeSection) {
        case 'labsSection':
            filterLabs(filter);
            break;
        case 'achievementsSection':
            filterAchievements(filter);
            break;
    }
}

function filterLabs(filter) {
    const labs = dashboardData.labs;
    let filteredLabs = labs;
    
    if (filter === 'in_progress') {
        filteredLabs = labs.filter(lab => lab.status === 'in_progress');
    } else if (filter === 'completed') {
        filteredLabs = labs.filter(lab => lab.status === 'completed');
    }
    
    // Обновляем UI
    const labsGrid = document.getElementById('userLabsGrid');
    if (labsGrid) {
        // Здесь можно обновить только видимость карточек
        // Для простоты перерисовываем всю сетку
        updateLabsUI(filteredLabs);
    }
}

function filterAchievements(filter) {
    const achievements = dashboardData.achievements;
    let filteredAchievements = achievements;
    
    if (filter === 'earned') {
        filteredAchievements = achievements.filter(a => a.earned);
    } else if (filter === 'locked') {
        filteredAchievements = achievements.filter(a => !a.earned);
    } else if (filter === 'rare') {
        filteredAchievements = achievements.filter(a => a.rare);
    }
    
    updateAchievementsUI(filteredAchievements);
}

// Функции управления
function uploadAvatar(file) {
    if (!file) return;
    
    // Проверка типа файла
    if (!file.type.match('image.*')) {
        showNotification('Пожалуйста, выберите изображение', 'error');
        return;
    }
    
    // Проверка размера (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Размер файла не должен превышать 5MB', 'error');
        return;
    }
    
    // Здесь будет загрузка на сервер
    // Пока просто показываем уведомление
    showNotification('Аватар успешно загружен', 'success');
    
    // Обновляем превью
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarElements = document.querySelectorAll('.profile-avatar-large, .avatar-preview');
        avatarElements.forEach(avatar => {
            avatar.innerHTML = `<img src="${e.target.result}" alt="Аватар">`;
        });
    };
    reader.readAsDataURL(file);
}

function previewAvatar(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('avatarPreview').innerHTML = 
            `<img src="${e.target.result}" alt="Превью аватара">`;
    };
    reader.readAsDataURL(file);
}

function saveProfileSettings() {
    const username = document.getElementById('settingsUsername').value;
    const email = document.getElementById('settingsEmail').value;
    const group = document.getElementById('settingsGroup').value;
    
    // Валидация
    if (!username || !email) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        showNotification('Введите корректный email', 'error');
        return;
    }
    
    // Здесь будет сохранение на сервере
    showNotification('Настройки профиля сохранены', 'success');
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Валидация
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Новый пароль должен быть не менее 8 символов', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    // Здесь будет запрос к API
    showNotification('Пароль успешно изменен', 'success');
    
    // Очищаем поля
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function saveSettings() {
    showNotification('Настройки сохранены', 'success');
}

function upgradeSubscription(plan) {
    showNotification(`Переход на план ${plan.toUpperCase()} в разработке`, 'info');
}

function exportProgress() {
    showNotification('Экспорт прогресса в разработке', 'info');
}

function continueCourse(courseName) {
    showNotification(`Продолжение курса "${courseName}"`, 'info');
}

function continueLab(labId) {
    const lab = dashboardData.labs.find(l => l.id === labId);
    if (lab) {
        showNotification(`Продолжение лаборатории "${lab.title}"`, 'info');
        // Здесь можно перейти к лаборатории
    }
}

function reviewLab(labId) {
    const lab = dashboardData.labs.find(l => l.id === labId);
    if (lab) {
        showNotification(`Повтор лаборатории "${lab.title}"`, 'info');
    }
}

function showLabReport(labId) {
    showNotification('Отчет по лаборатории в разработке', 'info');
}

function showCertificateModal() {
    openModal('certificateModal');
    
    // Загружаем сертификаты
    const content = document.getElementById('certificateModalContent');
    content.innerHTML = `
        <div class="certificates-modal-list">
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <div>
                    <h4>Сертификаты</h4>
                    <p>Здесь будут отображаться ваши сертификаты о прохождении курсов.</p>
                </div>
            </div>
        </div>
    `;
}

function downloadCertificate(certId) {
    showNotification('Скачивание сертификата в разработке', 'info');
}

function terminateOtherSessions() {
    showNotification('Другие сессии завершены', 'success');
}

function updateDashboardStats() {
    // Обновление статистики в реальном времени
    console.log('Обновление статистики...');
    // Здесь можно добавить запрос к API
}

function refreshData() {
    showNotification('Данные обновляются...', 'info');
    
    // Имитация загрузки
    setTimeout(() => {
        loadDashboardData();
        showNotification('Данные обновлены', 'success');
    }, 1000);
}

// Вспомогательные функции
function getCurrentUser() {
    try {
        const savedUser = localStorage.getItem('cybersib_user');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
        return null;
    }
}

function logoutUser() {
    localStorage.removeItem('cybersib_user');
    window.location.href = 'index.html';
}

function showNotification(message, type) {
    // Используем функцию из script.js
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}

function openModal(modalId) {
    // Используем функцию из script.js
    if (typeof window.openModal === 'function') {
        window.openModal(modalId);
    }
}

// Экспортируем функции для использования в HTML
window.showDashboardSection = showDashboardSection;
window.uploadAvatar = uploadAvatar;
window.saveSettings = saveSettings;
window.upgradeSubscription = upgradeSubscription;
window.exportProgress = exportProgress;
window.continueCourse = continueCourse;
window.continueLab = continueLab;
window.reviewLab = reviewLab;
window.showLabReport = showLabReport;
window.showCertificateModal = showCertificateModal;
window.downloadCertificate = downloadCertificate;
window.terminateOtherSessions = terminateOtherSessions;
window.refreshData = refreshData;
window.logoutUser = logoutUser;