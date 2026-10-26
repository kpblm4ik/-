window.addEventListener("load", () => {
    // Создаем плашку для индикатора телепорта
    const notify = document.createElement('div');
    notify.id = 'buffer-notify';
    document.body.insertBefore(notify, document.body.firstChild);

    // Функция, которая отрисовывает нужный экран в зависимости от хэша (#teacher, #student, #dean)
    const renderRoleScreen = () => {
        const hash = window.location.hash;
        const roleSection = document.getElementById("role-section");
        
        if (!roleSection) return;

        // Очищаем предыдущий таймер буфера, если он был
        notify.innerText = '';

        // Временная заглушка списка студентов (ШИО) для генерации таблиц
        let tableRows = '';
        const students = ["Ив. И. И.", "Пл. М. К.", "Ск. А. С.", "Кр. Д. А.", "Фо. Н. В."];
        students.forEach((shio, i) => {
            tableRows += `<tr><td>${i + 1}</td><td>${shio}</td><td class="selectable" tabindex="0" data-id="${i + 1}">•</td></tr>`;
        });

        // 1. ЭКРАН ПРЕПОДАВАТЕЛЯ
        if (hash === "#teacher") {
            roleSection.innerHTML = `
                <h2>👨‍🏫 РЕЖИМ: ПРЕПОДАВАТЕЛЬ</h2>
                <div class="box">Тапайте <b>W</b> (оценки), <b>A</b> (явка). Вводите цифры для телепорта. Нажмите <b>S</b> для отправки.</div>
                <table>
                    <thead><tr><th style="width:40px;">№</th><th>ШИО</th><th style="width:150px;">ОЦЕНКА</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            `;
            // Оживляем только что созданную таблицу преподавателя
            activateTableCells();
            initControls(notify, true); // true означает, что разрешено редактирование
        } 
        
        // 2. ЭКРАН СТУДЕНТА
        else if (hash === "#student") {
            roleSection.innerHTML = `
                <h2>🧑‍🎓 РЕЖИМ: СТУДЕНТ</h2>
                <div class="box" style="margin-bottom: 15px;">
                    <label>ВВЕДИТЕ P2P-КЛЮЧ ПРЕДМЕТА: </label>
                    <input type="text" id="p2p-key" style="background:#fff; color:#000; border:1px solid #000; font-family:monospace; padding:4px;" placeholder="prep-math-2026">
                    <a href="#connect" id="connect-btn" style="padding: 3px 10px; margin: 0 5px; font-size: 12px;">ПОДКЛЮЧИТЬСЯ</a>
                </div>
                <table>
                    <thead><tr><th style="width:40px;">№</th><th>ШИО</th><th style="width:150px;">ОЦЕНКА</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            `;
            initControls(notify, false); // false — студент может только смотреть и прожимать телепорт
        } 
        
        // 3. ЭКРАН ЗАВДЕКАНАТА
        else if (hash === "#dean") {
            roleSection.innerHTML = `
                <h2>💼 РЕЖИМ: ЗАВДЕКАНАТ</h2>
                <div class="box">Здесь будет сводный лог подключений по всем группам колледжа.</div>
                <table>
                    <thead><tr><th style="width:40px;">№</th><th>ШИО</th><th style="width:150px;">ОЦЕНКА</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <p><i>[ Статус: Ожидание подключения к базам преподавателей ]</i></p>
            `;
            initControls(notify, false);
        }
    };

    // Слушаем переключение кнопок
    window.addEventListener("hashchange", renderRoleScreen);
    
    // Запускаем проверку сразу при загрузке (если кто-то обновил страницу уже с хэшем)
    renderRoleScreen();
});

// Функция, которая находит ячейки и делает их selectable
function activateTableCells() {
    const rows = document.querySelectorAll('table tr');
    rows.forEach(row => {
        const allTds = row.querySelectorAll('td');
        if (allTds && allTds.length >= 3) {
            const indexCell = allTds;
            const targetCell = allTds;
            
            if (targetCell && indexCell) {
                targetCell.classList.add('selectable');
                targetCell.setAttribute('tabindex', '0');
                targetCell.setAttribute('data-id', indexCell.innerText.trim());
            }
        }
    });
}

function initControls(notify, isEditable) {
    const grades = ['•', '2', '3', '4', '5'];
    const statuses = ['•', 'Б', 'Н', 'Н/А'];
    let numberBuffer = '';
    let bufferTimeout;

    // Удаляем старый слушатель, чтобы они не копились при переключении вкладок
    document.onkeydown = null;

    document.onkeydown = (event) => {
        const key = event.key;
        const activeCell = document.activeElement;

        // Цифровой телепорт работает для всех ролей
        if (/^\d$/.test(key)) {
            event.preventDefault();
            numberBuffer += key;
            notify.innerText = `[ Переход к №${numberBuffer}... ]`;

            clearTimeout(bufferTimeout);
            bufferTimeout = setTimeout(() => {
                const target = document.querySelector(`[data-id="${numberBuffer}"]`);
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                numberBuffer = '';
                notify.innerText = '';
            }, 400);
            return;
        }

        // Кнопка сохранения данных (S)
        if (key.toLowerCase() === 's' || key.toLowerCase() === 'ы') {
            event.preventDefault();
            const data = [];
            document.querySelectorAll('.selectable').forEach(cell => {
                data.push({ id: cell.getAttribute('data-id'), val: cell.innerText });
            });
            console.log('JSON пакет подготовлен:', JSON.stringify(data));
            notify.innerText = '[ ДАННЫЕ СФОРМИРОВАНЫ ДЛЯ P2P ]';
            setTimeout(() => notify.innerText = '', 1500);
            return;
        }

        // Изменение оценок работает ТОЛЬКО если роль Editable (Преподаватель)
        if (!isEditable || !activeCell || !activeCell.classList.contains('selectable')) return;
        const currentText = activeCell.innerText.trim();
        const lowerKey = key.toLowerCase();

        if (lowerKey === 'w' || lowerKey === 'ц') {
            event.preventDefault();
            let idx = grades.indexOf(currentText);
            activeCell.innerText = grades[(idx === -1 ? 0 : idx + 1) % grades.length];
        }
        if (lowerKey === 'a' || lowerKey === 'ф') {
            event.preventDefault();
            let idx = statuses.indexOf(currentText);
            activeCell.innerText = statuses[(idx === -1 ? 0 : idx + 1) % statuses.length];
        }
    };
}
