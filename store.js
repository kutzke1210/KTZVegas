class Store {
    constructor() {
        // Load from localStorage or use defaults
        const savedBalance = localStorage.getItem('slot_balance');
        const balance = savedBalance !== null ? parseFloat(savedBalance) : 35000;
        
        const savedBet = localStorage.getItem('slot_bet');
        const currentBet = savedBet !== null ? parseInt(savedBet) : 10;

        this.state = {
            balance: balance,
            currentBet: currentBet,
            totalSpins: 0,
            isSpinning: false,
            isAutoSpin: false,
            lastWin: null,
            language: 'en' // Default language
        };
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        if (newState.balance !== undefined) {
            localStorage.setItem('slot_balance', this.state.balance);
        }
        if (newState.currentBet !== undefined) {
            localStorage.setItem('slot_bet', this.state.currentBet);
        }
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Actions
    setBet(amount) {
        if (!this.state.isSpinning) {
            this.setState({ currentBet: amount });
        }
    }

    toggleAutoSpin() {
        this.setState({ isAutoSpin: !this.state.isAutoSpin });
    }

    toggleLanguage() {
        this.setState({ language: this.state.language === 'en' ? 'pt' : 'en' });
    }

    spin() {
        if (this.state.isSpinning || this.state.balance < this.state.currentBet) return false;
        
        this.setState({
            balance: this.state.balance - this.state.currentBet,
            isSpinning: true,
            lastWin: null,
            totalSpins: this.state.totalSpins + 1
        });
        
        return true;
    }

    finishSpin(winAmount) {
        this.setState({
            balance: this.state.balance + winAmount,
            lastWin: winAmount > 0 ? winAmount : null,
            isSpinning: false
        });
    }
}

// Global instance (No export needed, directly bound to window)
window.store = new Store();
