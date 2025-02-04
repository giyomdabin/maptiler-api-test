import { renderSearchResults } from '../components/resultList.js';

const VWORLD_KEY = import.meta.env.VITE_VWORLD_API_KEY;

// 위치 권한 거부 / Geolocation API를 지원하지 않는 경우
function  basicSearch(query, searchType, addressCategory) {
    let url;
    if (searchType === 'ADDRESS') {
        url = `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&key=${VWORLD_KEY}&query=${encodeURIComponent(query)}&type=${searchType}&category=${addressCategory}&format=json&page=1`;
    }
    url = `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&key=${VWORLD_KEY}&query=${encodeURIComponent(query)}&type=${searchType}&format=json&page=1`;

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
        success: function (result) {
            if (result.response && result.response.status === 'OK') {
                const items = result.response.result.items || [];
                if (items.length === 0) {
                    alert('검색 결과가 없습니다.');
                    return;
                }
                renderSearchResults(items, map); 
                console.error('[DEBUG] 검색 실패:', result.response.error?.text || '알 수 없는 오류');
            }
        },
        error: function (error) {
            console.error('[DEBUG] JSONP 요청 실패:', error);
        },
    });
}

// 위치 권한 허용한 경우
function createVWorldSearchUrlWithBoundingBox(query, searchType, addressCategory, userLat, userLng, rangeKm = 1) {
    // 반경을 기준으로 BBOX 좌표 계산
    const delta = rangeKm / 111; 
    const minLat = userLat - delta;
    const maxLat = userLat + delta;
    const minLng = userLng - delta;
    const maxLng = userLng + delta;

    if (searchType === 'ADDRESS') {
        return `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&key=${VWORLD_KEY}&query=${encodeURIComponent(query)}
        &type=${searchType}&category=${addressCategory}&format=json&page=1
        &bbox=${minLng},${minLat},${maxLng},${maxLat}`;
    }
    return  `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&key=${VWORLD_KEY}&query=${encodeURIComponent(query)}
    &type=${searchType}&format=json&page=1&bbox=${minLng},${minLat},${maxLng},${maxLat}`;
}

// 두 지점 간의 거리 계산
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // 거리를 미터로 변환
    return distance;
}

// 검색 기능 설정
export function setupSearch(map) {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchType = document.getElementById('searchType');
    const addressCategory = document.getElementsByName('addressCategory');
    const resultsContainer = document.getElementById('search-results');

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        const type = searchType.value;
        const category = [...addressCategory].find(radio => radio.checked)?.value;

        if (!query) {
            alert('검색어를 입력하세요!');
            resultsContainer.style.display = 'none'; 
            return;
        }

        // 위치 권한 확인
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // 위치 권한 허용된 경우 -> 사용자 위치 기준으로 검색
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                     // 가까운 검색 결과만 요청 (BBOX 적용)
                     const url = createVWorldSearchUrlWithBoundingBox(query, type, category, userLat, userLng);
 
                     $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'jsonp',
                        success: function (result) {
                            if (result.response && result.response.status === 'OK') {
                                let items = result.response.result.items || [];

                                if (items.length === 0) {
                                    alert('검색 결과가 없습니다.');
                                    return;
                                }

                                // 거리순 정렬 (최대 10개만 선택)
                                const sortedItems = items.map(item => {
                                    const itemLat = parseFloat(item.point.y);
                                    const itemLng = parseFloat(item.point.x);
                                    const distance = calculateDistance(userLat, userLng, itemLat, itemLng);
                                    return { ...item, distance };
                                }).sort((a, b) => a.distance - b.distance).slice(0, 10);

                                renderSearchResults(sortedItems, map);
                            } else {
                                console.error('[DEBUG] 검색 실패:', result.response.error?.text || '알 수 없는 오류');
                            }
                        },
                        error: function (error) {
                            console.error('[DEBUG] JSONP 요청 실패:', error);
                        }
                    });
                },
                (error) => {
                    console.warn('위치 권한 거부');
                    basicSearch(query, type, category);
                }
            );
        } else {
            alert('이 브라우저에서는 위치 정보를 사용할 수 없습니다..');
            basicSearch(query, type, category);
        }
    });
}