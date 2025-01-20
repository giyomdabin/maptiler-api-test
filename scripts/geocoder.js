import maplibregl from 'maplibre-gl';

let markers = []; // 지도에 표시된 마커를 저장하는 배열

// 브이월드 API URL 생성 함수
function createVWorldApiUrl(address, apiKey) {
    return `https://api.vworld.kr/req/address?service=address&request=GetCoord&version=2.0&crs=EPSG:4326&type=ROAD&address=${encodeURIComponent(
        address
    )}&format=json&key=${apiKey}`;
}

// 기존 마커 제거 함수
function clearMarkers() {
    markers.forEach(marker => marker.remove()); // 모든 마커 제거
    markers = []; // 배열 초기화
}

// 마커 추가 함수
function addMarkerToMap(map, x, y, address) {
    const marker = new maplibregl.Marker({ color: 'red' })
        .setLngLat([x, y])
        .setPopup(
            new maplibregl.Popup().setHTML(
                `<b>${address}</b><br>좌표: [${x}, ${y}]`
            )
        )
        .addTo(map);

    markers.push(marker); // 추가된 마커를 배열에 저장
}

// 주소를 지오코딩하여 지도에 마커를 추가하는 함수
export function geocodeAddress(address, map, apiKey) {
    if (!address || typeof address !== 'string') {
        console.error('유효하지 않은 주소 입력입니다.');
        return;
    }

    if (!apiKey) {
        console.error('API 키가 설정되지 않았습니다.');
        return;
    }

    console.log(`요청한 주소: ${address}`);

    // API 요청
    $.ajax({
        url: createVWorldApiUrl(address, apiKey), // API URL 생성
        type: 'GET',
        dataType: 'jsonp', // JSONP 방식
        success: function (result) {
            console.log('API 응답 데이터:', result);

            if (result.response && result.response.status === 'OK') {
                const { x, y } = result.response.result.point;
                console.log(`반환된 좌표: x=${x}, y=${y}`);

                if (map) {
                    // 기존 마커 제거
                    clearMarkers();

                    // 지도 이동
                    map.flyTo({
                        center: [parseFloat(x), parseFloat(y)],
                        zoom: 17,
                        essential: true,
                    });

                    // 새로운 마커 추가
                    addMarkerToMap(map, parseFloat(x), parseFloat(y), address);
                } else {
                    console.error('지도 객체가 유효하지 않습니다.');
                }
            } else {
                console.error('지오코딩 실패:', result.response.message || '알 수 없는 오류');
            }
        },
        error: function (error) {
            console.error('JSONP 요청 실패:', error);
        },
    });
}
