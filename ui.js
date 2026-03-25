const translations = {
    en: {
        casino_title: "KTZVegas",
        credits: "CREDITS",
        bet: "BET",
        winner_paid: "WINNER PAID",
        reset: "RESET",
        bet_one: "BET<br>ONE",
        auto_spin: "AUTO<br>SPIN",
        bet_max: "BET<br>MAX",
        spin: "SPIN",
        flag: "🇺🇸 EN",
        bet_tooltip: "Type custom bet!"
    },
    pt: {
        casino_title: "KTZVegas",
        credits: "CRÉDITOS",
        bet: "APOSTA",
        winner_paid: "PRÊMIO",
        reset: "ZERAR",
        bet_one: "APOSTAR<br>MAIS",
        auto_spin: "GIRO<br>AUTO",
        bet_max: "APOSTA<br>MÁX",
        spin: "GIRAR",
        flag: "🇧🇷 PT",
        bet_tooltip: "Digite o valor!"
    }
};

class UI {
    constructor() {
        this.balanceDisplay = document.getElementById('balance-display');
        this.betInput = document.getElementById('bet-input');
        this.winAmountDisplay = document.getElementById('win-amount');
        
        this.btnReset = document.getElementById('btn-reset');
        this.btnBetOne = document.getElementById('btn-bet-one');
        this.btnAutoSpin = document.getElementById('btn-play-table');
        this.btnBetMax = document.getElementById('btn-bet-max');
        this.btnSpin = document.getElementById('btn-spin');
        this.btnLang = document.getElementById('btn-lang');

        // Handle
        this.handleArm = document.querySelector('.handle-arm');
        this.handleBall = document.querySelector('.handle-ball');

        this.setupListeners();
        
        window.store.subscribe(this.render.bind(this));
        
        // Initial setup for i18n
        this.updateLanguages(window.store.getState().language);

        this._lastWinAnimated = 0;
        this._winAnimRaf = null;

        // Scaling is handled by CSS variables (mobile-first fluid layout)
    }

    setupListeners() {

        // Custom Flex Bet Input Event
        this.betInput.addEventListener('change', (e) => {
            const state = window.store.getState();
            let val = parseInt(e.target.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            if (val > state.balance) val = Math.floor(state.balance);
            if (val === 0) val = 1; // Minimum bet 1
            
            // Format back the input nicely after user enters
            window.store.setBet(val);
        });

        // Add 500 when pressing BET ONE
        this.btnBetOne.addEventListener('click', () => {
            const state = window.store.getState();
            const increment = 500;
            if (state.currentBet + increment <= state.balance) {
                window.store.setBet(state.currentBet + increment);
            }
        });

        this.btnBetMax.addEventListener('click', () => {
            const state = window.store.getState();
            // Maximum bet is their entire balance or 10000 limit
            const max = Math.floor(state.balance); 
            if (max > 0) window.store.setBet(max);
        });

        this.btnReset.addEventListener('click', () => {
            window.store.setBet(50);
        });

        this.btnAutoSpin.addEventListener('click', () => {
             window.store.toggleAutoSpin();
        });

        this.btnLang.addEventListener('click', () => {
            window.store.toggleLanguage();
        });

        const triggerSpin = () => {
            const state = window.store.getState();
            if (!state.isSpinning) {
                window.dispatchEvent(new Event('requestSpin'));
                this.animateHandle();
            }
        };

        this.btnSpin.addEventListener('click', triggerSpin);
        
        const handleEl = document.querySelector('.machine-handle');
        if (handleEl) handleEl.addEventListener('click', triggerSpin);
    }

    animateHandle() {
        if (!this.handleArm) return;
        this.handleArm.style.transform = 'scaleY(0.4)';
        this.handleBall.style.transform = 'translateY(90px)';
        setTimeout(() => {
            this.handleArm.style.transform = 'none';
            this.handleBall.style.transform = 'none';
        }, 300);
    }

    formatLED(num, length) {
        return (num || 0).toString().padStart(length, '0');
    }

    // Handles i18n mapping
    updateLanguages(lang) {
        const t = translations[lang];
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                if (el.tagName === 'INPUT') {
                    // inputs don't use innerHTML
                } else {
                    el.innerHTML = t[key];
                }
            }
        });
        if (this.btnLang) {
            this.btnLang.innerHTML = t.flag;
        }
    }

    animateWinAmount(toValue) {
        if (this._winAnimRaf) cancelAnimationFrame(this._winAnimRaf);
        const fromValue = this._lastWinAnimated || 0;
        const start = performance.now();
        const dur = 900;

        const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
        const step = (now) => {
            const p = Math.min(1, (now - start) / dur);
            const v = Math.floor(fromValue + (toValue - fromValue) * easeOutCubic(p));
            this.winAmountDisplay.textContent = this.formatLED(v, 8);
            if (p < 1) {
                this._winAnimRaf = requestAnimationFrame(step);
            } else {
                this._winAnimRaf = null;
                this._lastWinAnimated = toValue;
            }
        };
        this._winAnimRaf = requestAnimationFrame(step);
    }

    render(state) {
        this.balanceDisplay.textContent = this.formatLED(Math.floor(state.balance), 8);
        
        // Se usuário não está digitando ativamente, nós atualizamos o visual
        if (document.activeElement !== this.betInput && !state.isSpinning) {
            this.betInput.value = state.currentBet;
        }

        if (state.lastWin > 0) {
            this.animateWinAmount(Math.floor(state.lastWin));
            this.winAmountDisplay.style.color = '#fff';
            setTimeout(() => { this.winAmountDisplay.style.color = '#f00'; }, 300);
            setTimeout(() => { this.winAmountDisplay.style.color = '#fff'; }, 600);
            setTimeout(() => { this.winAmountDisplay.style.color = '#f00'; }, 900);

            // Big win feedback
            if (state.lastWin >= state.currentBet * 8) {
                document.body.classList.remove('bigwin-shake');
                // restart animation
                void document.body.offsetWidth;
                document.body.classList.add('bigwin-shake');
                setTimeout(() => document.body.classList.remove('bigwin-shake'), 900);
            }
        } else if (state.isSpinning) {
            this.winAmountDisplay.textContent = this.formatLED(0, 8);
            this._lastWinAnimated = 0;
        }

        const isSpin = state.isSpinning;
        this.btnSpin.disabled = isSpin;
        this.betInput.disabled = isSpin;
        this.btnBetOne.disabled = isSpin || state.currentBet >= state.balance;
        this.btnBetMax.disabled = isSpin;
        this.btnReset.disabled = isSpin;
        
        if (state.isAutoSpin) {
            this.btnAutoSpin.style.boxShadow = 'inset 0 0 20px rgba(255,255,255,0.7)';
            this.btnAutoSpin.style.filter = 'brightness(1.5)';
        } else {
            this.btnAutoSpin.style.boxShadow = '';
            this.btnAutoSpin.style.filter = '';
        }

        this.updateLanguages(state.language);
    }
}

window.ui = new UI();
