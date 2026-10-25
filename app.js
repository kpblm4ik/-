document.addEventListener("DOMContentLoaded", async () => {
    // 1. Подключаем стили
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "main.css";
    document.head.appendChild(link);

    // 2. Создаем контейнер для контента
    const contentDiv = document.createElement("div");
    contentDiv.id = "journal-content";
    document.body.appendChild(contentDiv);

    // Создаем плашку для индикатора телепорта
    const notify = document.createElement('div');
    notify.id = 'buffer-notify';
    document.body.insertBefore(notify, contentDiv);

    try {
        // 3. Качаем твой index.md
        const response = await fetch("index.md");
        if (!response.ok) throw new Error("Не удалось найти index.md");
        const markdownText = await response.text();

        // Рендерим Markdown строго в наш контейнер
        contentDiv.innerHTML = marked.parse(markdownText);

        // 4. Оживляем таблицу (ИСПРАВЛЕНО: добавлены индексы ячеек)
        const rows = contentDiv.querySelectorAll('table tbody tr');
        rows.forEach(row => {
            const indexCell = row.cells[0];  // Первая ячейка (№)
            const targetCell = row.cells[2]; // Третья ячейка (Оценка)
            
            if (targetCell && indexCell) {
                targetCell.classList.add('selectable');
                targetCell.setAttribute('tabindex', '0');
                targetCell.setAttribute('data-id', indexCell.innerText.trim());
            }
        });

        // 5. Включаем клавиши
        initControls(notify);

    } catch (err) {
        console.error("Ошибка:", err);
        notify.innerText = `[ ОШИБКА ЗАГРУЗКИ: ${err.message} ]`;
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

        // Телепорт
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

        // Сохранение (S)
        if (key.toLowerCase() === 's' || key.toLowerCase() === 'ы') {
            event.preventDefault();
            const data = [];
            document.querySelectorAll('.selectable').forEach(cell => {
                data.push({ id: cell.getAttribute('data-id'), val: cell.innerText });
            });
            console.log('Данные для P2P:', JSON.stringify(data));
            notify.innerText = '[ ДАННЫЕ СОХРАНЕНЫ В КОНСОЛЬ ]';
            setTimeout(() => notify.innerText = '', 1500);
            return;
        }

        // Управление W и A
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
