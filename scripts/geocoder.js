// 브이월드 지오코더 API 호출 함수
export function geocodeAddress(address, map, apiKey) {
    if (!address || typeof address !== 'string') {
        console.error('유효하지 않은 주소 입력입니다.');
        return;
    }

    if (!apiKey) {
        console.error('API 키가 설정되지 않았습니다.');
        return;
    }

    // 브이월드 지오코더 API URL
    const url = `https://api.vworld.kr/req/address?service=address&request=GetCoord&version=2.0&crs=EPSG:4326&type=ROAD&address=${encodeURIComponent(address)}&format=json&errorformat=json&key=${apiKey}`;

    // API 호출
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.response && data.response.status === 'OK') {
                const { x, y } = data.response.result.point; // 좌표 (경도 x, 위도 y)
                console.log(`Address: ${address}, Coordinates: [${x}, ${y}]`);

                // 지도 중심 이동
                if (map) {
                    map.flyTo({
                        center: [parseFloat(x), parseFloat(y)], // 경도, 위도
                        zoom: 17, // 확대 비율
                        essential: true,
                    });

                    // 마커 추가
                    new maplibregl.Marker()
                        .setLngLat([parseFloat(x), parseFloat(y)])
                        .setPopup(new maplibregl.Popup().setHTML(`<b>${address}</b>`)) // 팝업 표시
                        .addTo(map);
                }
            } else {
                console.error('지오코딩 실패:', data.response.message || '알 수 없는 오류');
            }
        })
        .catch(error => {
            console.error('지오코더 API 호출 중 오류 발생:', error);
        });
}
