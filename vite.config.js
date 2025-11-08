import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'code'), // делаем code/ корнем
  build: {
    outDir: path.resolve(__dirname, 'dist'), // куда положить сборку
  },
});
