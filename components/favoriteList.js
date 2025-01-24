import { loadFavorites, removeFavorite } from '../scripts/favorite.js';

const favoriteListButton = document.getElementById('favorite-list'); // 버튼
const resultsContainer = document.getElementById('favorite-results'); // 즐겨찾기 결과 

function updateFavoritePosition() {
    const favoriteListButtonRect = favoriteListButton.getBoundingClientRect();

    // 기본 위치 설정 
    const topPosition = favoriteListButtonRect.bottom + 10; 
    const rightPosition = window.innerWidth - favoriteListButtonRect.right; 

    resultsContainer.style.top = `${topPosition}px`;
    resultsContainer.style.right = `${rightPosition}px`;

    // 뷰포트를 벗어나지 않도록 조정
    const containerRect = resultsContainer.getBoundingClientRect();
    if (containerRect.right > window.innerWidth) {
        resultsContainer.style.right = '10px'; // 오른쪽으로 10px 띄움
    }
    if (containerRect.bottom > window.innerHeight) {
        resultsContainer.style.maxHeight = `${window.innerHeight - topPosition - 20}px`; // 뷰포트 아래쪽 맞춤
    }

    resultsContainer.style.width = `${favoriteListButtonRect.width}px`;
}


// 즐겨찾기 목록 가져오는 함수
export function getFavoriteList() {
    favoriteListButton.addEventListener('click', () => {

        // 현재 상태 확인
        const isVisible = resultsContainer.style.display === 'block';

        if (isVisible) { // 리스트가 열려있으면 숨김
            resultsContainer.style.display = 'none';
            return;
        }

        const favorites = loadFavorites();

        // 데이터가 없으면 알림 표시
        if (Object.keys(favorites).length === 0) {
            alert('추가한 즐겨찾기가 없습니다!');
            return;
        }

        // 데이터가 있을 경우 -> 보여주기
        updateFavoritePosition();
        resultsContainer.style.display = 'block';

        // 즐겨찾기 항목 추가
        for (const [address, name] of Object.entries(favorites)) {
            // 중복된 항목 방지: 이미 리스트에 있는 경우 추가하지 않음
            if (resultsContainer.querySelector(`[data-address="${address}"]`)) {
                continue;
            }

            const favoriteItem = document.createElement('div');
            favoriteItem.setAttribute('data-address', address); // 중복 확인을 위한 데이터 속성 추가

            favoriteItem.className = 'result-item';
            favoriteItem.innerHTML = `
            <div class="result-content">
                <h4>${name}</h4>
                <span>${address}</span>
            </div>
            <img src="/assets/images/star-filled.svg" alt="즐겨찾기 아이콘" />`;

            // 즐겨찾기 제거
            favoriteItem.querySelector('img').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFavorite(address);
                favoriteItem.remove();

                // 리스트가 비었는지 확인
                if (resultsContainer.childElementCount === 0) {
                    resultsContainer.style.display = 'none'; // 리스트 숨기기
                }
            });

            resultsContainer.appendChild(favoriteItem);
        }

        console.log('즐겨찾기 목록:', favorites);

    });
}