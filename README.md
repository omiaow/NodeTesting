# Тестовое Задание
Требовании: Node Version v18.20.4, PostgreSQL 17.2

## Установка
* Клонируйте приложение `git clone https://github.com/omiaow/NodeTesting.git`
* Откройте командную строку cmd в той же директории, и установите зависимости `npm install`
* Настройте среду в папке .env следующие ключи
```
# Копируйте следующие ключи для отправки имейлов
EMAIL_API_KEY=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
EMAIL_ADDRESS=komur.19991008@gmail.com
EMAIL_NAME=FEEDBACK

# Придумайте ключь для безопасности пользователей
JWT_KEY=SomeBullShitKey

# Напишите данные вашего PostgreSQL базы данных
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=effmob
DATABASE_USER=postgres
DATABASE_PASSWORD=qwerty

# Напишите желаемый порт где должна запуститься программа
PORT=8080
```
* Создайте таблицы в PostgreSQL с помощью sql запросов в папке [database.sql](https://github.com/omiaow/NodeTesting/blob/main/database.sql)
* Запустите сервер `npm start`


## Документация

### База данных
![Image caption](https://raw.githubusercontent.com/omiaow/NodeTesting/refs/heads/main/database.png)

### Фичи для Эффективности
* jwt для безопасной авторизации
* bcrypt для безопасности паролей
* brewo система отправки имейлов для безопасной регистрации
* node-cache кеширования для быстрого ответа
* pg для эффективного взаимодействия с базой данных

### API Эндпоинты
##### 1. Создание аккаунта
Метод: `POST`
Эндпоинт: `/user/create`
Тело запроса: `{ "email": "name@example.com" }`
Результат: `{ message: "User created successfully" }`

##### 2. Подтверждение аккаунта пользователя
Метод: `POST`
Эндпоинт: `/user/verify`
Тело запроса: `{ "email": "name@example.com", "verification": "123456", "password": "Password123" }`
Результат: `{ "message": "Successfully updated!", "token": "JWT_TOKEN" }`

##### 3. Вход в систему (логин)
Метод: `POST`
Эндпоинт: `/user/login`
Тело запроса: `{ "email": "name@example.com", "password": "Password123" }`
Результат: `{ "token": "JWT_TOKEN" }`

##### 4. Сброс пароля пользователя
Метод: `POST`
Эндпоинт: `/user/reset`
Тело запроса: `{ "email": "name@example.com" }`
Результат: `{ message: "Email successfully sent to user" }`



##### 5. Создание отзыва
Метод: `POST`
Header: `{ Authorization: "Bearer JWT_TOKEN" }`
Эндпоинт: `/feedback`
Тело запроса: 
```
{
  "title": "Отзыв",
  "description": "Описание отзыва",
  "category_id": 1,
  "status_id": 1
}
```
Результат:
```
{
  "message": "Feedback created successfully.",
  "feedback": {
    "id": 1,
    "title": "Отзыв",
    "description": "Описание отзыва",
    "category_id": 1,
    "status_id": 1,
    "author_id": 1,
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-01T00:00:00"
  }
}
```

##### 6. Получение отзыва по ID
Метод: `GET`
Эндпоинт: `/feedback/:id`
Входные данные: id
Ответ:
```
{
  "id": 1,
  "title": "Отзыв",
  "description": "Описание отзыва",
  "category_id": 1,
  "category_name": "Категория",
  "status_id": 1,
  "status_name": "Статус",
  "author_id": 1,
  "author_email": "user@example.com",
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00",
  "number_of_votes": 5
}
```

##### 7. Обновление отзыва
Метод: `PUT`
Header: `{ Authorization: "Bearer JWT_TOKEN" }`
Эндпоинт: `/feedback/:id`
Тело запроса: 
```
{
  "title": "Обновленный отзыв",
  "description": "Обновленное описание",
  "category_id": 1,
  "status_id": 1
}
```
Результат:
```
{
  "message": "Feedback updated successfully.",
  "feedback": {
    "id": 1,
    "title": "Обновленный отзыв",
    "description": "Обновленное описание",
    "category_id": 1,
    "status_id": 1,
    "author_id": 1,
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-02T00:00:00"
  }
}
```

##### 8. Удаление отзыва
Метод: `DELETE`
Header: `{ Authorization: "Bearer JWT_TOKEN" }`
Эндпоинт: `/feedback/:id`
Входные данные: id
Результат: `{ "message": "Feedback deleted successfully." }`

##### 9. Получение всех отзывов с пагинацией
Метод: `GET`
Эндпоинт: `/feedback/all/:page`
Входные данные: page
Ответ:
```
{
  "feedbacks": [
    {
      "id": 1,
      "title": "Отзыв 1",
      "description": "Описание отзыва 1",
      "category_id": 1,
      "category_name": "Категория 1",
      "status_id": 1,
      "status_name": "Статус 1",
      "author_id": 1,
      "author_email": "user@example.com",
      "created_at": "2025-01-01T00:00:00",
      "updated_at": "2025-01-01T00:00:00",
      "number_of_votes": 3
    }, ...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalFeedbacks": 100,
    "feedbacksPerPage": 10
  }
}
```

##### 10. Голосование за отзыв
Метод: `POST`
Header: `{ Authorization: "Bearer JWT_TOKEN" }`
Эндпоинт: `/feedback/vote`
Тело запроса: `{ "feedback_id": 1 }`
Результат: `{ "message": "Upvote added." }` `{ "message": "Upvote removed." }`

##### 11. Получение список категорий
Метод: `GET`
Эндпоинт: `/categories`
Результат: `{ "categories": [] }`

##### 12. Получение спиксок статусов
Метод: `GET`
Эндпоинт: `/statuses`
Результат: `{ "statuses": [] }`
