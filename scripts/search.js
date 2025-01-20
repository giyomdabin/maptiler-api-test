import maplibregl from 'maplibre-gl';

// 마커를 저장하는 전역 배열
let markers = [];

// 검색 API URL 생성 함수
function createVWorldSearchUrl(query, apiKey, searchType) {
    if (!query || !apiKey || !searchType) {
        throw new Error('URL 생성에 필요한 매개변수가 부족합니다.');
    }
    return `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&key=${apiKey}&query=${encodeURIComponent(
        query
    )}&type=${searchType}&format=json`;
}

// 기존 마커 제거 함수
function clearMarkers() {
    if (!Array.isArray(markers)) {
        console.warn('마커 배열이 유효하지 않습니다.');
        return;
    }
    markers.forEach(marker => marker.remove());
    markers.length = 0;
}

// 검색 API 호출 및 지도에 결과 표시
export function searchPlaces(query, map, apiKey, searchType) {
    if (!query || typeof query !== 'string') {
        console.error('유효하지 않은 검색어입니다.');
        return;
    }
    if (!apiKey) {
        console.error('API 키가 설정되지 않았습니다.');
        return;
    }
    if (!map) {
        console.error('지도 객체가 유효하지 않습니다.');
        return;
    }

    console.log(`[DEBUG] 요청한 검색어: ${query}`);
    console.log(`[DEBUG] 검색 유형: ${searchType}`);

    $.ajax({
        url: createVWorldSearchUrl(query, apiKey, searchType),
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

                // 기존 마커 제거
                clearMarkers();

                // 검색 결과 지도에 마커 추가
                items.forEach(item => {
                    const { x, y } = item.point;
                    const name = item.title || item.address;
                    
                    const marker = new maplibregl.Marker({ color: 'blue' })
                        .setLngLat([parseFloat(x), parseFloat(y)])
                        .setPopup(new maplibregl.Popup().setHTML(`<b>${name}</b><br>${item.address}`))
                        .addTo(map);

                    markers.push(marker); // 마커 저장
                });

                // 첫 번째 검색 결과로 지도 이동
                const firstPoint = items[0].point;
                map.flyTo({
                    center: [parseFloat(firstPoint.x), parseFloat(firstPoint.y)],
                    zoom: 15,
                    essential: true,
                });
            } else {
                console.error('[DEBUG] 검색 실패:', result.response.error?.text || '알 수 없는 오류');
            }
        },
        error: function (error) {
            console.error('[DEBUG] JSONP 요청 실패:', error);
        },
    });
}
