# Развертывание CyberSib Platform

## Варианты хостинга

### 1. Российские облачные платформы (рекомендуется)
- **Timeweb Cloud** - от 300₽/месяц
- **Selectel** - от 500₽/месяц  
- **Reg.ru** - от 400₽/месяц
- **FirstVDS** - от 250₽/месяц

### 2. Международные платформы
- **DigitalOcean** - от $5/месяц
- **Linode** - от $5/месяц
- **AWS Lightsail** - от $3.5/месяц
- **Vultr** - от $2.5/месяц

### 3. Бесплатные варианты (для тестирования)
- **PythonAnywhere** - бесплатный тариф
- **Heroku** - с ограничениями
- **Railway** - бесплатные кредиты

## Быстрое развертывание на PythonAnywhere

### Шаг 1: Создание аккаунта
1. Перейдите на [pythonanywhere.com](https://www.pythonanywhere.com)
2. Зарегистрируйтесь (бесплатный тариф)

### Шаг 2: Загрузка файлов
1. В панели управления выберите "Files"
2. Создайте папку `cybersib`
3. Загрузите все файлы проекта

### Шаг 3: Настройка веб-приложения
1. Перейдите на вкладку "Web"
2. Нажмите "Add a new web app"
3. Выберите "Manual configuration"
4. Выберите Python 3.10
5. В WSGI файле замените содержимое на:

```python
import sys
path = '/home/ваш_логин/cybersib'
if path not in sys.path:
    sys.path.append(path)

from app import app as application