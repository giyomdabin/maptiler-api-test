import { validateContainerId } from './utils.js';
import maplibregl from 'maplibre-gl';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY; // Vite에서 자동으로 처리됨
console.log('Loaded API Key:', MAPTILER_KEY);

(function () {
    'use strict';

    /**
     * 지도를 초기화하는 함수
     * @param {string} containerId - 지도를 렌더링할 HTML 컨테이너 ID
     * @returns {object} map - 초기화된 지도 객체
     */
    function initializeMap(containerId) {
        // 컨테이너 ID 유효성 검증
        validateContainerId(containerId);

        // MapTiler 지도를 초기화
        return new maplibregl.Map({
            style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`, // 지도 스타일 URL
            center: [126.9780, 37.5665], // 서울 중심 좌표 (경도, 위도)
            zoom: 15.5,                 // 초기 확대 비율
            pitch: 45,                  // 지도의 기울기
            bearing: -17.6,             // 지도의 방향
            container: containerId,     // HTML 컨테이너 ID
            canvasContextAttributes: { antialias: true } // 부드러운 렌더링
        });
    }

    /**
     * 지도에 3D 빌딩 레이어를 추가하는 함수
     * @param {object} map - 초기화된 지도 객체
     */
    function add3DBuildingsLayer(map) {
        // 지도 객체가 유효한지 확인
        if (!map || typeof map !== 'object') {
            throw new Error('유효하지 않은 지도 객체입니다.');
        }

        // 지도 데이터가 로드된 후 3D 빌딩 레이어 추가
        map.on('load', () => {
            const layers = map.getStyle().layers; // 지도 스타일에서 레이어 가져오기
            let labelLayerId;

            // 기존 심볼 레이어를 찾기 (레이어 ID 저장)
            for (let i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                    labelLayerId = layers[i].id;
                    break;
                }
            }

            // 3D 빌딩 데이터를 제공하는 소스 추가
            map.addSource('openmaptiles', {
                url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
                type: 'vector',
            });

            // 3D 빌딩 레이어 추가
            map.addLayer(
                {
                    id: '3d-buildings',         // 레이어 ID
                    source: 'openmaptiles',    // 데이터 소스
                    'source-layer': 'building', // 3D 빌딩 데이터 소스 레이어
                    type: 'fill-extrusion',    // 3D 효과를 위한 레이어 타입
                    minzoom: 15,              // 15 줌 레벨 이상에서만 표시
                    filter: ['!=', ['get', 'hide_3d'], true], // 숨김 속성이 없는 빌딩만 표시
                    paint: {
                        'fill-extrusion-color': [ // 빌딩 색상
                            'interpolate',
                            ['linear'],
                            ['get', 'render_height'], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
                        ],
                        'fill-extrusion-height': [ // 빌딩 높이
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            16,
                            ['get', 'render_height']
                        ],
                        'fill-extrusion-base': [ // 빌딩의 기본 높이 설정
                            'case',
                            ['>=', ['get', 'zoom'], 16],
                            ['get', 'render_min_height'], 0
                        ]
                    }
                },
                labelLayerId // 기존 심볼 레이어 아래에 추가
            );
        });
    }

    // 지도 초기화 및 3D 빌딩 레이어 추가
    const map = initializeMap('map');
    add3DBuildingsLayer(map);

})();