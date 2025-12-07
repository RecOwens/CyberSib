-- CyberSib Platform Database Schema
-- Версия: 2.1.0
-- Безопасность: PBKDF2-SHA256, Fernet encryption

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    student_group VARCHAR(20),
    role VARCHAR(20) DEFAULT 'student' CHECK(role IN ('student', 'teacher', 'admin', 'sponsor')),
    points INTEGER DEFAULT 0,
    completed_labs INTEGER DEFAULT 0,
    ctf_rating INTEGER DEFAULT 1000,
    rank VARCHAR(50) DEFAULT 'Новичок',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    email_verified BOOLEAN DEFAULT 0,
    verification_token VARCHAR(100),
    reset_token VARCHAR(100),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица лабораторных работ
CREATE TABLE IF NOT EXISTS labs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT,
    difficulty VARCHAR(20) NOT NULL CHECK(difficulty IN ('beginner', 'intermediate', 'advanced', 'expert', 'ctf')),
    category VARCHAR(50),
    points INTEGER DEFAULT 10,
    estimated_time VARCHAR(50),
    requirements TEXT,
    vm_config JSON,
    docker_image VARCHAR(100),
    is_public BOOLEAN DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    author_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Прогресс пользователей
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lab_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'started' CHECK(status IN ('started', 'in_progress', 'completed', 'failed')),
    score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 1,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    report TEXT,
    feedback TEXT,
    UNIQUE(user_id, lab_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE
);

-- Таблица CTF задач
CREATE TABLE IF NOT EXISTS ctf_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK(category IN ('web', 'crypto', 'forensics', 'pwn', 'reversing', 'misc', 'stego', 'osint')),
    difficulty VARCHAR(20) NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard', 'insane')),
    points INTEGER NOT NULL,
    flag_hash VARCHAR(255) NOT NULL, -- Хэш флага
    hint TEXT,
    files JSON,
    is_active BOOLEAN DEFAULT 1,
    author_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Таблица решенных CTF задач
CREATE TABLE IF NOT EXISTS ctf_solves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    flag_submitted VARCHAR(100),
    UNIQUE(user_id, challenge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES ctf_challenges(id) ON DELETE CASCADE
);

-- Таблица турниров CTF
CREATE TABLE IF NOT EXISTS ctf_tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    format VARCHAR(50) CHECK(format IN ('individual', 'team', 'hybrid')),
    max_participants INTEGER,
    is_public BOOLEAN DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица участников турниров
CREATE TABLE IF NOT EXISTS tournament_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER,
    team_id INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'registered' CHECK(status IN ('registered', 'active', 'disqualified', 'finished')),
    final_score INTEGER DEFAULT 0,
    final_rank INTEGER,
    UNIQUE(tournament_id, user_id, team_id),
    FOREIGN KEY (tournament_id) REFERENCES ctf_tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица команд
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    captain_id INTEGER NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (captain_id) REFERENCES users(id)
);

-- Таблица участников команд
CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK(role IN ('member', 'co_captain', 'captain')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица достижений
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    points_required INTEGER DEFAULT 0,
    labs_required INTEGER DEFAULT 0,
    is_secret BOOLEAN DEFAULT 0
);

