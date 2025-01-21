import maplibregl from 'maplibre-gl';

let marker = null;
let previousCoords = null; // 이전 위치를 저장

// 위치 정보를 가져오는 함수
export function getLocation(map) {

  if ("geolocation" in navigator) {
    // Geolocation API 사용 가능
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log(`경도: ${lng}, 위도: ${lat}`);

       // 이전 좌표와 현재 좌표 비교
       if (previousCoords && previousCoords.lat === lat && previousCoords.lng === lng) {
        alert("위치가 변경되지 않았습니다.");
        return; // 위치가 동일하면 아무 작업도 하지 않음
      }
      
      previousCoords = { lat, lng };

      const marker = new maplibregl.Marker({ color: 'red' })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup().setHTML(`
            <b>현재 위치</b>
            ${lat}<br>${lng}
          `)
        ).addTo(map);

      map.flyTo({
        center: [parseFloat(lng), parseFloat(lat)],
        zoom: 15
      });
    });
  } else {
    alert("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
  }
}

// 위치 정보 가져오기 버튼 클릭 이벤트
document.querySelector("#find-me").addEventListener("click", getLocation);
