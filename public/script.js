let tickets = 100;
let collection = new Map();

// 更新抽卡券显示
function updateTickets() {
    document.getElementById('tickets').textContent = tickets;
}

// 抽卡函数
async function draw(count) {
    if (tickets < count) {
        alert('抽卡券不足！');
        return;
    }

    // 禁用按钮
    const buttons = document.querySelectorAll('.draw-btn');
    buttons.forEach(btn => btn.disabled = true);

    try {
        const response = await fetch('/api/draw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ count })
        });

        const data = await response.json();
        
        if (data.success) {
            tickets -= count;
            updateTickets();
            
            // 显示结果
            displayResults(data.results);
            
            // 添加到收藏
            data.results.forEach(card => {
                const key = card.id;
                const existing = collection.get(key) || { ...card, count: 0 };
                existing.count += 1;
                collection.set(key, existing);
            });
            
            updateCollection();
            
            // 显示模态框
            showModal(data.results);
        }
    } catch (error) {
        console.error('抽卡失败:', error);
        alert('抽卡失败，请重试！');
    } finally {
        // 重新启用按钮
        buttons.forEach(btn => btn.disabled = false);
    }
}

// 显示抽卡结果
function displayResults(results) {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';
    
    results.forEach((card, index) => {
        const cardElement = createCardElement(card);
        cardElement.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(cardElement);
    });
}

// 创建卡片元素
function createCardElement(card, showCount = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.rarity}`;
    
    cardDiv.innerHTML = `
        <div class="card-image">${card.image}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-rarity">${card.rarity}</div>
        ${showCount ? `<div style="margin-top: 10px; font-weight: bold; color: #667eea;">x${card.count}</div>` : ''}
    `;
    
    return cardDiv;
}

// 更新收藏展示
function updateCollection() {
    const container = document.getElementById('collection');
    
    if (collection.size === 0) {
        container.innerHTML = '<p class="no-collection">暂无收藏</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // 按稀有度排序
    const sorted = Array.from(collection.values()).sort((a, b) => {
        const rarityOrder = { 'SSR': 0, 'SR': 1, 'R': 2, 'N': 3 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
    
    sorted.forEach(card => {
        const cardElement = createCardElement(card, true);
        container.appendChild(cardElement);
    });
}

// 显示结果模态框
function showModal(results) {
    const modal = document.getElementById('resultModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = '';
    
    results.forEach((card, index) => {
        const cardElement = createCardElement(card);
        cardElement.style.animationDelay = `${index * 0.1}s`;
        modalBody.appendChild(cardElement);
    });
    
    modal.style.display = 'block';
    
    // 播放音效（如果有SSR）
    const hasSSR = results.some(card => card.rarity === 'SSR');
    if (hasSSR) {
        playSSREffect();
    }
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('resultModal');
    modal.style.display = 'none';
}

// SSR特效
function playSSREffect() {
    const modal = document.getElementById('resultModal');
    modal.style.animation = 'none';
    setTimeout(() => {
        modal.style.animation = 'fadeIn 0.3s ease, pulse 0.5s ease';
    }, 10);
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('resultModal');
    if (event.target === modal) {
        closeModal();
    }
}

// 初始化
updateTickets();
updateCollection();

// 添加脉冲动画
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);
