-- ===== ОСНОВНЫЕ ТАБЛИЦЫ =====

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_group TEXT NOT NULL,
    subscription_level TEXT CHECK(subscription_level IN ('free', 'pro', 'premium')) DEFAULT 'free',
    role TEXT CHECK(role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Лаборатории
CREATE TABLE IF NOT EXISTS labs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced', 'ctf')) NOT NULL,
    category TEXT NOT NULL,
    points INTEGER NOT NULL,
    time_estimate_minutes INTEGER NOT NULL,
    flag_hash TEXT NOT NULL,
    vm_config_path TEXT,
    content TEXT, -- Markdown контент
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Прогресс пользователей
CREATE TABLE IF NOT EXISTS user_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lab_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    attempts INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (lab_id) REFERENCES labs (id) ON DELETE CASCADE,
    UNIQUE(user_id, lab_id)
);

-- CTF задачи
CREATE TABLE IF NOT EXISTS ctf_challenges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    points INTEGER NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard', 'insane')) NOT NULL,
    flag_hash TEXT NOT NULL,
    hints TEXT,
    files TEXT, -- JSON массив путей к файлам
    solves_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CTF решения
CREATE TABLE IF NOT EXISTS ctf_solves (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    challenge_id TEXT NOT NULL,
    solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    flag_submitted TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES ctf_challenges (id) ON DELETE CASCADE,
    UNIQUE(user_id, challenge_id)
);

-- Команды
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    captain_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (captain_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Участники команд
CREATE TABLE IF NOT EXISTS team_members (
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role TEXT CHECK(role IN ('member', 'moderator')) DEFAULT 'member',
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ===== ВСПОМОГАТЕЛЬНЫЕ ТАБЛИЦЫ =====

-- Достижения
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    points INTEGER DEFAULT 0,
    criteria TEXT NOT NULL -- JSON с критериями получения
);

-- Достижения пользователей
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE
);

-- Сессии (для управления подписками)
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Платежи (демо-версия)
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'RUB',
    subscription_type TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Обратная связь
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('bug', 'suggestion', 'question', 'other')) DEFAULT 'other',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('new', 'read', 'in_progress', 'resolved')) DEFAULT 'new',
    response TEXT,
    responded_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Логи активности
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ===== ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ =====

-- Индексы для users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_level);
CREATE INDEX IF NOT EXISTS idx_users_group ON users(user_group);

-- Индексы для labs
CREATE INDEX IF NOT EXISTS idx_labs_difficulty ON labs(difficulty);
CREATE INDEX IF NOT EXISTS idx_labs_category ON labs(category);
CREATE INDEX IF NOT EXISTS idx_labs_active ON labs(is_active);

-- Индексы для user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lab ON user_progress(lab_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(completed_at);

-- Индексы для ctf_challenges
CREATE INDEX IF NOT EXISTS idx_ctf_category ON ctf_challenges(category);
CREATE INDEX IF NOT EXISTS idx_ctf_difficulty ON ctf_challenges(difficulty);

-- Индексы для ctf_solves
CREATE INDEX IF NOT EXISTS idx_ctf_solves_user ON ctf_solves(user_id);
CREATE INDEX IF NOT EXISTS idx_ctf_solves_challenge ON ctf_solves(challenge_id);
CREATE INDEX IF NOT EXISTS idx_ctf_solves_time ON ctf_solves(solved_at);

-- Индексы для активности
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_time ON activity_logs(created_at);

-- ===== ТРИГГЕРЫ =====

-- Триггер для обновления updated_at в labs
CREATE TRIGGER IF NOT EXISTS update_labs_timestamp 
AFTER UPDATE ON labs
BEGIN
    UPDATE labs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Триггер для обновления solves_count в ctf_challenges
CREATE TRIGGER IF NOT EXISTS update_ctf_solves_count 
AFTER INSERT ON ctf_solves
BEGIN
    UPDATE ctf_challenges 
    SET solves_count = (
        SELECT COUNT(*) FROM ctf_solves 
        WHERE challenge_id = NEW.challenge_id
    )
    WHERE id = NEW.challenge_id;
END;

-- Триггер для логирования активности пользователей
CREATE TRIGGER IF NOT EXISTS log_user_activity
AFTER UPDATE OF last_login ON users
BEGIN
    INSERT INTO activity_logs (id, user_id, action, details)
    VALUES (
        hex(randomblob(16)),
        NEW.id,
        'login',
        json_object('method', 'standard', 'subscription', NEW.subscription_level)
    );
END;

-- ===== ТЕСТОВЫЕ ДАННЫЕ (опционально) =====
-- Эти данные будут добавлены через init_db() в app.py