from flask import Flask, render_template, jsonify, request, session, redirect, url_for, send_from_directory
import sqlite3
import os
from datetime import datetime
import logging
from werkzeug.security import generate_password_hash, check_password_hash

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))
app.config['DATABASE'] = 'cybersib.db'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file upload

# Настройки для продакшена
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
)

def get_db():
    """Подключение к базе данных"""
    db = sqlite3.connect(app.config['DATABASE'])
    db.row_factory = sqlite3.Row
    return db

def init_db():
    """Инициализация базы данных"""
    with app.app_context():
        db = get_db()
        with open('schema.sql', 'r') as f:
            db.cursor().executescript(f.read())
        
        # Создаем демо-пользователей для коммерческой версии
        cursor = db.cursor()
        
        # Проверяем, есть ли уже пользователи
        cursor.execute("SELECT COUNT(*) as count FROM users")
        count = cursor.fetchone()['count']
        
        if count == 0:
            # Создаем демо-пользователя
            hashed_password = generate_password_hash('demo2024')
            cursor.execute(
                "INSERT INTO users (username, email, password_hash, group_name, role, points) VALUES (?, ?, ?, ?, ?, ?)",
                ('demo', 'demo@cybersib.ru', hashed_password, 'Демо-группа', 'student', 45)
            )
            
            # Создаем администратора
            admin_password = generate_password_hash('admin2024')
            cursor.execute(
                "INSERT INTO users (username, email, password_hash, group_name, role) VALUES (?, ?, ?, ?, ?)",
                ('admin', 'admin@cybersib.ru', admin_password, 'Администраторы', 'admin')
            )
            
            logger.info("Созданы демо-пользователи")
        
        db.commit()

@app.before_first_request
def initialize():
    """Инициализация при первом запросе"""
    init_db()

@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html')

@app.route('/api/status')
def get_status():
    """Статус системы"""
    db = get_db()
    users_count = db.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
    labs_count = db.execute('SELECT COUNT(*) as count FROM labs WHERE is_active = 1').fetchone()['count']
    
    return jsonify({
        'status': 'online',
        'version': '2.0.0',
        'license': 'commercial',
        'users': users_count,
        'labs': labs_count,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/labs')
def get_labs():
    """Список лабораторных работ"""
    db = get_db()
    labs = db.execute('SELECT * FROM labs WHERE is_active = 1 ORDER BY id').fetchall()
    return jsonify([dict(lab) for lab in labs])

@app.route('/api/lab/<int:lab_id>')
def get_lab(lab_id):
    """Получение конкретной лабораторной работы"""
    db = get_db()
    lab = db.execute('SELECT * FROM labs WHERE id = ? AND is_active = 1', (lab_id,)).fetchone()
    
    if lab:
        return jsonify(dict(lab))
    else:
        return jsonify({'error': 'Лабораторная работа не найдена'}), 404

@app.route('/api/login', methods=['POST'])
def login():
    """Авторизация пользователя"""
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'success': False, 'error': 'Заполните все поля'})
        
        db = get_db()
        user = db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            (username, username)
        ).fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            # Обновляем последнюю активность
            db.execute(
                'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
                (user['id'],)
            )
            db.commit()
            
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            
            logger.info(f"Пользователь {username} вошел в систему")
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'role': user['role'],
                    'group': user['group_name'],
                    'points': user['points']
                }
            })
        
        logger.warning(f"Неудачная попытка входа для пользователя {username}")
        return jsonify({'success': False, 'error': 'Неверные учетные данные'})
    
    except Exception as e:
        logger.error(f"Ошибка при входе: {str(e)}")
        return jsonify({'success': False, 'error': 'Внутренняя ошибка сервера'})

@app.route('/api/register', methods=['POST'])
def register():
    """Регистрация пользователя"""
    try:
        data = request.json
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        group = data.get('group', '')
        
        # Валидация
        if not all([username, email, password, group]):
            return jsonify({'success': False, 'error': 'Заполните все поля'})
        
        if len(password) < 8:
            return jsonify({'success': False, 'error': 'Пароль должен содержать не менее 8 символов'})
        
        db = get_db()
        
        # Проверка существующего пользователя
        existing_user = db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            (username, email)
        ).fetchone()
        
        if existing_user:
            return jsonify({'success': False, 'error': 'Пользователь с таким логином или email уже существует'})
        
        # Создание пользователя
        hashed_password = generate_password_hash(password)
        cursor = db.cursor()
        cursor.execute(
            '''INSERT INTO users (username, email, password_hash, group_name, role, points) 
               VALUES (?, ?, ?, ?, ?, ?)''',
            (username, email, hashed_password, group, 'student', 0)
        )
        user_id = cursor.lastrowid
        
        db.commit()
        
        logger.info(f"Зарегистрирован новый пользователь: {username}")
        
        return jsonify({
            'success': True,
            'message': 'Регистрация успешна',
            'user_id': user_id
        })
    
    except Exception as e:
        logger.error(f"Ошибка при регистрации: {str(e)}")
        return jsonify({'success': False, 'error': 'Внутренняя ошибка сервера'})

