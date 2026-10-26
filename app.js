// Ждем, пока GitHub отрендерит страницу из Маркдауна
window.addEventListener("load", () => {
    // Создаем плашку для индикатора телепорта
    const notify = document.createElement('div');
    notify.id = 'buffer-notify';
    document.body.insertBefore(notify, document.body.firstChild);

    try {
        // Находим все строки в таблице, которую сгенерировал Маркдаун
        const rows = document.querySelectorAll('table tbody tr');
        
        if (rows.length === 0) {
            throw new Error("Таблица не найдена на странице. Проверьте разметку Маркдауна.");
        }
        
        rows.forEach(row => {
            // Находим внутри строки все ячейки td
            const allTds = row.querySelectorAll('td');
            
            // Если в строке есть хотя бы 3 ячейки (это обычная строка со студентом, а не заголовок)
            if (allTds && allTds.length >= 3) {
                const indexCell = allTds[0];  // Первая ячейка (номер)
                const targetCell = allTds[2]; // Третья ячейка (оценка)
                
                if (targetCell && indexCell) {
                    targetCell.classList.add('selectable');
                    targetCell.setAttribute('tabindex', '0');
                    // Привязываем ID студента к его номеру
                    targetCell.setAttribute('data-id', indexCell.innerText.trim());
                }
            }
        });

        // Включаем управление клавишами
        initControls(notify);
        console.log("Журнал успешно оживлен силами чистого JS!");

    } catch (err) {
        console.error("Ошибка оживления таблицы:", err);
        notify.innerHTML = `<span style="color:red; font-weight:bold;">[ ОШИБКА: ${err.message} ]</span>`;
    }
});

function initControls(notify) {
    const grades = ['•', '2', '3', '4', '5'];
    const statuses = ['•', 'Б', 'Н', 'Н/А'];
    let numberBuffer = '';
    let bufferTimeout;

    document.addEventListener('keydown', (event) => {
        const key = event.key;
        const activeCell = document.activeElement;

        // 1. Цифровой телепорт
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

        // 2. Быстрое сохранение (S)
        if (key.toLowerCase() === 's' || key.toLowerCase() === 'ы') {
            event.preventDefault();
            const data = [];
            document.querySelectorAll('.selectable').forEach(cell => {
                data.push({ id: cell.getAttribute('data-id'), val: cell.innerText });
            });
            console.log('Пакет данных для P2P готов:', JSON.stringify(data));
            notify.innerText = '[ ДАННЫЕ СОХРАНЕНЫ ]';
            setTimeout(() => notify.innerText = '', 1500);
            return;
        }

        // 3. Управление оценками (W и A)
        if (!activeCell || !activeCell.classList.contains('selectable')) return;
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
    });
}
