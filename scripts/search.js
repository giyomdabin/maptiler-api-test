import { renderSearchResults } from '../components/resultList.js';

const VWORLD_KEY = import.meta.env.VITE_VWORLD_API_KEY;

// 검색 API URL 생성
function createVWorldSearchUrl(query, searchType, addressCategory, page) {
    if (searchType === 'ADDRESS') {
        return `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&key=${VWORLD_KEY}&query=${encodeURIComponent(query)}&type=${searchType}&category=${addressCategory}&format=json&page=${page}`;
    }
    return `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&key=${VWORLD_KEY}&query=${encodeURIComponent(query)}&type=${searchType}&format=json&page=${page}`;
}

// 두 지점 간의 거리 계산 (Haversine formula)
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

// 모든 페이지의 검색 결과를 가져오는 함수
async function fetchAllSearchResults(query, searchType, category) {
    let allItems = [];
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
        const url = createVWorldSearchUrl(query, searchType, category, page);

        try {
            const result = await new Promise((resolve, reject) => {
                $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'jsonp', // JSONP 사용
                    success: resolve,
                    error: reject,
                });
            });

            if (result.response && result.response.status === 'OK') {
                const items = result.response.result.items || [];
                if (items.length > 0) {
                    allItems = allItems.concat(items);
                    page++;
                } else {
                    hasMoreData = false; // 더 이상 데이터가 없음
                }
            } else {
                console.error('[DEBUG] 검색 실패:', result.response.error?.text || '알 수 없는 오류');
                hasMoreData = false;
            }
        } catch (error) {
            console.error('[DEBUG] JSONP 요청 실패:', error);
            hasMoreData = false;
        }
    }

    return allItems;
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
            resultsContainer.style.display = 'none'; // 검색어 없을 때도 숨김
            return;
        }

        // 위치 권한 확인
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // 위치 권한 허용된 경우
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                    // 모든 검색 결과 가져오기
                    const allItems = await fetchAllSearchResults(query, type, category);

                    if (allItems.length === 0) {
                        alert('검색 결과가 없습니다.');
                        return;
                    }

                    // 검색 결과를 사용자 위치와의 거리 순으로 정렬
                    const sortedItems = allItems.map(item => {
                        const itemLat = parseFloat(item.point.y);
                        const itemLng = parseFloat(item.point.x);
                        const distance = calculateDistance(userLat, userLng, itemLat, itemLng);
                        return { ...item, distance };
                    }).sort((a, b) => a.distance - b.distance);

                    // 상위 10개 결과만 선택
                    const top10Items = sortedItems.slice(0, 10);

                    renderSearchResults(top10Items, map); // 정렬된 검색 결과 처리
                },
                (error) => {
                    console.warn('위치 권한 거부');

                    // 기존 방식으로 검색 결과 가져오기
                    const url = createVWorldSearchUrl(query, type, category, 1);
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

                                renderSearchResults(items, map); // 기존 검색 결과 처리
                            } else {
                                console.error('[DEBUG] 검색 실패:', result.response.error?.text || '알 수 없는 오류');
                            }
                        },
                        error: function (error) {
                            console.error('[DEBUG] JSONP 요청 실패:', error);
                        },
                    });
                }
            );
        } else {
            // Geolocation API를 지원하지 않는 경우
            alert('이 브라우저에서는 위치 정보를 사용할 수 없습니다. 기존 방식으로 검색 결과를 보여줍니다.');

            // 기존 방식으로 검색 결과 가져오기
            const url = createVWorldSearchUrl(query, type, category, 1);
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

                        renderSearchResults(items, map); // 기존 검색 결과 처리
                    } else {
                        console.error('[DEBUG] 검색 실패:', result.response.error?.text || '알 수 없는 오류');
                    }
                },
                error: function (error) {
                    console.error('[DEBUG] JSONP 요청 실패:', error);
                },
            });
        }
    });
}