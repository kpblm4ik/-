// ЧАСТЬ 1: Настройка STUN-серверов для WebRTC
const rtcConfig = {
    iceServers: [
        { urls: "stun:stun.chathelp.ru:3478" },
        { urls: "stun:stun.comtube.ru:3478" },
        { urls: "stun:stun.3cx.com:3478" },
        { urls: "stun:23.21.150.121:3478" }
    ]
};

// Функция для запроса внешнего IP через WebRTC
function getMyExternalIP() {
    console.log("[P2P] Запрос внешнего IP-адреса через STUN...");
    
    // Создаем пустое P2P-соединение (без отправки аудио или видео)
    const pc = new RTCPeerConnection(rtcConfig);
    pc.createDataChannel("p2p-data");

    // ЧАСТЬ 2: Перехват ICE-кандидатов от STUN-сервера
    pc.onicecandidate = (event) => {
        if (!event.candidate) return; // Все кандидаты собраны

        const candidate = event.candidate.candidate;
        console.log("[P2P] Найден сетевой кандидат:", candidate);

        // Регулярное выражение для поиска IPv4 или IPv6 адресов в строке кандидата
        const ipRegex = /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(\d{1,3}\.){3}\d{1,3}/;
        const match = candidate.match(ipRegex);

        if (match) {
            const myIP = match[0];
            console.log("[P2P] Успех! Мой внешний IP:", myIP);
            
            // Находим на странице элемент и выводим IP туда
            const ipDisplay = document.getElementById("my-p2p-ip");
            if (ipDisplay) {
                ipDisplay.innerText = `ВАШ P2P IP: ${myIP}`;
            }
        }
    };

    // ЧАСТЬ 3: Инициализация создания сетевого предложения
    pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(err => console.error("[P2P] Ошибка WebRTC:", err));
}

// Запускаем автоматический поиск IP при загрузке скрипта
window.addEventListener("DOMContentLoaded", getMyExternalIP);
