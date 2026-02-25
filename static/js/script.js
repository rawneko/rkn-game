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

const cardWidth = 150;
const track = document.getElementById('track');
const spinBtn = document.getElementById('spinBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalWindow = document.getElementById('modalWindow');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const actionStep = document.getElementById('actionStep');
const resultStep = document.getElementById('resultStep');
const statusText = document.getElementById('statusText');
const salaryAmount = document.getElementById('salaryAmount');

let isSpinning = false;
let generatedItems = [];

function getBalance() {
    const balance = localStorage.getItem('rkn_balance');
    return balance ? parseInt(balance) : 0;
}

function setBalance(amount) {
    localStorage.setItem('rkn_balance', amount);
    updateBalanceDisplay();
}

function addBalance(amount) {
    const current = getBalance();
    setBalance(current + amount);
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById('totalBalance');
    if (balanceElement) {
        balanceElement.textContent = getBalance().toLocaleString('ru-RU') + ' ₽';
    }
}

function exportDB() {
    const data = {
        balance: getBalance(),
        timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rkn_data.rknbd';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

function importDB() {
    importFile.click();
}

importFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (typeof data.balance === 'number') {
                setBalance(data.balance);
                alert('Данные успешно импортированы!');
            } else {
                alert('Неверный формат файла');
            }
        } catch (err) {
            alert('Ошибка при импорте: ' + err.message);
        }
    };
    reader.readAsText(file);
});

function initRoulette() {
    let html = '';
    generatedItems = [];
    const totalItems = 100;

    for(let i=0; i<totalItems; i++) {
        const randomService = servicesData[Math.floor(Math.random() * servicesData.length)];
        generatedItems.push(randomService);

        html += `
            <div class="service-card" style="width: 140px;">
                <img src="${randomService.img}" class="service-img" alt="${randomService.name}">
                <div>${randomService.name}</div>
            </div>
        `;
    }
    track.innerHTML = html;
}

initRoulette();

spinBtn.addEventListener('click', () => {
    if(isSpinning) return;
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

    const winner = generatedItems[targetIndex];

    setTimeout(() => {
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

window.applyPunishment = function(type) {
    actionStep.style.display = 'none';
    resultStep.style.display = 'block';
    modalWindow.classList.add('punished');
    
    statusText.textContent = type;

    const salary = Math.floor(Math.random() * (100 - 10 + 1) + 10) * 1000;
    salaryAmount.textContent = salary.toLocaleString('ru-RU') + ' ₽';
    
    addBalance(salary);
};

window.takeMoney = function() {
    const btn = document.querySelector('.btn-take');
    btn.textContent = 'Зачисление на карту...';
    setTimeout(() => {
        btn.textContent = 'Деньги зачислены!';
        setTimeout(() => {
            modalOverlay.classList.remove('active');
            isSpinning = false;
            spinBtn.disabled = false;
        }, 1000);
    }, 800);
};

window.resetRoulette = function() {
    modalOverlay.classList.remove('active');
    isSpinning = false;
    spinBtn.disabled = false;
};

exportBtn.addEventListener('click', exportDB);
importBtn.addEventListener('click', importDB);

document.addEventListener('DOMContentLoaded', function() {
    updateBalanceDisplay();
});