import { loadFavorites , removeFavorite } from '../scripts/favorite.js';

const favoriteListButton = document.getElementById('favorite-list');

// 즐겨찾기 목록 가져오는 함수
export function getFavoriteList() {
    favoriteListButton.addEventListener('click', () => {
        const favorites = loadFavorites();
        if(favorites.length == 0) {
            alert('추가한 즐겨찾기가 없습니다!');
            return;
        }
        console.log('즐겨찾기 목록:', favorites);
    });
}