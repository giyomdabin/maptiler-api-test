import { getWeather } from '../utils/weather.js';

export function renderWeatherWidget() {
  const weatherContainer = document.getElementById("weather-container");
  if (!weatherContainer) {
    console.error("`#weather-container` 요소를 찾을 수 없음!");
    return;
  }

  weatherContainer.innerHTML = `<div id="weather-widget"> 날씨 정보를 불러오는 중...</div>`;

 // 기본 위치
  const defaultLocation = { latitude: 37.5665, longitude: 126.9780 };

  async function updateWeather(latitude, longitude) {
    console.log(`날씨 요청 위치: 경도 ${longitude}, 위도 ${latitude}`);

    const weatherData = await getWeather(latitude, longitude);

    let weatherInfo = "날씨 정보를 불러올 수 없습니다.";

    if (weatherData) {
      const items = weatherData.response?.body?.items?.item || [];
      const temperatureItem = items.find(item => item.category === 'TMP');
      const skyItem = items.find(item => item.category === 'SKY');

      const temperature = temperatureItem ? `${temperatureItem.fcstValue}℃` : '정보 없음';
      const sky = skyItem ? {
        1: '맑음',
        3: '구름 많음',
        4: '흐림'
      }[skyItem.fcstValue] || '알 수 없음' : '정보 없음';

      weatherInfo = `🌡 기온: ${temperature} <br> ☁ 날씨: ${sky}`;
    }

    document.getElementById("weather-widget").innerHTML = weatherInfo;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      updateWeather(latitude, longitude); // 사용자의 현재 위치로 날씨 정보 가져오기
    },
    (error) => {
      updateWeather(defaultLocation.latitude, defaultLocation.longitude); // 기본 위치로 날씨 정보 가져오기
    }
  );

  // 5분마다 자동 갱신
  setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        updateWeather(defaultLocation.latitude, defaultLocation.longitude);
      }
    );
  }, 300000);
}
