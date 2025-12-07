-- Создание базы данных
CREATE DATABASE cyberrange_spt;
USE cyberrange_spt;

-- Пользователи
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    student_group VARCHAR(20),
    role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
    points INT DEFAULT 0,
    completed_labs INT DEFAULT 0,
    rank INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Лабораторные работы
CREATE TABLE labs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty ENUM('beginner', 'intermediate', 'advanced', 'ctf') NOT NULL,
    points INT DEFAULT 10,
    estimated_time VARCHAR(50),
    requirements TEXT,
    vm_config JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Прогресс пользователей
CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    lab_id INT,
    status ENUM('started', 'in_progress', 'completed', 'failed') DEFAULT 'started',
    score INT DEFAULT 0,
    attempts INT DEFAULT 1,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    report TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lab (user_id, lab_id)
);

-- Достижения
CREATE TABLE achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    points_required INT DEFAULT 0,
    labs_required INT DEFAULT 0
);

-- Полученные достижения
CREATE TABLE user_achievements (
    user_id INT,
    achievement_id INT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, achievement_id)
);

-- Логи действий
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Виртуальные машины
CREATE TABLE virtual_machines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lab_id INT,
    name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(15),
    status ENUM('stopped', 'running', 'paused', 'error') DEFAULT 'stopped',
    ssh_port INT,
    vnc_port INT,
    credentials JSON,
    FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE
);

-- Вставка тестовых данных
INSERT INTO labs (name, description, difficulty, points, estimated_time, requirements) VALUES
('Основы Linux', 'Работа с терминалом и базовыми командами', 'beginner', 10, '2 часа', 'Базовые знания ОС'),
('Сетевой анализ', 'Wireshark и анализ сетевого трафика', 'beginner', 15, '3 часа', 'Основы сетей'),
('Веб-уязвимости', 'SQLi, XSS и CSRF атаки', 'intermediate', 20, '4 часа', 'Базовые знания веб-технологий'),
('Active Directory', 'Атаки на домен Windows', 'advanced', 30, '6 часов', 'Знание Windows Server'),
('CTF: Basic', 'Базовые задачи Capture The Flag', 'ctf', 25, 'Неограниченно', 'Все уровни');

INSERT INTO achievements (name, description, icon, points_required, labs_required) VALUES
('Первые шаги', 'Зарегистрировался на платформе', 'fa-baby', 0, 0),
('Первый успех', 'Выполнил первую лабораторную', 'fa-trophy', 0, 1),
('Эксперт Linux', 'Выполнил все Linux лаборатории', 'fa-linux', 0, 3),
('Сетевой аналитик', 'Выполнил все сетевые лаборатории', 'fa-network-wired', 0, 2),
('Мастер ИБ', 'Набрал 100 очков', 'fa-user-secret', 100, 0);