// ...existing code...
(function(){
    const INITIAL = 100;
    const STORAGE_KEY = 'wfc_current';
    let current = INITIAL;

    const getEl = id => document.getElementById(id);

    const load = () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw !== null) {
            const n = parseFloat(raw);
            if (!Number.isNaN(n)) return Math.round(n * 100) / 100;
        }
        return INITIAL;
    };

    const save = () => {
        try {
            localStorage.setItem(STORAGE_KEY, String(current));
        } catch (e) {
            // storage unavailable — silently ignore
        }
    };

    const render = () => {
        const el = getEl('result');
        if (!el) return;
        const text = Number.isInteger(current) ? String(current) : current.toFixed(2).replace(/\.00$/, '');
        el.textContent = text;
    };

    const change = (amount) => {
        current = Math.round((current - amount) * 100) / 100;
        save();
        render();
    };

    const reset = () => {
        current = INITIAL;
        save();
        render();
    };

    const wire = () => {
        const b07 = getEl('0.7');
        const b12 = getEl('1.2');
        const restart = getEl('restart');

        if (b07) b07.addEventListener('click', () => change(0.7));
        if (b12) b12.addEventListener('click', () => change(1.2));
        if (restart) restart.addEventListener('click', reset);

        render();
    };

    const init = () => {
        current = load();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', wire);
        } else {
            wire();
        }
    };

    init();
})();