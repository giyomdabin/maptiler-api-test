import maplibregl from 'maplibre-gl';
import { renderWeatherWidget } from '../components/weatherInfo.js';

let previousCoords = null; // 이전 위치 저장
let marker = null;

// 위치 권한 상태 확인 함수
 
async function checkLocationPermission() {
  if (!navigator.permissions) {
    console.warn("`navigator.permissions`가 지원되지 않는 브라우저입니다.");
    return "prompt"; // 기본값
  }

  try {
    const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
    return permissionStatus.state; // "granted", "denied", "prompt"
  } catch (error) {
    console.error("위치 권한 확인 중 오류:", error);
    return "prompt";
  }
}

function showPermissionAlert() {
  alert("위치 접근이 차단되었습니다. 브라우저 설정에서 권한을 다시 허용해주세요.");
}

// 위치 정보를 가져오는 함수
export async function getLocation(map) {
  const permissionState = await checkLocationPermission();

  if (permissionState === "denied") {
    showPermissionAlert();
    return;
  }

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log(`현재 위치: 경도 ${lng}, 위도 ${lat}`);

        if (previousCoords && previousCoords.lat === lat && previousCoords.lng === lng) {
          map.flyTo({ center: [lng, lat], zoom: 15 });
          return;
        }

        previousCoords = { lat, lng };

        if (marker) marker.remove(); // 기존 마커 제거

        marker = new maplibregl.Marker({ color: 'red' })
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup().setHTML(`<b>현재 위치</b><br>${lat}, ${lng}`))
          .addTo(map);

        renderWeatherWidget();
        map.flyTo({ center: [lng, lat], zoom: 15 });
      },
      (error) => {

        if (error.code === error.PERMISSION_DENIED) {
          showPermissionAlert();
        } else {
          alert("위치 정보를 가져올 수 없습니다.");
        }
      }
    );
  } else {
    alert("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
  }
}

document.querySelector("#find-me").addEventListener("click", async () => {
  if (!window.mapInstance) {
    console.error("지도 객체가 초기화되지 않았습니다.");
    return;
  }

  getLocation(window.mapInstance);
});

// 이전 위치 초기화 함수
export function resetPreviousCoords() {
  previousCoords = null;
}
