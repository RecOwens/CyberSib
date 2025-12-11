"""
CyberSib Backend API
Веб-сервер на Flask для образовательной платформы по кибербезопасности
"""

import os
import sqlite3
import jwt
import hashlib
import json
import uuid
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, g, send_file
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# Конфигурация
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cybersib-spt-2025-secret-key-change-in-production')
app.config['DATABASE'] = 'cybersib.db'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Разрешаем CORS для всех доменов в разработке
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Создаем папки если их нет
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('static/avatars', exist_ok=True)

# ===== БАЗА ДАННЫХ =====
def get_db():
    """Получение соединения с базой данных"""
    if 'db' not in g:
        g.db = sqlite3.connect(app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
    return g.db

def init_db():
    """Инициализация базы данных"""
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()
        
        # Добавляем тестовые данные
        create_test_data(db)

def create_test_data(db):
    """Создание тестовых данных для демонстрации"""
    try:
        cursor = db.cursor()
        
        # Проверяем, есть ли уже тестовые пользователи
        cursor.execute("SELECT COUNT(*) FROM users WHERE username LIKE 'test%' OR username = 'demo'")
        count = cursor.fetchone()[0]
        
        if count == 0:
            # Тестовые пользователи
            test_users = [
                ('test_student', 'test@cybersib.spt', generate_password_hash('test123'), 'ИБ-23', 'free', 'student'),
                ('demo', 'demo@cybersib.spt', generate_password_hash('demo2024'), 'Демо', 'free', 'student'),
                ('ctf_champion', 'champ@cybersib.spt', generate_password_hash('champ123'), 'ИБ-22', 'premium', 'student'),
                ('admin', 'admin@cybersib.spt', generate_password_hash('admin2025'), 'Админ', 'premium', 'admin')
            ]
            
            cursor.executemany('''
                INSERT INTO users (id, username, email, password_hash, user_group, subscription_level, role, avatar_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', [
                (str(uuid.uuid4()), username, email, pwd_hash, group, sub, role, f'https://robohash.org/{username}.png?set=set4')
                for username, email, pwd_hash, group, sub, role in test_users
            ])
            
            # Тестовые лаборатории
            labs = [
                ('Основы Linux', 'Изучение базовых команд Linux, работа с файловой системой', 
                 'beginner', 'linux', 10, 60, 'CSIB{7a57a5a743894a0e}', True),
                ('Сетевая разведка с Nmap', 'Освоение инструментов сетевого сканирования', 
                 'beginner', 'networking', 15, 90, 'CSIB{4a2d2a947444a0e4}', True),
                ('SQL Injection', 'Поиск и эксплуатация SQL инъекций', 
                 'intermediate', 'web', 25, 120, 'CSIB{8c6976e5b5410415}', True),
                ('XSS Атаки', 'Изучение механизмов межсайтового скриптинга', 
                 'intermediate', 'web', 30, 150, 'CSIB{3d56a7d7e0b5c8e5}', True),
                ('Buffer Overflow', 'Эксплуатация переполнения буфера', 
                 'advanced', 'pwn', 50, 180, 'CSIB{9b3b9b3b9b3b9b3b}', False),
                ('Forensics: Анализ памяти', 'Исследование дампа памяти', 
                 'advanced', 'forensics', 45, 150, 'CSIB{5a5a5a5a5a5a5a5a}', False),
                ('CTF: Шифрование RSA', 'Задача на взлом RSA шифрования', 
                 'ctf', 'crypto', 75, 0, 'CSIB{6b6b6b6b6b6b6b6b}', True),
                ('CTF: Reverse Engineering', 'Анализ и взлом бинарного файла', 
                 'ctf', 'reverse', 100, 0, 'CSIB{2c2c2c2c2c2c2c2c}', False)
            ]
            
            cursor.executemany('''
                INSERT INTO labs (id, title, description, difficulty, category, points, time_estimate_minutes, flag_hash, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', [
                (str(uuid.uuid4()), title, desc, diff, cat, points, time, flag, active)
                for title, desc, diff, cat, points, time, flag, active in labs
            ])
            
            # CTF задачи
            ctf_challenges = [
                ('SQL Injection 101', 'Найдите флаг через SQL инъекцию', 'web', 50, 'easy', 'CSIB{7d5a7d5a7d5a7d5a}'),
                ('XSS Challenge', 'Выполните XSS и получите флаг', 'web', 75, 'medium', 'CSIB{8e6b8e6b8e6b8e6b}'),
                ('Basic Caesar Cipher', 'Расшифруйте текст шифром Цезаря', 'crypto', 30, 'easy', 'CSIB{9f7c9f7c9f7c9f7c}'),
                ('RSA Challenge', 'Взломайте RSA с малой длиной ключа', 'crypto', 150, 'hard', 'CSIB{1a8d1a8d1a8d1a8d}'),
                ('Memory Dump Analysis', 'Найдите флаг в дампе памяти', 'forensics', 120, 'medium', 'CSIB{2b9e2b9e2b9e2b9e}'),
                ('Buffer Overflow', 'Эксплуатируйте переполнение буфера', 'pwn', 200, 'hard', 'CSIB{3c0f3c0f3c0f3c0f}'),
                ('Reverse Me', 'Проанализируйте бинарный файл', 'reverse', 180, 'hard', 'CSIB{4d104d104d104d10}')
            ]
            
            cursor.executemany('''
                INSERT INTO ctf_challenges (id, title, description, category, points, difficulty, flag_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', [
                (str(uuid.uuid4()), title, desc, cat, points, diff, flag)
                for title, desc, cat, points, diff, flag in ctf_challenges
            ])
            
            # CTF решения для тестового пользователя
            cursor.execute("SELECT id FROM users WHERE username = 'ctf_champion'")
            user = cursor.fetchone()
            cursor.execute("SELECT id FROM ctf_challenges LIMIT 3")
            challenges = cursor.fetchall()
            
            if user and challenges:
                for challenge in challenges:
                    cursor.execute('''
                        INSERT INTO ctf_solves (id, user_id, challenge_id, solved_at, flag_submitted)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (str(uuid.uuid4()), user[0], challenge[0], datetime.now().isoformat(), 'CSIB{...}'))
            
            # Прогресс для тестового пользователя
            cursor.execute("SELECT id FROM labs WHERE is_active = 1 LIMIT 3")
            active_labs = cursor.fetchall()
            
            if user and active_labs:
                for lab in active_labs:
                    cursor.execute('''
                        INSERT INTO user_progress (user_id, lab_id, status, started_at, completed_at, attempts, score)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (user[0], lab[0], 'completed', 
                          datetime.now().isoformat(), 
                          datetime.now().isoformat(), 
                          1, 100))
            
            db.commit()
            print("Тестовые данные успешно добавлены")
            
    except Exception as e:
        print(f"Ошибка при создании тестовых данных: {e}")
        db.rollback()

@app.teardown_appcontext
def close_db(error):
    """Закрытие соединения с БД"""
    if hasattr(g, 'db'):
        g.db.close()

# ===== JWT АУТЕНТИФИКАЦИЯ =====
def generate_tokens(user_id):
    """Генерация access и refresh токенов"""
    access_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'type': 'access'
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    refresh_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES'],
        'type': 'refresh'
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return access_token, refresh_token

def token_required(f):
    """Декоратор для проверки JWT токена"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Получаем токен из заголовка Authorization
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Токен отсутствует'}), 401
        
        try:
            # Декодируем токен
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            
            # Проверяем тип токена
            if data.get('type') != 'access':
                return jsonify({'error': 'Неверный тип токена'}), 401
            
            # Получаем пользователя из БД
            db = get_db()
            cursor = db.cursor()
            cursor.execute('SELECT * FROM users WHERE id = ?', (data['user_id'],))
            current_user = cursor.fetchone()
            
            if not current_user:
                return jsonify({'error': 'Пользователь не найден'}), 401
                
            # Сохраняем пользователя в контексте запроса
            g.current_user = dict(current_user)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Срок действия токена истек'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Неверный токен'}), 401
        
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Декоратор для проверки прав администратора"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'current_user'):
            return jsonify({'error': 'Требуется аутентификация'}), 401
        
        if g.current_user.get('role') != 'admin':
            return jsonify({'error': 'Требуются права администратора'}), 403
        
        return f(*args, **kwargs)
    return decorated

# ===== ХЕЛПЕР-ФУНКЦИИ =====
def validate_flag(submitted_flag, correct_hash):
    """Валидация флага"""
    # Хешируем присланный флаг и сравниваем с хешем из БД
    submitted_hash = hashlib.md5(submitted_flag.encode()).hexdigest()
    return submitted_hash == correct_hash

def calculate_user_stats(user_id):
    """Расчет статистики пользователя"""
    db = get_db()
    cursor = db.cursor()
    
    # Количество завершенных лабораторий
    cursor.execute('''
        SELECT COUNT(*) FROM user_progress 
        WHERE user_id = ? AND status = 'completed'
    ''', (user_id,))
    completed_labs = cursor.fetchone()[0]
    
    # Сумма очков из лабораторий
    cursor.execute('''
        SELECT COALESCE(SUM(score), 0) FROM user_progress 
        WHERE user_id = ? AND status = 'completed'
    ''', (user_id,))
    lab_points = cursor.fetchone()[0]
    
    # Сумма очков из CTF
    cursor.execute('''
        SELECT COALESCE(SUM(c.points), 0) FROM ctf_solves s
        JOIN ctf_challenges c ON s.challenge_id = c.id
        WHERE s.user_id = ?
    ''', (user_id,))
    ctf_points = cursor.fetchone()[0]
    
    # Общие очки
    total_points = lab_points + ctf_points
    
    # Ранг пользователя
    rank = calculate_rank(total_points)
    
    return {
        'completed_labs': completed_labs,
        'lab_points': lab_points,
        'ctf_points': ctf_points,
        'total_points': total_points,
        'rank': rank
    }

def calculate_rank(points):
    """Определение ранга по очкам"""
    if points >= 2000:
        return 'Элита'
    elif points >= 1500:
        return 'Эксперт'
    elif points >= 1000:
        return 'Профессионал'
    elif points >= 500:
        return 'Продвинутый'
    elif points >= 100:
        return 'Средний'
    else:
        return 'Начинающий'

# ===== API ЭНДПОИНТЫ =====

# ---- АУТЕНТИФИКАЦИЯ ----
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Регистрация нового пользователя"""
    try:
        data = request.get_json()
        
        # Валидация данных
        required_fields = ['username', 'email', 'password', 'group']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Отсутствует поле: {field}'}), 400
        
        username = data['username']
        email = data['email']
        password = data['password']
        user_group = data['group']
        
        # Дополнительные проверки
        if len(password) < 8:
            return jsonify({'error': 'Пароль должен быть не менее 8 символов'}), 400
        
        if '@' not in email:
            return jsonify({'error': 'Неверный формат email'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Проверка существующего пользователя
        cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
        if cursor.fetchone():
            return jsonify({'error': 'Пользователь с таким именем или email уже существует'}), 409
        
        # Создание пользователя
        user_id = str(uuid.uuid4())
        password_hash = generate_password_hash(password)
        
        # Генерация аватара
        avatar_url = f'https://robohash.org/{username}.png?set=set4'
        
        cursor.execute('''
            INSERT INTO users (id, username, email, password_hash, user_group, subscription_level, role, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, username, email, password_hash, user_group, 'free', 'student', avatar_url))
        
        db.commit()
        
        # Генерация токенов
        access_token, refresh_token = generate_tokens(user_id)
        
        return jsonify({
            'message': 'Регистрация успешна',
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'group': user_group,
                'subscription': 'free',
                'role': 'student',
                'avatar': avatar_url
            },
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Вход пользователя"""
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Требуется имя пользователя и пароль'}), 400
        
        username = data['username']
        password = data['password']
        
        db = get_db()
        cursor = db.cursor()
        
        # Поиск пользователя по username или email
        cursor.execute('SELECT * FROM users WHERE username = ? OR email = ?', (username, username))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'Неверное имя пользователя или пароль'}), 401
        
        # Проверка пароля
        if not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Неверное имя пользователя или пароль'}), 401
        
        # Генерация токенов
        access_token, refresh_token = generate_tokens(user['id'])
        
        # Получение статистики
        stats = calculate_user_stats(user['id'])
        
        return jsonify({
            'message': 'Вход выполнен успешно',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'group': user['user_group'],
                'subscription': user['subscription_level'],
                'role': user['role'],
                'avatar': user['avatar_url'],
                'stats': stats
            },
            'access_token': access_token,
            'refresh_token': refresh_token
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/auth/refresh', methods=['POST'])
def refresh_token():
    """Обновление access токена"""
    try:
        data = request.get_json()
        
        if not data or 'refresh_token' not in data:
            return jsonify({'error': 'Требуется refresh токен'}), 400
        
        refresh_token = data['refresh_token']
        
        try:
            # Декодируем refresh токен
            payload = jwt.decode(refresh_token, app.config['SECRET_KEY'], algorithms=['HS256'])
            
            if payload.get('type') != 'refresh':
                return jsonify({'error': 'Неверный тип токена'}), 401
            
            user_id = payload['user_id']
            
            # Проверяем существование пользователя
            db = get_db()
            cursor = db.cursor()
            cursor.execute('SELECT id FROM users WHERE id = ?', (user_id,))
            if not cursor.fetchone():
                return jsonify({'error': 'Пользователь не найден'}), 401
            
            # Генерируем новый access токен
            new_access_token = jwt.encode({
                'user_id': user_id,
                'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES'],
                'type': 'access'
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'access_token': new_access_token
            })
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Срок действия refresh токена истек'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Неверный refresh токен'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    """Выход пользователя"""
    # В JWT нет состояния, так что просто возвращаем успех
    # В продакшене можно добавить blacklist токенов
    return jsonify({'message': 'Выход выполнен успешно'})

# ---- ПОЛЬЗОВАТЕЛИ ----
@app.route('/api/users/me', methods=['GET'])
@token_required
def get_current_user():
    """Получение информации о текущем пользователе"""
    try:
        user_id = g.current_user['id']
        stats = calculate_user_stats(user_id)
        
        user_data = {
            'id': g.current_user['id'],
            'username': g.current_user['username'],
            'email': g.current_user['email'],
            'group': g.current_user['user_group'],
            'subscription': g.current_user['subscription_level'],
            'role': g.current_user['role'],
            'avatar': g.current_user['avatar_url'],
            'created_at': g.current_user['created_at'],
            'stats': stats
        }
        
        return jsonify(user_data)
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/users/me', methods=['PUT'])
@token_required
def update_current_user():
    """Обновление информации о пользователе"""
    try:
        data = request.get_json()
        user_id = g.current_user['id']
        
        db = get_db()
        cursor = db.cursor()
        
        # Разрешаем обновлять только определенные поля
        update_fields = []
        update_values = []
        
        if 'username' in data:
            # Проверка уникальности username
            cursor.execute('SELECT id FROM users WHERE username = ? AND id != ?', 
                         (data['username'], user_id))
            if cursor.fetchone():
                return jsonify({'error': 'Имя пользователя уже занято'}), 409
            update_fields.append('username = ?')
            update_values.append(data['username'])
        
        if 'email' in data:
            # Проверка уникальности email
            cursor.execute('SELECT id FROM users WHERE email = ? AND id != ?', 
                         (data['email'], user_id))
            if cursor.fetchone():
                return jsonify({'error': 'Email уже используется'}), 409
            update_fields.append('email = ?')
            update_values.append(data['email'])
        
        if 'group' in data:
            update_fields.append('user_group = ?')
            update_values.append(data['group'])
        
        if 'subscription' in data:
            update_fields.append('subscription_level = ?')
            update_values.append(data['subscription'])
        
        if update_fields:
            update_values.append(user_id)
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, update_values)
            db.commit()
        
        # Получаем обновленные данные
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = dict(cursor.fetchone())
        stats = calculate_user_stats(user_id)
        
        return jsonify({
            'message': 'Данные обновлены',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'group': user['user_group'],
                'subscription': user['subscription_level'],
                'role': user['role'],
                'avatar': user['avatar_url'],
                'stats': stats
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/users/me/password', methods=['PUT'])
@token_required
def change_password():
    """Смена пароля"""
    try:
        data = request.get_json()
        
        if not data or 'current_password' not in data or 'new_password' not in data:
            return jsonify({'error': 'Требуется текущий и новый пароль'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        user_id = g.current_user['id']
        
        if len(new_password) < 8:
            return jsonify({'error': 'Новый пароль должен быть не менее 8 символов'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Получаем текущий пароль
        cursor.execute('SELECT password_hash FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        # Проверяем текущий пароль
        if not check_password_hash(user['password_hash'], current_password):
            return jsonify({'error': 'Неверный текущий пароль'}), 401
        
        # Обновляем пароль
        new_password_hash = generate_password_hash(new_password)
        cursor.execute('UPDATE users SET password_hash = ? WHERE id = ?', 
                     (new_password_hash, user_id))
        db.commit()
        
        return jsonify({'message': 'Пароль успешно изменен'})
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/users/me/avatar', methods=['POST'])
@token_required
def upload_avatar():
    """Загрузка аватара пользователя"""
    try:
        if 'avatar' not in request.files:
            return jsonify({'error': 'Файл не выбран'}), 400
        
        file = request.files['avatar']
        
        if file.filename == '':
            return jsonify({'error': 'Файл не выбран'}), 400
        
        if file:
            # Безопасное имя файла
            filename = secure_filename(file.filename)
            # Уникальное имя файла
            unique_filename = f"{g.current_user['id']}_{datetime.now().timestamp()}.{filename.split('.')[-1]}"
            filepath = os.path.join('static/avatars', unique_filename)
            
            # Сохраняем файл
            file.save(filepath)
            
            # Обновляем ссылку в БД
            db = get_db()
            cursor = db.cursor()
            avatar_url = f"/static/avatars/{unique_filename}"
            cursor.execute('UPDATE users SET avatar_url = ? WHERE id = ?', 
                         (avatar_url, g.current_user['id']))
            db.commit()
            
            return jsonify({
                'message': 'Аватар успешно загружен',
                'avatar_url': avatar_url
            })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# ---- ЛАБОРАТОРИИ ----
@app.route('/api/labs', methods=['GET'])
@token_required
def get_labs():
    """Получение списка лабораторий"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Параметры фильтрации
        difficulty = request.args.get('difficulty')
        category = request.args.get('category')
        status = request.args.get('status', 'active')
        
        query = "SELECT * FROM labs WHERE 1=1"
        params = []
        
        if difficulty:
            query += " AND difficulty = ?"
            params.append(difficulty)
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        if status == 'active':
            query += " AND is_active = 1"
        
        cursor.execute(query, params)
        labs = [dict(row) for row in cursor.fetchall()]
        
        # Получаем прогресс пользователя для каждой лаборатории
        user_id = g.current_user['id']
        for lab in labs:
            cursor.execute('''
                SELECT status, score, attempts FROM user_progress 
                WHERE user_id = ? AND lab_id = ?
            ''', (user_id, lab['id']))
            progress = cursor.fetchone()
            
            if progress:
                lab['user_progress'] = dict(progress)
            else:
                lab['user_progress'] = {
                    'status': 'not_started',
                    'score': 0,
                    'attempts': 0
                }
        
        return jsonify(labs)
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/labs/<lab_id>', methods=['GET'])
@token_required
def get_lab(lab_id):
    """Получение информации о конкретной лаборатории"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('SELECT * FROM labs WHERE id = ?', (lab_id,))
        lab = cursor.fetchone()
        
        if not lab:
            return jsonify({'error': 'Лаборатория не найдена'}), 404
        
        lab_data = dict(lab)
        
        # Получаем прогресс пользователя
        user_id = g.current_user['id']
        cursor.execute('''
            SELECT * FROM user_progress 
            WHERE user_id = ? AND lab_id = ?
        ''', (user_id, lab_id))
        progress = cursor.fetchone()
        
        if progress:
            lab_data['user_progress'] = dict(progress)
        else:
            lab_data['user_progress'] = {
                'status': 'not_started',
                'score': 0,
                'attempts': 0
            }
        
        return jsonify(lab_data)
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/labs/<lab_id>/start', methods=['POST'])
@token_required
def start_lab(lab_id):
    """Начало выполнения лаборатории"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Проверяем существование лаборатории
        cursor.execute('SELECT * FROM labs WHERE id = ? AND is_active = 1', (lab_id,))
        lab = cursor.fetchone()
        
        if not lab:
            return jsonify({'error': 'Лаборатория не найдена или не активна'}), 404
        
        user_id = g.current_user['id']
        
        # Проверяем, не начата ли уже лаборатория
        cursor.execute('''
            SELECT id FROM user_progress 
            WHERE user_id = ? AND lab_id = ? AND status = 'in_progress'
        ''', (user_id, lab_id))
        
        if cursor.fetchone():
            return jsonify({'error': 'Лаборатория уже выполняется'}), 400
        
        # Создаем запись о начале
        progress_id = str(uuid.uuid4())
        started_at = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_progress 
            (id, user_id, lab_id, status, started_at, attempts, score)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (progress_id, user_id, lab_id, 'in_progress', started_at, 0, 0))
        
        db.commit()
        
        return jsonify({
            'message': 'Лаборатория начата',
            'progress_id': progress_id,
            'started_at': started_at
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/labs/<lab_id>/submit', methods=['POST'])
@token_required
def submit_lab(lab_id):
    """Отправка флага лаборатории"""
    try:
        data = request.get_json()
        
        if not data or 'flag' not in data:
            return jsonify({'error': 'Требуется флаг'}), 400
        
        submitted_flag = data['flag']
        user_id = g.current_user['id']
        
        db = get_db()
        cursor = db.cursor()
        
        # Получаем лабораторию
        cursor.execute('SELECT * FROM labs WHERE id = ?', (lab_id,))
        lab = cursor.fetchone()
        
        if not lab:
            return jsonify({'error': 'Лаборатория не найдена'}), 404
        
        # Проверяем флаг
        if validate_flag(submitted_flag, lab['flag_hash']):
            # Флаг правильный
            completed_at = datetime.now().isoformat()
            
            # Обновляем прогресс
            cursor.execute('''
                UPDATE user_progress 
                SET status = 'completed', completed_at = ?, 
                    attempts = attempts + 1, score = ?
                WHERE user_id = ? AND lab_id = ?
            ''', (completed_at, lab['points'], user_id, lab_id))
            
            # Если записи не было, создаем
            if cursor.rowcount == 0:
                progress_id = str(uuid.uuid4())
                cursor.execute('''
                    INSERT INTO user_progress 
                    (id, user_id, lab_id, status, started_at, completed_at, attempts, score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (progress_id, user_id, lab_id, 'completed', 
                      completed_at, completed_at, 1, lab['points']))
            
            db.commit()
            
            return jsonify({
                'message': 'Поздравляем! Лаборатория успешно завершена',
                'correct': True,
                'points': lab['points']
            })
        else:
            # Флаг неверный
            cursor.execute('''
                UPDATE user_progress 
                SET attempts = attempts + 1
                WHERE user_id = ? AND lab_id = ?
            ''', (user_id, lab_id))
            
            # Если записи не было, создаем с статусом in_progress
            if cursor.rowcount == 0:
                progress_id = str(uuid.uuid4())
                started_at = datetime.now().isoformat()
                cursor.execute('''
                    INSERT INTO user_progress 
                    (id, user_id, lab_id, status, started_at, attempts, score)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (progress_id, user_id, lab_id, 'in_progress', started_at, 1, 0))
            
            db.commit()
            
            return jsonify({
                'message': 'Неверный флаг',
                'correct': False
            })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/labs/<lab_id>/progress', methods=['GET'])
@token_required
def get_lab_progress(lab_id):
    """Получение прогресса по лаборатории"""
    try:
        user_id = g.current_user['id']
        
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
            SELECT up.*, l.title, l.points 
            FROM user_progress up
            JOIN labs l ON up.lab_id = l.id
            WHERE up.user_id = ? AND up.lab_id = ?
        ''', (user_id, lab_id))
        
        progress = cursor.fetchone()
        
        if not progress:
            # Если прогресса нет, возвращаем базовую информацию
            cursor.execute('SELECT title, points FROM labs WHERE id = ?', (lab_id,))
            lab = cursor.fetchone()
            
            if not lab:
                return jsonify({'error': 'Лаборатория не найдена'}), 404
            
            return jsonify({
                'lab_id': lab_id,
                'title': lab['title'],
                'max_points': lab['points'],
                'status': 'not_started',
                'score': 0,
                'attempts': 0
            })
        
        return jsonify(dict(progress))
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# ---- CTF СИСТЕМА ----
@app.route('/api/ctf/challenges', methods=['GET'])
@token_required
def get_ctf_challenges():
    """Получение списка CTF задач"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Параметры фильтрации
        category = request.args.get('category')
        difficulty = request.args.get('difficulty')
        
        query = "SELECT * FROM ctf_challenges WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        if difficulty:
            query += " AND difficulty = ?"
            params.append(difficulty)
        
        cursor.execute(query, params)
        challenges = [dict(row) for row in cursor.fetchall()]
        
        # Получаем информацию о решенных задачах
        user_id = g.current_user['id']
        for challenge in challenges:
            cursor.execute('''
                SELECT solved_at FROM ctf_solves 
                WHERE user_id = ? AND challenge_id = ?
            ''', (user_id, challenge['id']))
            solve = cursor.fetchone()
            
            challenge['solved'] = solve is not None
            if solve:
                challenge['solved_at'] = solve['solved_at']
        
        return jsonify(challenges)
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/ctf/challenges/<challenge_id>', methods=['GET'])
@token_required
def get_ctf_challenge(challenge_id):
    """Получение информации о CTF задаче"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('SELECT * FROM ctf_challenges WHERE id = ?', (challenge_id,))
        challenge = cursor.fetchone()
        
        if not challenge:
            return jsonify({'error': 'Задача не найдена'}), 404
        
        challenge_data = dict(challenge)
        
        # Проверяем, решена ли задача
        user_id = g.current_user['id']
        cursor.execute('''
            SELECT solved_at FROM ctf_solves 
            WHERE user_id = ? AND challenge_id = ?
        ''', (user_id, challenge_id))
        solve = cursor.fetchone()
        
        challenge_data['solved'] = solve is not None
        if solve:
            challenge_data['solved_at'] = solve['solved_at']
        
        # Количество решений
        cursor.execute('''
            SELECT COUNT(*) as solve_count FROM ctf_solves 
            WHERE challenge_id = ?
        ''', (challenge_id,))
        solve_count = cursor.fetchone()['solve_count']
        challenge_data['solve_count'] = solve_count
        
        return jsonify(challenge_data)
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/ctf/challenges/<challenge_id>/submit', methods=['POST'])
@token_required
def submit_ctf_flag(challenge_id):
    """Отправка флага CTF задачи"""
    try:
        data = request.get_json()
        
        if not data or 'flag' not in data:
            return jsonify({'error': 'Требуется флаг'}), 400
        
        submitted_flag = data['flag']
        user_id = g.current_user['id']
        
        db = get_db()
        cursor = db.cursor()
        
        # Получаем задачу
        cursor.execute('SELECT * FROM ctf_challenges WHERE id = ?', (challenge_id,))
        challenge = cursor.fetchone()
        
        if not challenge:
            return jsonify({'error': 'Задача не найдена'}), 404
        
        # Проверяем, не решена ли уже задача
        cursor.execute('''
            SELECT id FROM ctf_solves 
            WHERE user_id = ? AND challenge_id = ?
        ''', (user_id, challenge_id))
        
        if cursor.fetchone():
            return jsonify({'error': 'Задача уже решена'}), 400
        
        # Проверяем флаг
        if validate_flag(submitted_flag, challenge['flag_hash']):
            # Флаг правильный
            solve_id = str(uuid.uuid4())
            solved_at = datetime.now().isoformat()
            
            cursor.execute('''
                INSERT INTO ctf_solves (id, user_id, challenge_id, solved_at, flag_submitted)
                VALUES (?, ?, ?, ?, ?)
            ''', (solve_id, user_id, challenge_id, solved_at, submitted_flag))
            
            db.commit()
            
            return jsonify({
                'message': 'Поздравляем! Задача решена',
                'correct': True,
                'points': challenge['points'],
                'solved_at': solved_at
            })
        else:
            return jsonify({
                'message': 'Неверный флаг',
                'correct': False
            })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/ctf/leaderboard', methods=['GET'])
def get_ctf_leaderboard():
    """Получение таблицы лидеров CTF"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Получаем топ пользователей по очкам CTF
        cursor.execute('''
            SELECT 
                u.id,
                u.username,
                u.avatar_url,
                u.user_group,
                COALESCE(SUM(c.points), 0) as total_points,
                COUNT(DISTINCT s.challenge_id) as solved_count
            FROM users u
            LEFT JOIN ctf_solves s ON u.id = s.user_id
            LEFT JOIN ctf_challenges c ON s.challenge_id = c.id
            GROUP BY u.id, u.username, u.avatar_url, u.user_group
            ORDER BY total_points DESC, solved_count DESC
            LIMIT 50
        ''')
        
        leaderboard = []
        for i, row in enumerate(cursor.fetchall()):
            user_data = dict(row)
            user_data['rank'] = i + 1
            user_data['rank_title'] = calculate_rank(user_data['total_points'])
            leaderboard.append(user_data)
        
        return jsonify(leaderboard)
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/ctf/stats', methods=['GET'])
@token_required
def get_ctf_stats():
    """Получение статистики CTF для текущего пользователя"""
    try:
        user_id = g.current_user['id']
        
        db = get_db()
        cursor = db.cursor()
        
        # Общая статистика
        cursor.execute('''
            SELECT 
                COUNT(DISTINCT s.challenge_id) as solved_count,
                COALESCE(SUM(c.points), 0) as total_points,
                COUNT(DISTINCT c.category) as categories_count
            FROM ctf_solves s
            JOIN ctf_challenges c ON s.challenge_id = c.id
            WHERE s.user_id = ?
        ''', (user_id,))
        
        stats = dict(cursor.fetchone())
        
        # Статистика по категориям
        cursor.execute('''
            SELECT 
                c.category,
                COUNT(s.id) as solved,
                COALESCE(SUM(c.points), 0) as points
            FROM ctf_challenges c
            LEFT JOIN ctf_solves s ON c.id = s.challenge_id AND s.user_id = ?
            GROUP BY c.category
        ''', (user_id,))
        
        stats['by_category'] = [dict(row) for row in cursor.fetchall()]
        
        # Статистика по сложности
        cursor.execute('''
            SELECT 
                c.difficulty,
                COUNT(s.id) as solved,
                COUNT(c.id) as total,
                COALESCE(SUM(c.points), 0) as points
            FROM ctf_challenges c
            LEFT JOIN ctf_solves s ON c.id = s.challenge_id AND s.user_id = ?
            GROUP BY c.difficulty
        ''', (user_id,))
        
        stats['by_difficulty'] = [dict(row) for row in cursor.fetchall()]
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# ---- СТАТИСТИКА И АНАЛИТИКА ----
@app.route('/api/stats/overview', methods=['GET'])
@token_required
def get_stats_overview():
    """Получение общей статистики платформы"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Общее количество пользователей
        cursor.execute('SELECT COUNT(*) as total_users FROM users')
        total_users = cursor.fetchone()['total_users']
        
        # Активные пользователи (за последние 7 дней)
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()
        cursor.execute('''
            SELECT COUNT(DISTINCT user_id) as active_users 
            FROM user_progress 
            WHERE started_at > ?
        ''', (week_ago,))
        active_users = cursor.fetchone()['active_users']
        
        # Общее количество лабораторий
        cursor.execute('SELECT COUNT(*) as total_labs FROM labs WHERE is_active = 1')
        total_labs = cursor.fetchone()['total_labs']
        
        # Завершенные лаборатории
        cursor.execute('SELECT COUNT(*) as completed_labs FROM user_progress WHERE status = "completed"')
        completed_labs = cursor.fetchone()['completed_labs']
        
        # CTF статистика
        cursor.execute('SELECT COUNT(*) as total_ctf FROM ctf_challenges')
        total_ctf = cursor.fetchone()['total_ctf']
        
        cursor.execute('SELECT COUNT(*) as solved_ctf FROM ctf_solves')
        solved_ctf = cursor.fetchone()['solved_ctf']
        
        # Распределение по подпискам
        cursor.execute('''
            SELECT subscription_level, COUNT(*) as count 
            FROM users 
            GROUP BY subscription_level
        ''')
        subscriptions = [dict(row) for row in cursor.fetchall()]
        
        return jsonify({
            'users': {
                'total': total_users,
                'active': active_users,
                'subscriptions': subscriptions
            },
            'labs': {
                'total': total_labs,
                'completed': completed_labs
            },
            'ctf': {
                'total': total_ctf,
                'solved': solved_ctf
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/stats/user-progress', methods=['GET'])
@token_required
def get_user_progress():
    """Получение прогресса текущего пользователя"""
    try:
        user_id = g.current_user['id']
        
        db = get_db()
        cursor = db.cursor()
        
        # Прогресс по лабораториям
        cursor.execute('''
            SELECT 
                l.difficulty,
                COUNT(up.id) as total,
                SUM(CASE WHEN up.status = 'completed' THEN 1 ELSE 0 END) as completed,
                COALESCE(AVG(up.score), 0) as avg_score
            FROM labs l
            LEFT JOIN user_progress up ON l.id = up.lab_id AND up.user_id = ?
            WHERE l.is_active = 1
            GROUP BY l.difficulty
        ''', (user_id,))
        
        lab_progress = [dict(row) for row in cursor.fetchall()]
        
        # Последние активности
        cursor.execute('''
            SELECT 
                'lab' as type,
                l.title,
                up.status,
                up.completed_at as timestamp,
                up.score
            FROM user_progress up
            JOIN labs l ON up.lab_id = l.id
            WHERE up.user_id = ?
            UNION ALL
            SELECT 
                'ctf' as type,
                c.title,
                'completed' as status,
                s.solved_at as timestamp,
                c.points as score
            FROM ctf_solves s
            JOIN ctf_challenges c ON s.challenge_id = c.id
            WHERE s.user_id = ?
            ORDER BY timestamp DESC
            LIMIT 10
        ''', (user_id, user_id))
        
        recent_activity = [dict(row) for row in cursor.fetchall()]
        
        # Еженедельный прогресс (последние 4 недели)
        weekly_data = []
        for i in range(4):
            week_start = (datetime.now() - timedelta(weeks=i+1)).replace(hour=0, minute=0, second=0, microsecond=0)
            week_end = (datetime.now() - timedelta(weeks=i)).replace(hour=23, minute=59, second=59, microsecond=999999)
            
            cursor.execute('''
                SELECT 
                    COUNT(DISTINCT up.lab_id) as labs_completed,
                    COUNT(DISTINCT s.challenge_id) as ctf_solved,
                    COALESCE(SUM(up.score), 0) + COALESCE(SUM(c.points), 0) as points_earned
                FROM users u
                LEFT JOIN user_progress up ON u.id = up.user_id 
                    AND up.completed_at BETWEEN ? AND ?
                    AND up.status = 'completed'
                LEFT JOIN ctf_solves s ON u.id = s.user_id 
                    AND s.solved_at BETWEEN ? AND ?
                LEFT JOIN ctf_challenges c ON s.challenge_id = c.id
                WHERE u.id = ?
            ''', (week_start.isoformat(), week_end.isoformat(), 
                  week_start.isoformat(), week_end.isoformat(), 
                  user_id))
            
            week_stats = dict(cursor.fetchone())
            week_stats['week_start'] = week_start.isoformat()
            week_stats['week_end'] = week_end.isoformat()
            weekly_data.append(week_stats)
        
        return jsonify({
            'lab_progress': lab_progress,
            'recent_activity': recent_activity,
            'weekly_progress': weekly_data,
            'calculated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# ---- СИСТЕМНЫЕ КОМАНДЫ ----
@app.route('/api/system/health', methods=['GET'])
def health_check():
    """Проверка здоровья системы"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Проверяем подключение к БД
        cursor.execute('SELECT 1')
        db_ok = cursor.fetchone() is not None
        
        # Проверяем наличие основных таблиц
        tables = ['users', 'labs', 'user_progress', 'ctf_challenges', 'ctf_solves']
        tables_status = {}
        
        for table in tables:
            try:
                cursor.execute(f'SELECT COUNT(*) FROM {table}')
                tables_status[table] = True
            except:
                tables_status[table] = False
        
        return jsonify({
            'status': 'healthy' if db_ok and all(tables_status.values()) else 'degraded',
            'timestamp': datetime.now().isoformat(),
            'database': db_ok,
            'tables': tables_status,
            'version': '2.1.0'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/system/stats', methods=['GET'])
@admin_required
def system_stats():
    """Системная статистика (только для администраторов)"""
    try:
        import psutil
        import platform
        
        # Системная информация
        system_info = {
            'platform': platform.system(),
            'platform_release': platform.release(),
            'platform_version': platform.version(),
            'python_version': platform.python_version(),
            'processor': platform.processor()
        }
        
        # Использование ресурсов
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        resource_usage = {
            'cpu_percent': cpu_usage,
            'memory_total': memory.total,
            'memory_available': memory.available,
            'memory_percent': memory.percent,
            'disk_total': disk.total,
            'disk_used': disk.used,
            'disk_percent': disk.percent
        }
        
        # Статистика процессов
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        processes = sorted(processes, key=lambda x: x.get('cpu_percent', 0), reverse=True)[:10]
        
        return jsonify({
            'system': system_info,
            'resources': resource_usage,
            'top_processes': processes,
            'timestamp': datetime.now().isoformat()
        })
        
    except ImportError:
        return jsonify({'error': 'psutil не установлен'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---- ОБРАТНАЯ СВЯЗЬ ----
@app.route('/api/feedback', methods=['POST'])
@token_required
def submit_feedback():
    """Отправка обратной связи"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Требуется сообщение'}), 400
        
        user_id = g.current_user['id']
        message = data['message']
        feedback_type = data.get('type', 'general')
        
        db = get_db()
        cursor = db.cursor()
        
        feedback_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO feedback (id, user_id, type, message, created_at, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (feedback_id, user_id, feedback_type, message, created_at, 'new'))
        
        db.commit()
        
        # Здесь можно добавить отправку email уведомления
        
        return jsonify({
            'message': 'Спасибо за обратную связь!',
            'feedback_id': feedback_id,
            'created_at': created_at
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# ===== ЗАПУСК СЕРВЕРА =====
if __name__ == '__main__':
    # Проверяем и инициализируем БД если нужно
    if not os.path.exists(app.config['DATABASE']):
        print("База данных не найдена. Инициализация...")
        init_db()
        print("База данных создана с тестовыми данными.")
    
    print("Запуск сервера CyberSib API...")
    print(f"API доступен по адресу: http://localhost:5000")
    print(f"Демо-пользователь: demo / demo2024")
    print(f"Администратор: admin / admin2025")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
