window.addEventListener("load", () => {
    // Создаем плашку для индикатора действий верхним элементом
    const notify = document.createElement('div');
    notify.id = 'buffer-notify';
    document.body.insertBefore(notify, document.body.firstChild);

    // Функция переключения экранов
    const renderRoleScreen = () => {
        const hash = window.location.hash;
        const roleSection = document.getElementById("role-section");
        
        if (!roleSection) return;

        // Очищаем прошлые уведомления
        notify.innerText = '';

        // 1. ЭКРАН ПРЕПОДАВАТЕЛЯ
        if (hash === "#teacher") {
            roleSection.innerHTML = `
                <h2>👨‍🏫 РЕЖИМ: ПРЕПОДАВАТЕЛЬ</h2>
                <div class="box">
                    <p>Интерфейс журнала загружается из внешнего файла...</p>
                    <p>Нажмите <kbd>S</kbd> для симуляции сохранения данных.</p>
                </div>
            `;
            initControls(notify, true);
        } 
        
        // 2. ЭКРАН СТУДЕНТА
        else if (hash === "#student") {
            roleSection.innerHTML = `
                <h2>🧑‍🎓 РЕЖИМ: СТУДЕНТ</h2>
                <div class="box">
                    <p>Ожидание ввода P2P-ключа для синхронизации ведомости.</p>
                </div>
            `;
            initControls(notify, false);
        } 
        
        // 3. ЭКРАН ЗАВДЕКАНАТА
        else if (hash === "#dean") {
            roleSection.innerHTML = `
                <h2>💼 РЕЖИМ: ЗАВДЕКАНАТ</h2>
                <div class="box">
                    <p>Панель мониторинга работы кафедр колледжа.</p>
                </div>
            `;
            initControls(notify, false);
        }
    };

    // Вешаем ленивое слушание изменения хэша ссылки
    window.addEventListener("hashchange", renderRoleScreen);
    
    // Запускаем сразу, если страница открыта с готовым хэшем
    renderRoleScreen();
});

function initControls(notify, isEditable) {
    // Временный простейший слушатель клавиш для тестов кнопок
    document.onkeydown = null;
    document.onkeydown = (event) => {
        const key = event.key.toLowerCase();

        // Проверяем работу клавиши сохранения S (Ы)
        if (key === 's' || key === 'ы') {
            event.preventDefault();
            notify.innerText = '[ СИМУЛЯЦИЯ: ПАКЕТ ДАННЫХ СФОРМИРОВАН ]';
            setTimeout(() => notify.innerText = '', 1500);
        }
    };
}
