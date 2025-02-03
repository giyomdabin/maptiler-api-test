import maplibregl from 'maplibre-gl';
import { renderWeatherWidget } from '../components/weatherInfo.js';

let previousCoords = null; // 이전 위치를 저장
let marker = null;

// 위치 정보를 가져오는 함수
export function getLocation(map) {
  const userLanguage = navigator.language || navigator.userLanguage;

  if ("geolocation" in navigator) {
    // Geolocation API 사용 가능
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log(`경도: ${lng}, 위도: ${lat}`);

       // 이전 좌표와 현재 좌표 비교
      if (previousCoords && previousCoords.lat === lat && previousCoords.lng === lng) {
        map.flyTo({
          center: [lng, lat],
          zoom: 15
        });
        return; // 위치가 동일하면 화면만 전환
      }
      
      previousCoords = { lat, lng }; 

      marker = new maplibregl.Marker({ color: 'red' })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup().setHTML(`
            <b>현재 위치</b><br>
            ${lat}<br>${lng}
          `)
        ).addTo(map);

      renderWeatherWidget();

      map.flyTo({
        center: [lng, lat],
        zoom: 15
      });
    });
  } else {
    alert("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
  }
}

// 위치 정보 가져오기 버튼 클릭 이벤트
document.querySelector("#find-me").addEventListener("click", () => {
  if (!window.mapInstance) {
    console.error("지도 객체가 초기화되지 않았습니다.");
    return;
  }
  getLocation(window.mapInstance); // map 객체 전달
});

export function resetPreviousCoords() {
  previousCoords = null;
}
