import maplibregl from 'maplibre-gl';

let markers = []; // 지도에 추가된 마커를 관리하는 배열

// 기존 마커 제거 함수
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers.length = 0;
}

// 검색 결과 렌더링 및 지도 마커 추가
export function renderSearchResults(items, map) {
    const resultsContainer = document.getElementById('search-results');

    if (!resultsContainer) {
        console.error('검색 결과 컨테이너를 찾을 수 없습니다.');
        return;
    }

    resultsContainer.innerHTML = ''; // 기존 리스트 초기화
    clearMarkers(); // 기존 마커 제거

    if (items.length === 0) {
        resultsContainer.style.display = 'none'; // 결과가 없으면 숨김
        alert('검색 결과가 없습니다.');
        return;
    }

    // 검색 결과가 있으면 보이도록 설정
    resultsContainer.style.display = 'block';

    items.forEach(item => {
        const { x, y } = item.point; // 좌표
        const name = item.title || '제목 없음';
        const address = item.address.road || '주소 정보 없음';

        // 리스트 항목 생성
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <h4>${name}</h4>
            <p>${address}</p>
        `;

        // 리스트 항목 클릭 시 지도 이동
        resultItem.addEventListener('click', () => {
            map.flyTo({
                center: [parseFloat(x), parseFloat(y)],
                zoom: 15,
            });
        });

        resultsContainer.appendChild(resultItem);

        // 지도에 마커 추가
        const marker = new maplibregl.Marker({ color: 'blue' })
            .setLngLat([parseFloat(x), parseFloat(y)])
            .setPopup(
                new maplibregl.Popup().setHTML(`
                    <b>${name}</b><br>${address}
                `)
            )
            .addTo(map);

        markers.push(marker); // 추가된 마커를 배열에 저장
    });

    // 첫 번째 결과로 지도 이동
    if (items.length > 0) {
        const firstPoint = items[0].point;
        map.flyTo({
            center: [parseFloat(firstPoint.x), parseFloat(firstPoint.y)],
            zoom: 15,
        });
    }
}
