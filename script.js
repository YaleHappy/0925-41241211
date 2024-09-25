const cardContainer = document.getElementById('card-container');
const themeSelector = document.getElementById('theme-selector');
let selectedTheme = 'anime'; // 默認主題為動漫主題
let firstCard, secondCard; // 用於比較的兩張卡片
let lockBoard = false; // 防止在比對期間翻更多卡片

// 聲音檔案
const matchSound = document.getElementById('match-sound');
const failSound = document.getElementById('fail-sound');

// 動漫主題的圖片
const animeImages = {
    front: 'anime_image/img1.jpg', // 正面圖片
    back: [
        'anime_image/img2.jpg', 'anime_image/img3.jpg', 'anime_image/img4.jpg', 'anime_image/img5.jpg',
        'anime_image/img6.jpg', 'anime_image/img7.jpg', 'anime_image/img8.jpg', 'anime_image/img9.jpg'
    ]
};

// 工具主題的圖片
const toolsImages = {
    front: 'tools/tools1.jpg', // 正面圖片
    back: [
        'tools/tools2.jpg', 'tools/tools3.jpg', 'tools/tools4.jpg', 'tools/tools5.jpg',
        'tools/tools6.jpg', 'tools/tools7.jpg', 'tools/tools8.jpg', 'tools/tools9.jpg'
    ]
};

// 生成一個包含兩次背面圖片的陣列，根據所選主題動態更新
let allBackImages = [];

// Fisher-Yates 洗牌算法，將陣列順序打亂
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 交換位置
    }
    return array;
}

// 根據主題生成卡片
function generateCards() {
    // 根據選擇的主題更新圖片
    let frontImage;
    let backImages;
    if (selectedTheme === 'anime') {
        frontImage = animeImages.front;
        backImages = animeImages.back;
    } else if (selectedTheme === 'tools') {
        frontImage = toolsImages.front;
        backImages = toolsImages.back;
    }

    allBackImages = []; // 清空背面圖片陣列
    backImages.forEach(image => {
        allBackImages.push(image); // 第一次加入
        allBackImages.push(image); // 第二次加入
    });
    allBackImages = shuffle(allBackImages); // 隨機排列背面圖片

    // 清空現有卡片
    cardContainer.innerHTML = '';

    // 動態生成卡片
    for (let i = 0; i < 16; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-back', allBackImages[i]); // 將背面圖片儲存為屬性
        card.innerHTML = `
            <div class="card-face card-front">
                <img src="${frontImage}" alt="卡牌正面">
            </div>
            <div class="card-face card-back">
                <img src="${allBackImages[i]}" alt="卡牌背面">
            </div>
        `;
        // 為卡片添加翻轉事件
        card.addEventListener('click', flipCard);
        cardContainer.appendChild(card);
    }
}

// 顯示卡片容器
function showCardContainer() {
    cardContainer.style.display = 'grid'; // 顯示卡片容器
}

// 翻轉卡片邏輯
function flipCard() {
    if (lockBoard || this === firstCard) return; // 如果正在比較或點擊同一張卡片，則不執行
    this.classList.add('flipped');

    if (!firstCard) {
        // 如果沒有翻第一張卡片
        firstCard = this;
    } else {
        // 如果已經翻了第一張卡片，現在翻第二張
        secondCard = this;
        lockBoard = true;

        // 檢查是否匹配
        checkForMatch();
    }
}

// 檢查兩張卡片是否匹配
function checkForMatch() {
    let isMatch = firstCard.getAttribute('data-back') === secondCard.getAttribute('data-back');
    
    if (isMatch) {
        disableCards(); // 禁用卡片點擊
        playSound('match');
    } else {
        unflipCards(); // 如果不匹配，將卡片翻回去
        playSound('fail');
    }
}

// 播放聲音
function playSound(type) {
    if (type === 'match') {
        matchSound.play();
    } else if (type === 'fail') {
        failSound.play();
    }
}

// 匹配後禁用卡片
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

// 卡片不匹配時翻回去
function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// 重置卡片狀態
function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// 依次翻轉卡片
function flipCards(action, delay = 200) {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            if (action === 'show-back') {
                card.classList.add('flipped'); // 顯示背面
            } else if (action === 'show-front') {
                card.classList.remove('flipped'); // 顯示正面
            }
        }, index * delay); // 設置每張卡片的延遲時間
    });
}

// 當選擇主題時重新生成卡片
themeSelector.addEventListener('change', function () {
    selectedTheme = themeSelector.value; // 更新選擇的主題
    generateCards(); // 根據選擇主題生成卡片
});

// 按鈕功能 - 開始遊戲
document.getElementById('start-game').addEventListener('click', function () {
    generateCards(); // 重新生成卡片，並隨機打亂背面圖片
    showCardContainer(); // 顯示卡片容器
    flipCards('show-back', 200); // 依次翻轉顯示背面

    // 10 秒後翻回正面
    setTimeout(() => {
        flipCards('show-front', 200); // 依次翻回正面
    }, 10000); // 延遲 10 秒後翻回
});

// 顯示正面按鈕
document.getElementById('show-front').addEventListener('click', function () {
    flipCards('show-front', 200); // 依次翻回正面
});

// 顯示背面按鈕
document.getElementById('show-back').addEventListener('click', function () {
    flipCards('show-back', 200); // 依次翻轉顯示背面
});

// 初次加載時生成動漫主題的卡片
window.onload = function () {
    generateCards(); // 生成卡片，但初始不顯示
};
