const servicesData = [
    { name: 'ChatGPT', img: 'static/img/ChatGPT.png' },
    { name: 'CapCut', img: 'static/img/CapCut.png' },
    { name: 'YouTube', img: 'static/img/YouTube.png' },
    { name: 'Instagram', img: 'static/img/Instagram.png' },
    { name: 'Discord', img: 'static/img/Discord.png' },
    { name: 'Twitch', img: 'static/img/Twitch.png' },
    { name: 'X', img: 'static/img/X.png' },
    { name: 'Netflix', img: 'static/img/Netflix.png' },
    { name: 'TikTok', img: 'static/img/TikTok.png' },
    { name: 'VPN', img: 'static/img/VPN.jpg' },
    { name: 'Google', img: 'static/img/Google.png' },
    { name: 'Telegram', img: 'static/img/Telegram.png' },
    { name: 'WhatsApp', img: 'static/img/WhatsApp.png' },
    { name: 'Teams', img: 'static/img/Teams.png' },
    { name: 'Viber', img: 'static/img/Viber.png' },
    { name: 'Zoom', img: 'static/img/Zoom.png' },
    { name: 'Steam', img: 'static/img/Steam.png' },
    { name: 'Epic Games', img: 'static/img/EpicGames.png' },
];

const STORAGE_KEY = 'rknData_v2';
const DEFAULT_DATA = {
    coins: 0,
    bannedServices: [],
    lastBackup: null,
    version: '1.0'
};

function initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    }
    const data = getStorageData();
    const now = Date.now();
    if (!data.lastBackup || (now - data.lastBackup) > 86400000) {
        autoBackup();
    }
}

function getStorageData() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(DEFAULT_DATA));
    } catch (e) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        return DEFAULT_DATA;
    }
}

function setStorageData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateCoinsDisplay();
}

function updateCoinsDisplay() {
    const data = getStorageData();
    document.getElementById('coinsDisplay').textContent = `${data.coins.toLocaleString('ru-RU')} ₽`;
    document.getElementById('totalCoins').textContent = `${data.coins.toLocaleString('ru-RU')} ₽`;
}

const cardWidth = 150;
const track = document.getElementById('track');
const spinBtn = document.getElementById('spinBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalWindow = document.getElementById('modalWindow');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const actionStep = document.getElementById('actionStep');
const resultStep = document.getElementById('resultStep');
const statusText = document.getElementById('statusText');
const salaryAmount = document.getElementById('salaryAmount');

let isSpinning = false;
let generatedItems = [];

function initRoulette() {
    let html = '';
    generatedItems = [];
    const totalItems = 100;

    for (let i = 0; i < totalItems; i++) {
        const randomService = servicesData[Math.floor(Math.random() * servicesData.length)];
        generatedItems.push(randomService);

        html += `
            <div class="service-card">
                <img src="${randomService.img}" class="service-img" alt="${randomService.name}">
                <div>${randomService.name}</div>
            </div>
        `;
    }
    track.innerHTML = html;
}

function exportDatabase() {
    const data = getStorageData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rkn-backup-${new Date().toISOString().slice(0, 10)}.rknbd`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('✅ База данных экспортирована!');
    }, 0);
}

function autoBackup() {
    const data = getStorageData();
    data.lastBackup = Date.now();
    setStorageData(data);
    console.log('Авто-бэкап создан:', new Date().toISOString());
}

document.getElementById('importFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            
            if (importedData.coins === undefined || importedData.bannedServices === undefined) {
                throw new Error('Неверный формат файла');
            }
            
            const backup = getStorageData();
            localStorage.setItem('rknData_backup', JSON.stringify(backup));
            
            setStorageData(importedData);
            showNotification('✅ База данных импортирована! Перезагрузка...');
            setTimeout(() => location.reload(), 1500);
        } catch (err) {
            showNotification(`❌ Ошибка импорта: ${err.message}`);
            console.error(err);
        } finally {
            e.target.value = '';
        }
    };
    reader.readAsText(file);
});

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.classList.add('show');
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => document.body.removeChild(notif), 300);
        }, 2000);
    }, 10);
}

initStorage();
initRoulette();
updateCoinsDisplay();

spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;

    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    initRoulette();
    track.offsetHeight;

    const targetIndex = Math.floor(Math.random() * (90 - 70 + 1) + 70);
    const containerCenter = track.parentElement.offsetWidth / 2;
    const cardCenter = cardWidth / 2;
    const pixelOffset = (targetIndex * cardWidth) - containerCenter + cardCenter;
    
    requestAnimationFrame(() => {
        track.style.transition = 'transform 5s cubic-bezier(0.15, 0.85, 0.15, 1)';
        track.style.transform = `translateX(-${pixelOffset}px)`;
    });

    setTimeout(() => {
        const winner = generatedItems[targetIndex];
        openModal(winner);
    }, 5000);
});

function openModal(service) {
    modalImg.src = service.img;
    modalTitle.textContent = service.name;
    
    modalWindow.className = 'modal-window';
    actionStep.style.display = 'block';
    resultStep.style.display = 'none';
    modalOverlay.classList.add('active');
}

window.applyPunishment = function(type, reward) {
    actionStep.style.display = 'none';
    resultStep.style.display = 'block';
    modalWindow.classList.add('punished');
    
    statusText.textContent = type;
    salaryAmount.textContent = reward.toLocaleString('ru-RU') + ' ₽';

    const data = getStorageData();
    data.coins += reward;
    data.bannedServices.push({
        service: modalTitle.textContent,
        punishment: type,
        reward: reward,
        timestamp: Date.now()
    });
    setStorageData(data);
    
    if (data.bannedServices.length % 5 === 0) autoBackup();
};

window.takeMoney = function() {
    const btn = document.querySelector('.btn-take');
    btn.textContent = 'Зачисление на карту...';
    setTimeout(() => {
        location.reload();
    }, 800);
};

window.resetRoulette = function() {
    modalOverlay.classList.remove('active');
    isSpinning = false;
    spinBtn.disabled = false;
};

window.addEventListener('beforeunload', () => {
    const data = getStorageData();
    if (data.bannedServices.length > 0 && !data.lastBackup) {
        autoBackup();
    }
});