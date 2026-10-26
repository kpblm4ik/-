// ЧАСТЬ 1: Расширенный список стабильных STUN-серверов
const rtcConfig = {
    iceServers: [
        { urls: "stun:://google.com" },
        { urls: "stun:://google.com" },
        { urls: "stun:://google.com" },
        { urls: "stun:stunserver.org:3478" },
        { urls: "stun:://nextcloud.com" }
    ]
};

// ЧАСТЬ 2: Запрос сетевого адреса устройства
function getMyExternalIP() {
    console.log("[P2P] Поиск внешнего IP-адреса...");
    const pc = new RTCPeerConnection(rtcConfig);
    pc.createDataChannel("p2p-data");

    pc.onicecandidate = (event) => {
        if (!event.candidate) return;

        const candidate = event.candidate.candidate;
        // Регулярка для поиска IPv4 или IPv6 адресов в строке кандидата
        const ipRegex = /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(\d{1,3}\.){3}\d{1,3}/;
        const match = candidate.match(ipRegex);

        if (match) {
            const myIP = match[0];
            console.log("[P2P] Найден адрес:", myIP);
            
            const ipDisplay = document.getElementById("my-p2p-ip");
            if (ipDisplay) {
                ipDisplay.innerText = `ВАШ P2P IP: ${myIP}`;
            }
        }
    };

    pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(err => console.error("[P2P] Ошибка инициализации:", err));
}

// Защита от бесконечного зависания плашки
setTimeout(() => {
    const ipDisplay = document.getElementById("my-p2p-ip");
    if (ipDisplay && ipDisplay.innerText === "ОПРЕДЕЛЕНИЕ P2P IP...") {
        ipDisplay.innerText = "СТАТУС P2P: ЛОКАЛЬНЫЙ РЕЖИМ (STUN ЗАБЛОКИРОВАН)";
    }
}, 3000);

// Запуск при загрузке
window.addEventListener("DOMContentLoaded", getMyExternalIP);
