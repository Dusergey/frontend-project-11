import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Делаем папку code корнем проекта для Vite
  root: path.resolve(__dirname, 'code'),

  // Настройки сборки
  build: {
    // Папка для итоговой сборки
    outDir: path.resolve(__dirname, 'dist'),

    // Относительные пути в итоговой сборке
    emptyOutDir: true,
  },
});
