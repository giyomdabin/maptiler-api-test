import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true, // Vite 서버 실행 시 자동으로 브라우저 열기
  },
  define: {
    // 환경변수를 Vite에서 사용할 수 있도록 설정
    'process.env': process.env,
  },
});
