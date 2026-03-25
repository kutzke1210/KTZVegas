// No modules, accessing global window.store and CDNs
const CONSTANTS = {
    r: 0.05,
    lambda: 1.2,
    phi: 0.8,
    kappa: 0.5,
    mu: 0.3,
    xi: 0.1,
    K: 15, // Adjusted to balance realistic payout and scale
    baseTheta: 1.5
};

// simplex-noise on CDN exposes SimplexNoise; its methods must be called with the instance context.
const noiseFunc = (() => {
    try {
        if (window.SimplexNoise) {
            const sn = new window.SimplexNoise();
            return (x, y) => sn.noise2D(x, y);
        }
    } catch (_) {}

    // Fallback: deterministic-ish wobble (never throws)
    return (x, y) => Math.sin(x) * Math.cos(y);
})();

class Engine {
    constructor() {
        this.lossHistory = [];
        this.windowSize = 10;
        this.noiseFunc = noiseFunc;
    }

    clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    gaussianNoise(mean = 0, stdDev = 0.2) {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * stdDev + mean;
    }

    fractalNoise(t, b) {
        return this.noiseFunc(t * 0.1, b * 0.1);
    }

    recordWin(amount, bet) {
        this.addLoss(Math.max(0, bet - amount));
    }

    recordLoss(bet) {
        this.addLoss(bet);
    }

    addLoss(loss) {
        this.lossHistory.push(loss);
        if (this.lossHistory.length > this.windowSize) this.lossHistory.shift();
    }

    getLossMemory() {
        if (this.lossHistory.length === 0) return 0;
        return this.lossHistory.reduce((a, b) => a + b, 0) / this.windowSize;
    }

    calculateProbability(t, b, s, v, psi, delta) {
        const omega = this.gaussianNoise(0, 0.2);
        const { r, lambda, phi, kappa, mu, xi } = CONSTANTS;

        const term1 = Math.sin(t * v);
        const term2 = Math.log(b + 1);
        const term3 = -Math.pow(Math.max(0, s) / (b + 1), lambda);
        const term4 = Math.exp(-r * t);
        const term6 = phi * Math.cos(delta * t);
        const term7 = kappa * Math.tanh(s / (t + 1));
        const term8 = mu * Math.log10(t + 2);
        const term9 = xi * Math.sin(psi * phi);

        const x = term1 + term2 + term3 + term4 + psi + term6 + term7 + term8 + term9 + omega;
        // "Fun-first" odds with safe clamping (avoid always losing, avoid always winning)
        const base = 1 / (1 + Math.exp(-x));
        return this.clamp(base + 0.18, 0.25, 0.65);
    }

    calculateMultiplier(t, b, s, v, psi, delta) {
        const { r, kappa, phi, mu, xi, K } = CONSTANTS;
        const term1 = Math.cos(t / (b + 1)) * Math.exp(v * r);
        const term2 = Math.log2(Math.max(0, s) + 2) / (t + 1);
        const term3 = Math.sin(phi * kappa);
        const term5 = Math.tanh(delta * xi);
        const term6 = Math.exp(Math.sin(t)) / (b + 2);

        const rawM = Math.abs(term1 + term2 + term3 + (psi * mu) + term5 + term6);
        // Keep payouts exciting but not absurd
        return this.clamp(rawM * K, 1.0, 12.0);
    }

    processSpin(state) {
        const t = state.totalSpins;
        const b = state.currentBet;
        const s = state.balance;
        
        const delta = this.getLossMemory();
        const psi = this.fractalNoise(t, b);
        const v = CONSTANTS.baseTheta + Math.sin(CONSTANTS.kappa * t) + psi + (delta / (t + 1)) + CONSTANTS.mu * Math.cos(CONSTANTS.phi);

        const pWin = this.calculateProbability(t, b, s, v, psi, delta);
        const isWin = Math.random() < pWin;

        let winAmount = 0;
        const symbolsCount = 6;
        const randSym = () => Math.floor(Math.random() * symbolsCount);
        let symbols = [randSym(), randSym(), randSym()];

        if (isWin) {
            const M = this.calculateMultiplier(t, b, s, v, psi, delta);
            winAmount = Math.max(b, Math.floor(b * M));
            this.recordWin(winAmount, b);
            const winSymbolIndex = randSym();
            symbols = [winSymbolIndex, winSymbolIndex, winSymbolIndex];
        } else {
            this.recordLoss(b);
            // Ensure it is not accidentally a win visually
            while (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
                symbols = [randSym(), randSym(), randSym()];
            }
        }

        return {
            winAmount,
            isWin,
            symbols
        };
    }
}

window.gameEngine = new Engine();
