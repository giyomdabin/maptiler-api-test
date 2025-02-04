const FAVORITES_KEY = 'favorites';
let favorites = loadFavorites();

// 로컬 스토리지에서 즐겨찾기 데이터 로드
export function loadFavorites() {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    return storedFavorites ? JSON.parse(storedFavorites) : {};
}

// 로컬 스토리지에 즐겨찾기 데이터 저장
function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function addFavorite(name, address) {
    favorites[address] = name;
    saveFavorites();
    console.log(`${name} : ${address} 즐겨찾기에 추가`);
}

export function removeFavorite(address) {
    delete favorites[address];
    saveFavorites();
    console.log(`${address} 즐겨찾기에서 제거`);
}