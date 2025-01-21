export function initializeSearchUI() {
    const searchType = document.getElementById('searchType');
    const addressCategory = document.getElementById('addressCategory');
    const searchContainer = document.getElementById('searchContainer');
    const resultsContainer = document.getElementById('search-results');
    const openResultsButton = document.getElementById('open-results');

    if (!searchType || !addressCategory || !resultsContainer || !searchContainer || !openResultsButton) {
        console.error('UI 요소를 찾을 수 없습니다.');
        return;
    }

    // 검색창 타입 변경 시 주소 선택 옵션 표시/숨김
    searchType.addEventListener('change', () => {
        if (searchType.value === 'ADDRESS') {
            addressCategory.style.display = 'block'; // 주소 타입 선택 보이기
        } else {
            addressCategory.style.display = 'none'; // 주소 타입 선택 숨기기
        }

        // 검색 결과 및 열기 버튼 위치 조정
        updatePosition();
    });

    // 초기 상태에서도 위치 조정
    updatePosition();

    // 위치 업데이트 함수: 검색창 아래로 정렬
    function updatePosition() {
        const searchContainerRect = searchContainer.getBoundingClientRect();
        resultsContainer.style.top = `${searchContainerRect.bottom + 10}px`;
        resultsContainer.style.left = `${searchContainerRect.left}px`;
        resultsContainer.style.width = `${searchContainerRect.width}px`;

        openResultsButton.style.top = `${searchContainerRect.bottom + 10}px`;
        openResultsButton.style.left = `${searchContainerRect.left}px`;
    }

    // 열기 버튼 클릭 이벤트
    openResultsButton.addEventListener('click', () => {
        resultsContainer.style.display = 'block'; // 결과 표시
        openResultsButton.style.display = 'none'; // 열기 버튼 숨김
    });

    // 초기 상태 설정
    if (searchType.value === 'ADDRESS') {
        addressCategory.style.display = 'block';
    } else {
        addressCategory.style.display = 'none';
    }
}
