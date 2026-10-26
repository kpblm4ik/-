document.addEventListener("DOMContentLoaded", async () => {
    // 1. Подключаем стили
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "main.css";
    document.head.appendChild(link);

    // 2. Создаем элементы интерфейса
    const notify = document.createElement('div');
    notify.id = 'buffer-notify';
    document.body.appendChild(notify);

    const contentDiv = document.createElement("div");
    contentDiv.id = "journal-content";
    document.body.appendChild(contentDiv);

    try {
        // 3. Качаем чистый текстовый файл journal.md
        const response = await fetch("journal.md");
        if (!response.ok) throw new Error("Файл journal.md не найден");
        const text = await response.text();

        // 4. НАШ СОБСТВЕННЫЙ ЛЕНИВЫЙ ПАРСЕР ТАБЛИЦЫ
        let tableHTML = "<table><thead><tr><th>№</th><th>Студент</th><th>Оценка</th></tr></thead><tbody>";
        
        // Разбираем текст по строкам
        const lines = text.split("\n");
        lines.forEach(line => {
            // Ищем только строки, которые начинаются и заканчиваются на вертикальную черту |
            if (line.trim().startsWith("|") && !line.includes("---|")) {
                const cells = line.split("|").map(c => c.trim()).filter(c => c !== "");
                
                // Проверяем, что это строка со студентом (первая ячейка должна быть числом)
                if (cells.length >= 3 && /^\d+$/.test(cells.item(0))) {
                    const num = cells.item(0);
                    const name = cells.item(1);
                    const val = cells.item(2);

                    tableHTML += `<tr>
                        <td>${num}</td>
                        <td>${name}</td>
                        <td class="selectable" tabindex="0" data-id="${num}">${val}</td>
                    </tr>`;
                }
            }
        });
        tableHTML += "</tbody></table>";

        // Выводим заголовок вручную и вставляем таблицу
        contentDiv.innerHTML = "<h1>📓 ВРЕМЕННЫЙ ЖУРНАЛ ДЗ И ОЦЕНОК</h1><hr>" + tableHTML;

        // 5. Включаем горячие клавиши
        initControls(notify);

    } catch (err) {
        console.error(err);
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
            console.log('Данные для отправки:', JSON.stringify(data));
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
