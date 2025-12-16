import 'nprogress/nprogress.css';
import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import NProgress from 'nprogress';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Configure NProgress
NProgress.configure({
    showSpinner: true,
    trickleSpeed: 200,
    minimum: 0.08,
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        delay: 0,
        showSpinner: false,
        color: '#4B5563',
    },
});

// Hook into Inertia's navigation events to show/hide progress bar
router.on('start', () => {
    NProgress.start();
});

router.on('progress', (event) => {
    if (event.detail.progress?.percentage) {
        NProgress.set(event.detail.progress.percentage / 100);
    }
});

router.on('finish', () => {
    NProgress.done();
});

router.on('error', () => {
    NProgress.done();
});

// This will set light / dark mode on load...
initializeTheme();
