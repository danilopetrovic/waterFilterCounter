(function(){
    const INITIAL = 100;
    const STORAGE_KEY = 'wfc_current';
    const CUSTOM_KEY = 'wfc_custom_values';
    let current = INITIAL;

    const getEl = id => document.getElementById(id);

    const loadCurrent = () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw !== null) {
            const n = parseFloat(raw);
            if (!Number.isNaN(n)) return Math.round(n * 100) / 100;
        }
        return INITIAL;
    };

    const loadCustomValues = () => {
        const raw = localStorage.getItem(CUSTOM_KEY);
        if (raw !== null) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map(item => ({
                            id: String(item.id),
                            value: Math.round(parseFloat(item.value) * 100) / 100
                        }))
                        .filter(item => item.id && !Number.isNaN(item.value));
                }
            } catch (e) {
                // ignore invalid storage
            }
        }
        return [];
    };

    const saveCurrent = () => {
        try {
            localStorage.setItem(STORAGE_KEY, String(current));
        } catch (e) {
            // storage unavailable — silently ignore
        }
    };

    const saveCustomValues = (values) => {
        try {
            localStorage.setItem(CUSTOM_KEY, JSON.stringify(values));
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
        saveCurrent();
        render();
    };

    const reset = () => {
        current = INITIAL;
        saveCurrent();
        render();
    };

    const showModal = () => {
        const modal = getEl('custom-modal');
        const input = getEl('custom-value');
        if (!modal || !input) return;
        input.value = '';
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        input.focus();
    };

    const hideModal = () => {
        const modal = getEl('custom-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    };

    const createCustomButton = (item) => {
        const container = getEl('custom-buttons');
        if (!container) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'custom-button';
        button.dataset.customId = item.id;
        button.dataset.value = String(item.value);

        const label = document.createElement('span');
        const valueText = Number.isInteger(item.value) ? item.value : item.value.toFixed(2);
        label.textContent = `- ${valueText} l`;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-custom';
        deleteBtn.textContent = 'X';

        button.appendChild(label);
        button.appendChild(deleteBtn);
        container.appendChild(button);

        button.addEventListener('click', (event) => {
            if (event.target === deleteBtn) return;
            change(item.value);
        });

        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            removeCustomButton(item.id);
        });
    };

    const removeCustomButton = (customId) => {
        const container = getEl('custom-buttons');
        if (!container) return;
        const button = container.querySelector(`[data-custom-id="${customId}"]`);
        if (button) button.remove();

        const values = loadCustomValues().filter(item => item.id !== customId);
        saveCustomValues(values);
    };

    const addCustomValue = (value) => {
        const trimmed = Number(value);
        if (Number.isNaN(trimmed) || trimmed <= 0) return;
        const parsed = Math.round(trimmed * 100) / 100;
        const customValues = loadCustomValues();
        const newItem = {
            id: `custom-${Date.now()}`,
            value: parsed
        };
        customValues.push(newItem);
        saveCustomValues(customValues);
        createCustomButton(newItem);
    };

    const wire = () => {
        const b07 = getEl('0.7');
        const b12 = getEl('1.2');
        const restart = getEl('restart');
        const custom = getEl('custom');
        const confirm = getEl('custom-confirm');
        const cancel = getEl('custom-cancel');
        const modal = getEl('custom-modal');

        if (b07) b07.addEventListener('click', () => change(0.7));
        if (b12) b12.addEventListener('click', () => change(1.2));
        if (restart) restart.addEventListener('click', reset);
        if (custom) custom.addEventListener('click', showModal);
        if (confirm) {
            confirm.addEventListener('click', () => {
                const input = getEl('custom-value');
                if (!input) return;
                addCustomValue(input.value);
                hideModal();
            });
        }
        if (cancel) cancel.addEventListener('click', hideModal);
        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) hideModal();
            });
        }

        const customValues = loadCustomValues();
        customValues.forEach(createCustomButton);

        render();
    };

    const init = () => {
        current = loadCurrent();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', wire);
        } else {
            wire();
        }
    };

    init();
})();