// 검색 UI 초기화 함수
export function initializeSearchUI() {
    const searchType = document.getElementById('searchType');
    const addressCategory = document.getElementById('addressCategory');

    if (!searchType || !addressCategory) {
        console.error('검색 UI 요소가 제대로 연결되지 않았습니다.');
        return;
    }

    // 검색 유형 변경 시 UI 업데이트
    searchType.addEventListener('change', () => {
        if (searchType.value === 'ADDRESS') {
            addressCategory.style.display = 'block';
        } else {
            addressCategory.style.display = 'none';
        }
    });

    // 초기 상태 설정
    if (searchType.value === 'ADDRESS') {
        addressCategory.style.display = 'block';
    } else {
        addressCategory.style.display = 'none';
    }
}
