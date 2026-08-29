import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY = 'gocart:scroll-positions';

const readPositions = () => {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
};

/**
 * A new page always opens at the top; going back returns to the exact spot the
 * user left. Positions are keyed by the router's location key, so two visits to
 * the same URL keep their own scroll offsets.
 */
const ScrollManager = () => {
    const { key } = useLocation();
    const navigationType = useNavigationType();
    const positions = useRef(readPositions());
    const currentKey = useRef(key);

    // The browser's own restoration fights the logic below, so it is turned off.
    useEffect(() => {
        if (!('scrollRestoration' in window.history)) return;

        const previous = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        return () => { window.history.scrollRestoration = previous; };
    }, []);

    // Track where the user is, so the value is already stored once they leave.
    useEffect(() => {
        const save = () => { positions.current[currentKey.current] = window.scrollY; };
        const persist = () => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions.current));

        window.addEventListener('scroll', save, { passive: true });
        window.addEventListener('pagehide', persist);

        return () => {
            save();
            persist();
            window.removeEventListener('scroll', save);
            window.removeEventListener('pagehide', persist);
        };
    }, []);

    useLayoutEffect(() => {
        currentKey.current = key;

        // Sorting and filtering replace the URL in place, so the view stays put.
        if (navigationType === 'REPLACE') return;

        const saved = positions.current[key];
        const target = navigationType === 'POP' && typeof saved === 'number' ? saved : 0;

        if (target === 0) {
            window.scrollTo(0, 0);
            return;
        }

        // Pages fetch their data after mounting, so the page is often too short to
        // scroll that far on the first frame. Keep trying until it fits.
        let frame;
        const start = performance.now();

        const restore = () => {
            window.scrollTo(0, target);
            if (Math.abs(window.scrollY - target) > 2 && performance.now() - start < 1500) {
                frame = requestAnimationFrame(restore);
            }
        };

        restore();
        return () => cancelAnimationFrame(frame);
    }, [key, navigationType]);

    return null;
};

export default ScrollManager;
