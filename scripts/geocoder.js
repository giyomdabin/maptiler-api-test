import maplibregl from 'maplibre-gl';

export function geocodeAddress(address, map, apiKey) {
    if (!address || typeof address !== 'string') {
        console.error('유효하지 않은 주소 입력입니다.');
        return;
    }

    if (!apiKey) {
        console.error('API 키가 설정되지 않았습니다.');
        return;
    }

    console.log(`[DEBUG] 요청한 주소: ${address}`);

    // 브이월드 API URL 설정
    const url = "https://api.vworld.kr/req/address";

    // JSONP 요청
    $.ajax({
        url: url,
        type: "GET",
        dataType: "jsonp", // JSONP 방식
        data: {
            service: "address",
            request: "GetCoord",
            version: "2.0",
            crs: "EPSG:4326",
            type: "ROAD",
            address: address, // 주소 입력
            format: "json",
            key: apiKey // 브이월드 API 키
        },
        success: function (result) {
            console.log('[DEBUG] API 응답 데이터:', result); // 응답 데이터 확인

            if (result.response && result.response.status === 'OK') {
                const { x, y } = result.response.result.point;
                console.log(`[DEBUG] 반환된 좌표: x=${x}, y=${y}`);

                // 지도 이동
                if (map) {
                    map.flyTo({
                        center: [parseFloat(x), parseFloat(y)], // 경도, 위도
                        zoom: 17,
                        essential: true,
                    });

                    // 마커 추가
                    new maplibregl.Marker({ color: 'red' }) // 마커 색상
                        .setLngLat([parseFloat(x), parseFloat(y)]) // 마커 좌표
                        .setPopup(
                            new maplibregl.Popup().setHTML(
                                `<b>${address}</b><br>좌표: [${x}, ${y}]`
                            )
                        )
                        .addTo(map);
                    console.log('[DEBUG] 마커 추가 완료');
                } else {
                    console.error('[DEBUG] 지도 객체가 유효하지 않습니다.');
                }
            } else {
                console.error('[DEBUG] 지오코딩 실패:', result.response.message || '알 수 없는 오류');
            }
        },
        error: function (error) {
            console.error('[DEBUG] JSONP 요청 실패:', error);
        }
    });
}
