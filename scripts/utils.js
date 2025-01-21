let markers = []; // 지도에 추가된 마커들을 저장하는 배열

/**
 * HTML 요소의 ID를 검증하는 함수
 * @param {string} containerId - HTML 요소의 ID
 * @throws {Error} 요소가 존재하지 않을 경우 예외를 발생시킴
 */
export function validateContainerId(containerId) {
    const element = document.getElementById(containerId);
    if (!element) {
        throw new Error(`ID가 '${containerId}'인 요소를 찾을 수 없습니다.`);
    }
}
// 좌표 문자열을 숫자 배열로 변환하는 함수
export function parseCoordinates(x, y) {
    return [parseFloat(x), parseFloat(y)];
}

// 검색 결과 아이템 데이터 유효성을 검사하는 함수
export function isValidSearchItem(item) {
    return item && item.point && item.point.x && item.point.y && item.title;
}

// 지도 중심을 이동하는 함수
export function flyToLocation(map, x, y, zoom = 15) {
    map.flyTo({
        center: parseCoordinates(x, y),
        zoom: zoom,
        essential: true,
    });
}
