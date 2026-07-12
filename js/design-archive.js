const FADE_DURATION = 200;

const grid = document.getElementById('masonryGrid');
const backdrop = document.getElementById('modalBackdrop');
const modal = document.getElementById('designModal');
const closeBtn = document.getElementById('modalCloseBtn');
const prevBtn = document.getElementById('modalPrevBtn');
const nextBtn = document.getElementById('modalNextBtn');
const imageWrap = document.getElementById('modalImageWrap');
const imgBase = document.getElementById('modalImgBase');
const imgFade = document.getElementById('modalFadeImg');
const imageCount = document.getElementById('modalImageCount');
const categoryEl = document.getElementById('modalCategory');
const titleEl = document.getElementById('modalTitle');
const descListEl = document.getElementById('modalDescList');

let selectedItem = null;
let activeImgIndex = 0;

// ===== 그리드 렌더링 =====
function renderGrid() {
    DESIGN_DATA.forEach((item) => {
        const cell = document.createElement('div');
        cell.className = 'grid-item';
        cell.tabIndex = 0;
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `${item.title} 자세히 보기`);

        cell.innerHTML = `
      <div class="grid-item-inner">
        <img src="${item.img[0]}" alt="${item.title}" loading="lazy" />
        <div class="grid-item-overlay">
          <span class="category">${item.category}</span>
          <p class="title">${item.title}</p>
        </div>
      </div>
    `;

        cell.addEventListener('click', () => openModal(item));
        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(item);
            }
        });

        grid.appendChild(cell);
    });
}

// ===== 모달 열기/닫기 =====
function openModal(item) {
    selectedItem = item;
    activeImgIndex = 0;

    categoryEl.textContent = item.category;
    titleEl.textContent = item.title;
    descListEl.innerHTML = item.desc.map((line) => `<li>${line}</li>`).join('');

    imgFade.hidden = true;
    imgBase.src = item.img[0];
    imgBase.alt = item.title;

    updateNavVisibility();
    updateImageCount();
    fitImageBox(item.img);

    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
}

function closeModal() {
    selectedItem = null;
    backdrop.hidden = true;
    document.body.style.overflow = '';
    imageWrap.style.width = '';
    imageWrap.style.height = '';
}

// ===== 이미지 최대 크기에 맞춰 모달 박스 사이즈 계산 (React의 useEffect 로직 그대로) =====
function fitImageBox(imgList) {
    let loadedCount = 0;
    let maxWidth = 0;
    let maxHeight = 0;
    const total = imgList.length;

    imgList.forEach((src) => {
        const preload = new Image();
        preload.onload = () => {
            const maxBoxWidth = 600;
            const maxBoxHeight = window.innerHeight * 0.7;

            let displayWidth = preload.naturalWidth;
            let displayHeight = preload.naturalHeight;

            const widthRatio = maxBoxWidth / displayWidth;
            const heightRatio = maxBoxHeight / displayHeight;
            const ratio = Math.min(widthRatio, heightRatio, 1);

            displayWidth *= ratio;
            displayHeight *= ratio;

            if (displayWidth > maxWidth) maxWidth = displayWidth;
            if (displayHeight > maxHeight) maxHeight = displayHeight;

            loadedCount++;
            if (loadedCount === total) {
                imageWrap.style.width = `${maxWidth}px`;
                imageWrap.style.height = `${maxHeight}px`;
            }
        };
        preload.src = src;
    });
}

// ===== 이미지 전환 (페이드) =====
function changeImage(newIndex) {
    if (!selectedItem || newIndex === activeImgIndex) return;

    const oldSrc = selectedItem.img[activeImgIndex];
    activeImgIndex = newIndex;

    imgBase.src = selectedItem.img[activeImgIndex];
    imgBase.alt = selectedItem.title;

    imgFade.src = oldSrc;
    imgFade.hidden = false;
    imgFade.classList.remove('fade-out');
    imgFade.style.transitionDuration = `${FADE_DURATION}ms`;

    // 다음 프레임에 fade-out 클래스를 붙여야 transition이 실제로 재생됨
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            imgFade.classList.add('fade-out');
        });
    });

    updateImageCount();
}

function handleFadeEnd() {
    imgFade.hidden = true;
    imgFade.classList.remove('fade-out');
}

function goPrev() {
    if (!selectedItem) return;
    const newIndex =
        activeImgIndex === 0 ? selectedItem.img.length - 1 : activeImgIndex - 1;
    changeImage(newIndex);
}

function goNext() {
    if (!selectedItem) return;
    const newIndex =
        activeImgIndex === selectedItem.img.length - 1 ? 0 : activeImgIndex + 1;
    changeImage(newIndex);
}

function updateNavVisibility() {
    const multiple = selectedItem.img.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
}

function updateImageCount() {
    if (selectedItem.img.length > 1) {
        imageCount.hidden = false;
        imageCount.textContent = `${activeImgIndex + 1} / ${selectedItem.img.length}`;
    } else {
        imageCount.hidden = true;
    }
}

// ===== 이벤트 바인딩 =====
closeBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
});
modal.addEventListener('click', (e) => e.stopPropagation());
prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);
imgFade.addEventListener('transitionend', handleFadeEnd);

document.addEventListener('keydown', (e) => {
    if (backdrop.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
});

renderGrid();