@app.route('/api/logout', methods=['POST'])
def logout():
    """Выход из системы"""
    session.clear()
    return jsonify({'success': True})

@app.route('/api/user/profile')
def get_user_profile():
    """Получение профиля пользователя"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Требуется авторизация'})
    
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],)).fetchone()
    
    if not user:
        return jsonify({'success': False, 'error': 'Пользователь не найден'})
    
    # Получаем прогресс пользователя
    progress = db.execute(
        '''SELECT l.id, l.title, l.difficulty, up.status, up.score, up.completed_at
           FROM user_progress up
           JOIN labs l ON up.lab_id = l.id
           WHERE up.user_id = ?
           ORDER BY up.completed_at DESC''',
        (session['user_id'],)
    ).fetchall()
    
    return jsonify({
        'success': True,
        'user': dict(user),
        'progress': [dict(p) for p in progress]
    })

@app.route('/api/progress', methods=['POST'])
def update_progress():
    """Обновление прогресса пользователя"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Требуется авторизация'})
    
    try:
        data = request.json
        lab_id = data.get('lab_id')
        status = data.get('status')
        score = data.get('score', 0)
        
        if not lab_id or not status:
            return jsonify({'success': False, 'error': 'Неверные данные'})
        
        db = get_db()
        
        # Проверяем существующую запись
        existing = db.execute(
            'SELECT * FROM user_progress WHERE user_id = ? AND lab_id = ?',
            (session['user_id'], lab_id)
        ).fetchone()
        
        if existing:
            # Обновляем существующую запись
            db.execute(
                '''UPDATE user_progress 
                   SET status = ?, score = ?, completed_at = CURRENT_TIMESTAMP 
                   WHERE user_id = ? AND lab_id = ?''',
                (status, score, session['user_id'], lab_id)
            )
        else:
            # Создаем новую запись
            db.execute(
                '''INSERT INTO user_progress (user_id, lab_id, status, score, started_at, completed_at)
                   VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)''',
                (session['user_id'], lab_id, status, score)
            )
        
        # Обновляем статистику пользователя
        if status == 'completed':
            db.execute(
                'UPDATE users SET points = points + ?, completed_labs = completed_labs + 1 WHERE id = ?',
                (score, session['user_id'])
            )
        
        db.commit()
        
        logger.info(f"Прогресс обновлен для пользователя {session['user_id']}, лаборатория {lab_id}")
        
        return jsonify({'success': True})
    
    except Exception as e:
        logger.error(f"Ошибка при обновлении прогресса: {str(e)}")
        return jsonify({'success': False, 'error': 'Внутренняя ошибка сервера'})

@app.route('/api/ctf/leaderboard')
def get_ctf_leaderboard():
    """Таблица лидеров CTF"""
    db = get_db()
    
    # Здесь должна быть логика получения рейтинга CTF
    # Для демо возвращаем тестовые данные
    leaderboard = [
        {'username': 'demo', 'score': 150, 'solved': 5, 'rank': 1},
        {'username': 'hacker_pro', 'score': 130, 'solved': 4, 'rank': 2},
        {'username': 'security_expert', 'score': 110, 'solved': 4, 'rank': 3},
        {'username': 'new_user', 'score': 80, 'solved': 3, 'rank': 4},
        {'username': 'ctf_master', 'score': 75, 'solved': 3, 'rank': 5}
    ]
    
    return jsonify({'success': True, 'leaderboard': leaderboard})

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Отправка обратной связи"""
    try:
        data = request.json
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        feedback_type = data.get('type', '')
        message = data.get('message', '').strip()
        
        if not all([name, email, feedback_type, message]):
            return jsonify({'success': False, 'error': 'Заполните все поля'})
        
        # Здесь должна быть логика сохранения обратной связи в БД
        # Для демо просто логируем
        
        logger.info(f"Получена обратная связь от {name} ({email}): {feedback_type} - {message}")
        
        return jsonify({
            'success': True,
            'message': 'Сообщение отправлено! Мы ответим вам в течение 24 часов.'
        })
    
    except Exception as e:
        logger.error(f"Ошибка при отправке обратной связи: {str(e)}")
        return jsonify({'success': False, 'error': 'Внутренняя ошибка сервера'})

@app.route('/static/<path:filename>')
def static_files(filename):
    """Статические файлы"""
    return send_from_directory('static', filename)

# Обработчики ошибок
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    logger.error(f"Ошибка 500: {str(e)}")
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Для продакшена используйте gunicorn или uwsgi
    # Пример: gunicorn -w 4 -b 0.0.0.0:5000 app:app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True  # В продакшене установить False!
    )