-- Таблица полученных достижений
CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Таблица сертификатов
CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    issued_for VARCHAR(100),
    certificate_url TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_valid BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица обратной связи
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name VARCHAR(100),
    email VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK(status IN ('new', 'read', 'in_progress', 'resolved')),
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица логов безопасности
CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    severity VARCHAR(20) DEFAULT 'info' CHECK(severity IN ('info', 'warning', 'danger')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица сессий
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица настроек системы
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lab_id ON user_progress(lab_id);
CREATE INDEX IF NOT EXISTS idx_ctf_solves_user_id ON ctf_solves(user_id);
CREATE INDEX IF NOT EXISTS idx_ctf_solves_challenge_id ON ctf_solves(challenge_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_ctf_challenges_category ON ctf_challenges(category);
CREATE INDEX IF NOT EXISTS idx_ctf_challenges_difficulty ON ctf_challenges(difficulty);

-- Триггер для обновления updated_at
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users 
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Вставка тестовых данных
INSERT OR IGNORE INTO users (username, email, password_hash, student_group, role, points, completed_labs, ctf_rating, rank) VALUES
('demo', 'demo@cybersib.ru', 'pbkdf2:sha256:100000$demo_salt$demo_hash', 'Демо-группа', 'student', 245, 7, 1250, 'Эксперт'),
('admin', 'admin@cybersib.ru', 'pbkdf2:sha256:100000$admin_salt$admin_hash', 'Администраторы', 'admin', 0, 0, 1500, 'Администратор'),
('hacker_pro', 'hacker@example.com', 'pbkdf2:sha256:100000$hacker_salt$hacker_hash', 'ИБ-21', 'student', 380, 10, 1350, 'Мастер');

INSERT OR IGNORE INTO labs (title, description, difficulty, category, points, estimated_time, requirements) VALUES
('Основы Linux и командной строки', 'Изучение базовых команд Linux, работа с файловой системой и утилитами', 'beginner', 'linux', 10, '2 часа', 'Базовые знания ОС'),
('Сетевой анализ с Wireshark', 'Захват и анализ сетевого трафика, выявление аномалий', 'beginner', 'network', 15, '3 часа', 'Основы сетевых технологий'),
('Веб-уязвимости: SQL Injection', 'Поиск и эксплуатация SQL-инъекций в веб-приложениях', 'intermediate', 'web', 20, '4 часа', 'Базовые знания SQL и веб-технологий'),
('Атаки на Active Directory', 'Комплексные атаки на домен Windows', 'advanced', 'windows', 30, '6 часов', 'Знание Windows Server'),
('CTF: Basic Cryptography', 'Базовые задачи по криптографии и стеганографии', 'intermediate', 'crypto', 25, 'Неограниченно', 'Все уровни'),
('Forensics: Анализ диска', 'Восстановление данных и анализ файловой системы', 'intermediate', 'forensics', 20, '3 часа', 'Знание файловых систем'),
('Python для пентестинга', 'Создание скриптов для автоматизации тестирования', 'intermediate', 'programming', 25, '4 часа', 'Базовые знания Python'),
('Metasploit Framework', 'Работа с фреймворком для эксплуатации уязвимостей', 'advanced', 'exploitation', 30, '5 часов', 'Знание сетей и ОС'),
('Социальная инженерия', 'Методы социальной инженерии и фишинга', 'beginner', 'social', 15, '2 часа', 'Базовые знания'),
('Криптография: RSA', 'Изучение и взлом RSA шифрования', 'advanced', 'crypto', 35, '5 часов', 'Знание математики'),
('Мобильная безопасность', 'Анализ мобильных приложений на уязвимости', 'intermediate', 'mobile', 25, '4 часа', 'Знание Android/iOS'),
('Анализ вредоносного ПО', 'Статический и динамический анализ malware', 'advanced', 'malware', 40, '6 часа', 'Знание ассемблера'),
('Безопасность IoT устройств', 'Тестирование безопасности IoT устройств', 'intermediate', 'iot', 30, '5 часов', 'Знание сетей'),
('Облачная безопасность', 'Аудит безопасности облачных инфраструктур', 'advanced', 'cloud', 35, '6 часов', 'Знание AWS/Azure'),
('CTF Final Challenge', 'Комплексная задача с элементами всех категорий', 'ctf', 'ctf', 50, 'Неограниченно', 'Опыт во всех категориях');

INSERT OR IGNORE INTO ctf_challenges (title, description, category, difficulty, points, flag_hash) VALUES
('Simple Web', 'Найди флаг в простом веб-приложении', 'web', 'easy', 100, 'hash_of_ctf{web_101_flag}'),
('Caesar Cipher', 'Взломай шифр Цезаря', 'crypto', 'easy', 150, 'hash_of_ctf{caesar_is_easy}'),
('Memory Dump', 'Найди пароль в дампе памяти', 'forensics', 'medium', 200, 'hash_of_ctf{memory_forensics}'),
('Buffer Overflow', 'Эксплуатируй переполнение буфера', 'pwn', 'hard', 300, 'hash_of_ctf{buffer_overfl0w}'),
('Steganography 101', 'Найди скрытое сообщение в изображении', 'stego', 'easy', 100, 'hash_of_ctf{hidden_in_image}'),
('Reverse Engineering', 'Разберись, что делает эта программа', 'reversing', 'medium', 250, 'hash_of_ctf{reverse_me}'),
('OSINT Challenge', 'Собери информацию о цели', 'osint', 'medium', 200, 'hash_of_ctf{osint_master}'),
('Web Exploit', 'Эксплуатируй уязвимость в веб-приложении', 'web', 'hard', 350, 'hash_of_ctf{web_exploit}'),
('Crypto Advanced', 'Взломай современный шифр', 'crypto', 'hard', 400, 'hash_of_ctf{crypto_hard}'),
('Network Forensics', 'Проанализируй сетевой трафик', 'forensics', 'medium', 220, 'hash_of_ctf{network_forensics}');

INSERT OR IGNORE INTO achievements (name, description, icon, points_required, labs_required) VALUES
('Первые шаги', 'Зарегистрировался на платформе', 'fa-baby', 0, 0),
('Первый успех', 'Выполнил первую лабораторную работу', 'fa-trophy', 10, 1),
('Эксперт Linux', 'Выполнил все Linux лаборатории', 'fa-linux', 50, 3),
('Мастер ИБ', 'Набрал 100 очков', 'fa-user-secret', 100, 0),
('CTF Ниндзя', 'Решил 10 CTF задач', 'fa-flag', 500, 0),
('Неутомимый исследователь', 'Выполнил 5 лабораторных работ', 'fa-search', 150, 5),
('Криптограф', 'Выполнил все криптографические лаборатории', 'fa-key', 200, 2),
('Веб-хакер', 'Выполнил все веб-лаборатории', 'fa-globe', 180, 2),
('Профессионал', 'Набрал 500 очков', 'fa-star', 500, 0),
('Легенда CyberSib', 'Выполнил все лабораторные работы', 'fa-crown', 1000, 15);

INSERT OR IGNORE INTO system_settings (key, value, description) VALUES
('platform_name', 'CyberSib', 'Название платформы'),
('platform_version', '2.1.0', 'Версия платформы'),
('maintenance_mode', '0', 'Режим обслуживания'),
('registration_enabled', '1', 'Разрешена регистрация'),
('max_file_size', '10485760', 'Максимальный размер файла (10MB)'),
('session_timeout', '3600', 'Таймаут сессии (1 час)'),
('ctf_enabled', '1', 'CTF включен'),
('telegram_channel', '@spt42', 'Telegram канал'),
('support_email', 'cybersib@spt.edu', 'Email поддержки');

-- Вставка начальных логов
INSERT OR IGNORE INTO security_logs (user_id, action, details, severity) VALUES
(1, 'system', 'Инициализация базы данных', 'info'),
(1, 'login', 'Демо вход в систему', 'info'),
(2, 'system', 'Администратор создан', 'info');

-- Создание представлений для удобства
CREATE VIEW IF NOT EXISTS v_user_stats AS
SELECT 
    u.id,
    u.username,
    u.points,
    u.completed_labs,
    u.ctf_rating,
    u.rank,
    COUNT(DISTINCT up.lab_id) as labs_in_progress,
    COUNT(DISTINCT cs.challenge_id) as ctf_solved
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id AND up.status = 'in_progress'
LEFT JOIN ctf_solves cs ON u.id = cs.user_id
GROUP BY u.id;

CREATE VIEW IF NOT EXISTS v_lab_stats AS
SELECT 
    l.id,
    l.title,
    l.difficulty,
    l.category,
    l.points,
    COUNT(up.id) as total_attempts,
    AVG(up.score) as avg_score,
    COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_count
FROM labs l
LEFT JOIN user_progress up ON l.id = up.lab_id
GROUP BY l.id;

CREATE VIEW IF NOT EXISTS v_ctf_leaderboard AS
SELECT 
    u.id,
    u.username,
    SUM(c.points) as total_score,
    COUNT(cs.id) as solved_count,
    u.ctf_rating,
    RANK() OVER (ORDER BY SUM(c.points) DESC) as rank_position
FROM users u
JOIN ctf_solves cs ON u.id = cs.user_id
JOIN ctf_challenges c ON cs.challenge_id = c.id
GROUP BY u.id
ORDER BY total_score DESC;

-- Создание индексов для представлений
CREATE INDEX IF NOT EXISTS idx_v_user_stats_points ON v_user_stats(points DESC);
CREATE INDEX IF NOT EXISTS idx_v_lab_stats_difficulty ON v_lab_stats(difficulty);
CREATE INDEX IF NOT EXISTS idx_v_ctf_leaderboard_score ON v_ctf_leaderboard(total_score DESC);