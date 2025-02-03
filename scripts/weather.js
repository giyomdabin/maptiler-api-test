// scripts/weather.js
import { convertLatLngToGrid } from './coordinateConverter.js';

export async function getWeather(lat, lng) {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY; // 기상청 API 키

    // 위도, 경도를 nx, ny로 변환
    const { nx, ny } = convertLatLngToGrid(lat, lng);

    // 현재 날짜 계산
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const yyyymmdd = `${year}${month}${day}`;

    // API URL 생성
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${apiKey}&pageNo=1&numOfRows=60&dataType=JSON&base_date=${yyyymmdd}&base_time=0500&nx=${nx}&ny=${ny}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}