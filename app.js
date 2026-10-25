// Ждем загрузки страницы и парсера Markdown
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Подключаем стили main.css динамически, чтобы не засорять index.md
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "main.css";
    document.head.appendChild(link);

    // Создаем контейнер для индикатора телепорта
    const notify = document.createElement('div');
    notify.id = 'buffer-notify';
    document.body.insertBefore(notify, document.body.firstChild);

    try {
        // 2. Лениво скачиваем твой чистый index.md
        const response = await fetch("index.md");
        const markdownText = await response.text();

        // Рендерим Markdown в HTML внутрь body
        document.body.innerHTML += marked.parse(markdownText);

        // 3. Оживляем таблицу (делаем ячейки интерактивными)
        const rows = document.querySelectorAll('table tbody tr');
        rows.forEach(row => {
            const indexCell = row.cells[0];
            const targetCell = row.cells[2]; // Колонка с оценками
            if (targetCell && indexCell) {
                targetCell.classList.add('selectable');
                targetCell.setAttribute('tabindex', '0');
                targetCell.setAttribute('data-id', indexCell.innerText.trim());
            }
        });

        // 4. Запускаем обработчик горячих клавиш
        initControls(notify);

    } catch (err) {
        console.error("Ошибка загрузки журнала:", err);
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

        // Цифровой телепорт
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

        // Быстрое сохранение (S)
        if (key.toLowerCase() === 's' || key.toLowerCase() === 'ы') {
            event.preventDefault();
            const data = [];
            document.querySelectorAll('.selectable').forEach(cell => {
                data.push({ id: cell.getAttribute('data-id'), val: cell.innerText });
            });
            console.log('Данные готовы к отправке:', JSON.stringify(data));
            notify.innerText = '[ ДАННЫЕ СОХРАНЕНЫ ]';
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
