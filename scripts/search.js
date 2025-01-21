import { renderSearchResults } from '../components/resultList.js';

const VWORLD_KEY = import.meta.env.VITE_VWORLD_API_KEY;

// 검색 API URL 생성
function createVWorldSearchUrl(query, searchType, addressCategory) {
    if (searchType === 'ADDRESS') {
        return `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&key=${VWORLD_KEY}&query=${encodeURIComponent(query)}&type=${searchType}&category=${addressCategory}&format=json`;
    }
    return `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&key=${VWORLD_KEY}&query=${encodeURIComponent(query)}&type=${searchType}&format=json`;
}

// 검색 기능 설정
export function setupSearch(map) {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchType = document.getElementById('searchType');
    const addressCategory = document.getElementsByName('addressCategory');
    const resultsContainer = document.getElementById('search-results');

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        const type = searchType.value;
        const category = [...addressCategory].find(radio => radio.checked)?.value;

        console.log(`[DEBUG] ${category}`);

        if (!query) {
            alert('검색어를 입력하세요!');
            resultsContainer.style.display = 'none'; // 검색어 없을 때도 숨김
            return;
        }

        const url = createVWorldSearchUrl(query, type, category);

        // $.ajax를 사용하여 API 호출
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'jsonp',
            success: function (result) {
                console.log('[DEBUG] API 응답 데이터:', result);

                if (result.response && result.response.status === 'OK') {
                    const items = result.response.result.items || [];
                    if (items.length === 0) {
                        alert('검색 결과가 없습니다.');
                        return;
                    }

                    renderSearchResults(items, map); // 검색 결과 처리
                } else {
                    console.error('[DEBUG] 검색 실패:', result.response.error?.text || '알 수 없는 오류');
                }
            },
            error: function (error) {
                console.error('[DEBUG] JSONP 요청 실패:', error);
            },
        });
    });
}