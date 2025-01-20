import { validateContainerId } from './utils.js';
import maplibregl from 'maplibre-gl';
import { geocodeAddress } from './geocoder.js';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
const VWORLD_KEY = import.meta.env.VITE_VWORLD_API_KEY;

// 지도 초기화 함수
function initializeMap(containerId) {
    validateContainerId(containerId);
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

// 3D 빌딩 레이어 추가 함수
function add3DBuildingsLayer(map) {
    if (!map) throw new Error('지도 객체가 유효하지 않습니다.');

    map.on('load', () => {
        const layers = map.getStyle().layers;
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

// 주소 검색 기능 설정 함수
function setupAddressSearch(map) {
    const searchButton = document.getElementById('searchButton');
    const addressInput = document.getElementById('addressInput');

    if (searchButton && addressInput) {
        searchButton.addEventListener('click', () => {
            const address = addressInput.value.trim();
            if (address) {
                geocodeAddress(address, map, VWORLD_KEY);
            } else {
                alert('주소를 입력하세요!');
            }
        });
    } else {
        console.error('검색 버튼 또는 입력 필드를 찾을 수 없습니다.');
    }
}

// 지도 초기화 및 기능 실행
const map = initializeMap('map');
add3DBuildingsLayer(map);
setupAddressSearch(map);
