import { convertLatLngToGrid } from './coordinateConverter.js';

function getLatestBaseTime() {
    const now = new Date();
    const hours = now.getHours();
    
    // 기상청 API 발표 시각
    const availableTimes = [2, 5, 8, 11, 14, 17, 20, 23];

    // 현재 시간보다 작은 값 중에서 가장 큰 값 선택 (가장 최근 발표된 데이터)
    let baseHour = availableTimes.filter(h => h <= hours).pop();

    // 만약 현재 시간이 00~02시라면, 전날 23:00 데이터를 사용
    if (!baseHour) {
        baseHour = 23;
        now.setDate(now.getDate() - 1); 
    }

    const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const baseTime = baseHour.toString().padStart(2, "0") + "00";

    return { yyyymmdd, baseTime };
}

// 기상 데이터 가져오기 함수 -> 현재 시간을 기준으로 가장 최신 발표 데이터를 요청
export async function getWeather(lat, lng) {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY; 
    const { nx, ny } = convertLatLngToGrid(lat, lng);
    const { yyyymmdd, baseTime } = getLatestBaseTime(); // 최신 발표 시각 계산

    // API 요청 URL 생성
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${yyyymmdd}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

    console.log(`날짜: ${yyyymmdd}, 요청 시간: ${baseTime}`);

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}
