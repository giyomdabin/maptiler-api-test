import maplibregl from 'maplibre-gl';
import { setupSearch } from '/scripts/search.js';
import { initializeSearchUI } from '/components/resultList.js';
import { getFavoriteList } from './components/favoriteList';
import { getWeather } from './scripts/weather.js'; // weather.js에서 API 호출 함수 import
import { renderWeatherWidget  } from './components/weatherInfo.js'; // weatherInfo.js에서 표시 함수 import

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

// 지도 초기화 함수
function initializeMap(containerId) {

    return new maplibregl.Map({
        style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
        center: [126.9780, 37.5665], // 서울 중심
        zoom: 15.5,
        pitch: 45,
        bearing: -17.6,
        container: containerId,
        canvasContextAttributes: { antialias: true },
    });
}

// 3D 빌딩 레이어 추가
function add3DBuildingsLayer(map) {
    if (!map) throw new Error('지도 객체가 유효하지 않습니다.');

    map.on('load', () => {
        const layers = map.getStyle().layers;

        // 레이어 중 텍스트 필드를 찾아 언어 수정
        layers.forEach((layer) => {
            if (layer.layout && layer.layout['text-field']) {
                map.setLayoutProperty(layer.id, 'text-field', ['get', 'name:ko']);
            }
        });
        const labelLayerId = layers.find(layer => layer.type === 'symbol' && layer.layout['text-field'])?.id;

        map.addSource('openmaptiles', {
            url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
            type: 'vector',
        });

        map.addLayer({
            id: '3d-buildings',
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 15,
            filter: ['!=', ['get', 'hide_3d'], true],
            paint: {
                'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'render_height'], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue',
                ],
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    16,
                    ['get', 'render_height'],
                ],
                'fill-extrusion-base': [
                    'case',
                    ['>=', ['get', 'zoom'], 16],
                    ['get', 'render_min_height'], 0,
                ],
            },
        }, labelLayerId);
    });
}

function addSubway(map) {
    if (!map) throw new Error('지도 객체가 유효하지 않습니다.');

    map.on('load', () => {
        // GeoJSON 데이터 추가
        map.addSource('subway', {
            type: 'geojson',
            data: '/assets/data/subway.geojson'
        });

        map.loadImage('/assets/images/subway.png');

        // 지하철 역 아이콘 레이어 추가
        map.addLayer({
            id: 'subway-layer',
            type: 'symbol',
            source: 'subway',
            layout: {
                'icon-image': 'subway', 
                'icon-size': 1.2,           // 아이콘 크기
                'text-offset': [0, 1.2],   // 텍스트 위치 조정
                'text-anchor': 'top',      // 텍스트 정렬
                'icon-allow-overlap': true // 아이콘 겹침 허용
            },
            paint: {
                'text-color': '#333333'    // 텍스트 색상
            },
            filter: [
                "step",
                ["zoom"],
                ["==", ["%", ["get", "id"], 10], 0], // 줌 10 이하 → 10개 중 1개만 표시
                12, ["==", ["%", ["get", "id"], 5], 0], // 줌 11 이하 → 5개 중 1개만 표시
                13, true // 줌 13 이상 → 모든 아이콘 표시
            ]
        });

        // 레이어 클릭 이벤트
        map.on('click', 'subway-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const lng = e.features[0].geometry.coordinates[0].toFixed(6); // 경도 제한
            const lat = e.features[0].geometry.coordinates[1].toFixed(6); // 위도 제한
            const properties = e.features[0].properties;

            const stationName = properties.name; 
            const lineInfo = properties.line;    

            // Popup 생성
            new maplibregl.Popup()
                .setLngLat(coordinates) // 클릭한 위치
                .setHTML(`<strong>${stationName}역</strong><br>${lineInfo}<br>${lng},${lat}`)
                .addTo(map);
        });       

        // 마우스 포인터 모양 변경 (클릭 가능한 피드백)
        map.on('mouseenter', 'subway-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'subway-layer', () => {
            map.getCanvas().style.cursor = '';
        });
    });
}

// 지도 초기화 및 기능 실행
const map = initializeMap('map');
window.mapInstance = map; // 전역으로 저장
add3DBuildingsLayer(map);
addSubway(map);

initializeSearchUI(); 
setupSearch(map);
getFavoriteList();

// 날씨 조회 버튼 이벤트 리스너 추가
document.addEventListener("DOMContentLoaded", () => {
  renderWeatherWidget();  // 날씨 UI 렌더링
});