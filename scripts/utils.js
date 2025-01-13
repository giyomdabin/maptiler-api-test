/**
 * 컨테이너 ID의 유효성을 검증하는 함수
 * @param {string} containerId - HTML 컨테이너 ID
 */
export function validateContainerId(containerId) {
    if (typeof containerId !== 'string' || !containerId.trim()) {
        throw new Error('유효하지 않은 컨테이너 ID입니다. 문자열이어야 하며, 비어 있을 수 없습니다.');
    }
}