import maplibregl from 'maplibre-gl';
import {resetPreviousCoords} from '../scripts/geolocation.js';
import { addFavorite, loadFavorites, removeFavorite } from '../scripts/favorite.js';

let markers = []; // 지도에 추가된 마커를 관리하는 배열

const searchType = document.getElementById('searchType');
const addressCategory = document.getElementById('addressCategory');
const resultsContainer = document.getElementById('search-results'); // 검색 결과
const openResultsButton = document.getElementById('open-results');
const closeResultsButton = document.getElementById('close-results');
const searchContainer = document.getElementById('searchContainer');

// 초기 상태 설정
if (searchType.value === 'ADDRESS') {
    addressCategory.style.display = 'block';
} else {
    addressCategory.style.display = 'none';
}

export function initializeSearchUI() {
    searchType.addEventListener('change', () => {
        // 검색창 타입 변경 시 주소 선택 옵션 표시/숨김
        searchType.value === 'ADDRESS' ? addressCategory.style.display = 'block' : addressCategory.style.display = 'none'; 
        updatePosition(); 
    });
    updatePosition();
}

// 검색 결과 렌더링 및 지도 마커 추가
export function renderSearchResults(items, map) {

    resultsContainer.innerHTML = ''; // 기존 리스트 초기화
    clearMarkers(); // 기존 마커 제거

    if (items.length === 0) {
        resultsContainer.style.display = 'none'; // 결과가 없으면 숨김
        openResultsButton.style.display = 'none';
        alert('검색 결과가 없습니다.');
        return;
    }

    // 검색 결과가 있으면 보이도록 설정
    resultsContainer.style.display = 'block';
    resultsContainer.appendChild(closeResultsButton);

    // 로컬 스토리지에서 즐겨찾기 데이터 가져오기
    const favorites = loadFavorites();

    items.forEach(item => {
        const { x, y } = item.point; // 좌표
        const name = item.title || '제목 없음';
        const address = item.address.road || '주소 정보 없음';
        
        console.log(parseFloat(x), parseFloat(y));

         // 즐겨찾기 상태 확인
         const isFavorite = favorites[address] === name;

        // 리스트 항목 생성
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="result-content">
                <h4>${name}</h4>
                <span>${address}</span>
            </div>
            <img src="/assets/images/${isFavorite ? 'star-filled' : 'star-empty'}.svg" alt="즐겨찾기 아이콘" />`;

        resultsContainer.appendChild(resultItem);

        // 지도에 마커 추가
        const marker = new maplibregl.Marker({ color: 'blue' })
            .setLngLat([parseFloat(x), parseFloat(y)])
            .setPopup(
                new maplibregl.Popup().setHTML(`<b>${name}</b><br>${address}`)).addTo(map);

        markers.push(marker); // 추가된 마커를 배열에 저장

        // 리스트 항목 클릭 시 지도 이동
        resultItem.addEventListener('click', () => {
            map.flyTo({
                center: [parseFloat(x), parseFloat(y)],
                zoom: 15,
            });
        });

        // 즐겨찾기 버튼을 눌렀을 때
        resultItem.querySelector('img').addEventListener('click', (e) => {
            e.stopPropagation(); // 부모 클릭 이벤트 방지
            const icon = e.target; 
            const isFavorite = icon.src.includes('star-filled');

            if (isFavorite) {
                icon.src = '/assets/images/star-empty.svg';
                removeFavorite(address);
            } else {
                icon.src = '/assets/images/star-filled.svg';
                addFavorite(name, address);
            }
        });
    });

    // 첫 번째 결과로 지도 이동
    if (items.length > 0) {
        const firstPoint = items[0].point;
        map.flyTo({
            center: [parseFloat(firstPoint.x), parseFloat(firstPoint.y)],
            zoom: 15,
        });

        resetPreviousCoords(); // 이전 좌표 초기화
    }
}

// 검색창 아래로 정렬
function updatePosition() {
    const searchContainerRect = searchContainer.getBoundingClientRect();
    resultsContainer.style.top = `${searchContainerRect.bottom + 10}px`;
    resultsContainer.style.left = `${searchContainerRect.left}px`;
    resultsContainer.style.width = `${searchContainerRect.width}px`;

    openResultsButton.style.top = `${searchContainerRect.bottom + 10}px`;
    openResultsButton.style.left = `${searchContainerRect.left}px`;
}

// 기존 마커 제거 함수
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers.length = 0;
}

// 열기 버튼 클릭 이벤트
openResultsButton.addEventListener('click', () => {
    resultsContainer.style.display = 'block'; // 결과 표시
    openResultsButton.style.display = 'none'; // 열기 버튼 숨김
});

closeResultsButton.addEventListener('click', () => {
    openResultsButton.style.display = 'block'; // 결과 표시
    resultsContainer.style.display = 'none'; // 열기 버튼 숨김
});
