// @ts-nocheck

import angular from '@angular-devkit/build-angular/plugins/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        angular(),
    ],
    ssr: {
        // Muy importante: hace que SSR use la MISMA instancia de Angular
        // para tu app y para la librería ffsj-web-components
        noExternal: ['ffsj-web-components'],
    },
});
