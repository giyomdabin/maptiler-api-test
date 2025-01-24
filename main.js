import maplibregl from 'maplibre-gl';
import { setupSearch } from '/scripts/search.js';
import { initializeSearchUI } from '/components/resultList.js';
import { getFavoriteList } from './components/favoriteList';

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

    console.log("지하철데이터 로드중");

    map.on('load', () => {
        // GeoJSON 데이터 추가
        map.addSource('subway', {
            type: 'geojson',
            data: '/assets/data/seoul_subway.geojson'
        });

        // 지하철 역을 지도에 표시하기
        map.addLayer({
            id: 'subway-layer',
            type: 'circle',
            source: 'subway',
            paint: {
                'circle-radius': 6,
                'circle-color': '#FF5733'
            }
        });

        // 레이어 클릭 이벤트
        map.on('click', 'subway-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;

            const stationName = properties.역명; 
            const lineInfo = properties.호선; 

            // Popup 생성
            new maplibregl.Popup()
                .setLngLat(coordinates) // 클릭한 위치
                .setHTML(`<strong>${stationName}</strong><br>호선: ${lineInfo}`)
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

initializeSearchUI(); // 검색 UI 초기화
setupSearch(map);
getFavoriteList();