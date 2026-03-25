// Referências globais
const store = window.store;
const gameEngine = window.gameEngine;

let spinSound, winSound;
if (window.Howl) {
    spinSound = { play: () => console.log('Spin FX') };
    winSound = { play: () => console.log('Win FX') };
}

let pendingSpinResult = null;

function onSpinComplete() {
    const winAmount = pendingSpinResult?.winAmount || 0;
    if (winAmount > 0 && winSound) {
        winSound.play();
    }
    store.finishSpin(winAmount);
    pendingSpinResult = null;

    // Auto-spin: schedule next run as soon as we become idle
    scheduleAutoSpin();
}

const slotRenderer = new window.SlotRenderer('slot-canvas-container', onSpinComplete);
let autoSpinTimer = null;
const AUTO_SPIN_DELAY_MS = 650;

window.addEventListener('requestSpin', handleRequestSpin);

store.subscribe((state) => {
    // Keep renderer and store state aligned for UI locking
    if (!state.isSpinning && pendingSpinResult) {
        // If something went wrong and spin ended early, don't keep a stale win.
        pendingSpinResult = null;
    }
    scheduleAutoSpin();
});

function clearAutoSpinTimer() {
    if (autoSpinTimer) {
        clearTimeout(autoSpinTimer);
        autoSpinTimer = null;
    }
}

function scheduleAutoSpin() {
    const state = store.getState();
    if (!state.isAutoSpin) {
        clearAutoSpinTimer();
        return;
    }
    if (state.isSpinning) return;
    if (autoSpinTimer) return;

    autoSpinTimer = setTimeout(() => {
        autoSpinTimer = null;
        const s = store.getState();
        if (s.isAutoSpin && !s.isSpinning) handleRequestSpin();
    }, AUTO_SPIN_DELAY_MS);
}

function handleRequestSpin() {
    const before = store.getState();
    if (!store.spin()) return;

    try {
        if (spinSound) spinSound.play();

        // Engine determina resultado + símbolos-alvo antes do visual
        pendingSpinResult = gameEngine.processSpin(store.getState());

        const isWin = (pendingSpinResult?.winAmount || 0) > 0;

        // Renderizador atua com a confirmação para criar a visualização realista
        slotRenderer.startSpin({
            isWin,
            symbols: pendingSpinResult?.symbols
        });
    } catch (err) {
        // Fail-safe: never leave the game "stuck" spinning
        console.error('Spin failed:', err);
        pendingSpinResult = null;
        // Refund the bet we just deducted
        store.setState({
            balance: before.balance,
            isSpinning: false
        });
    }
}

store.notify();
