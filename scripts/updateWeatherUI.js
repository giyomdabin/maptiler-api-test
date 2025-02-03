export function updateWeatherUI(weatherData) {
    const weatherWidget = document.getElementById("weather-content");
  
    if (!weatherWidget) return;
  
    let weatherInfo = '날씨 정보를 불러오는 중...';
  
    if (weatherData) {
      const items = weatherData.response?.body?.items?.item;
      const temperatureItem = items?.find(item => item.category === 'T1H');
      const skyItem = items?.find(item => item.category === 'SKY');
      const ptyItem = items?.find(item => item.category === 'PTY');
  
      const temperature = temperatureItem ? `${temperatureItem.fcstValue}℃` : '정보 없음';
      let weatherStatus = '정보 없음';
  
      if (skyItem && ptyItem) {
        const skyValue = parseInt(skyItem.fcstValue);
        const ptyValue = parseInt(ptyItem.fcstValue);
  
        if (ptyValue !== 0) {
          weatherStatus = {
            1: '비',
            2: '비/눈',
            3: '눈',
            4: '소나기'
          }[ptyValue] || '기타 강수';
        } else {
          weatherStatus = {
            1: '맑음',
            3: '구름 많음',
            4: '흐림'
          }[skyValue] || '알 수 없음';
        }
      }
  
      weatherInfo = `
        🌡 기온: ${temperature}<br>
        ☁ 날씨: ${weatherStatus}
      `;
    } else {
      weatherInfo = "날씨 정보를 불러오지 못했습니다.";
    }
  
    weatherWidget.innerHTML = weatherInfo;
  }
  