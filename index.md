<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Альтернативный Школьный Портал</title>
    <!-- Подключаем стили из папки css -->
    <link rel="stylesheet" href="css/main.css">
</head>
<body>

    <h1>📓 АЛЬТЕРНАТИВНЫЙ ШКОЛЬНЫЙ ПОРТАЛ</h1>
    
    <p>Вы зашли в децентрализованную P2P-систему учета успеваемости. Выберите вашу роль для начала работы:</p>

    <div class="buttons-container">
        <a href="#teacher">Я - ПРЕПОДАВАТЕЛЬ</a>
        <a href="#student">Я - СТУДЕНТ</a>
        <a href="#dean">Я - ЗАВДЕКАНАТ</a>
    </div>

    <!-- Сюда JS будет подставлять экраны -->
    <div id="role-section">
        <p>[ Выберите роль выше, чтобы активировать интерфейс ]</p>
    </div>

    <!-- Подключаем скрипт -->
    <script src="app.js"></script>
</body>
</html>
