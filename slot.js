// Highly detailed SVG symbols for the slot machine
const svgData = {
    seven: `<svg width="140" height="140" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffaaaa"/><stop offset="20%" stop-color="#ee0000"/><stop offset="100%" stop-color="#880000"/></linearGradient><filter id="s"><feDropShadow dx="3" dy="6" stdDeviation="4" flood-opacity="0.6"/></filter></defs><path d="M 15 25 L 85 25 L 50 85 L 25 85 L 50 40 L 25 40 Z" fill="url(#g)" stroke="#ffdddd" stroke-width="2" filter="url(#s)"/></svg>`,
    diamond: `<svg width="140" height="140" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="d" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#88eeff"/><stop offset="100%" stop-color="#0066ee"/></linearGradient><filter id="fs"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-opacity="0.5"/></filter></defs><g filter="url(#fs)"><polygon points="50,15 90,40 50,90 10,40" fill="url(#d)" stroke="#003388" stroke-width="2"/><polygon points="50,15 90,40 50,45 10,40" fill="#ffffff" opacity="0.6"/><polygon points="50,45 90,40 50,90" fill="#00bbff" opacity="0.4"/><polygon points="50,15 50,45 10,40" fill="#ffffff" opacity="0.8"/></g></svg>`,
    bell: `<svg width="140" height="140" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffee55"/><stop offset="50%" stop-color="#ffcc00"/><stop offset="100%" stop-color="#aa7700"/></linearGradient><filter id="bs"><feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.6"/></filter></defs><g filter="url(#bs)"><path d="M 50 20 C 25 20 30 55 15 75 L 85 75 C 70 55 75 20 50 20 Z" fill="url(#b)" stroke="#553300" stroke-width="2"/><circle cx="50" cy="80" r="10" fill="#885500"/><path d="M 50 20 L 50 10" stroke="#553300" stroke-width="5" stroke-linecap="round"/></g></svg>`,
    lemon: `<svg width="140" height="140" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="l"><stop offset="0%" stop-color="#ffffaa"/><stop offset="80%" stop-color="#ffdd00"/><stop offset="100%" stop-color="#cc8800"/></radialGradient><filter id="ls"><feDropShadow dx="2" dy="5" stdDeviation="3" flood-opacity="0.5"/></filter></defs><g filter="url(#ls)"><path d="M 20 80 C 0 60 10 30 50 20 C 90 10 100 40 80 80 C 60 100 30 90 20 80 Z" fill="url(#l)" stroke="#aa6600" stroke-width="2"/><path d="M 45 25 Q 60 35 65 50" fill="none" stroke="#ffee55" stroke-width="3" opacity="0.5"/></g></svg>`,
    cherry: `<svg width="140" height="140" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="c" cx="35%" cy="30%"><stop offset="0%" stop-color="#ffaaaa"/><stop offset="40%" stop-color="#dd0000"/><stop offset="100%" stop-color="#550000"/></radialGradient><filter id="cs"><feDropShadow dx="2" dy="5" stdDeviation="3" flood-opacity="0.6"/></filter></defs><g filter="url(#cs)"><circle cx="35" cy="70" r="22" fill="url(#c)" stroke="#330000" stroke-width="2"/><circle cx="75" cy="65" r="22" fill="url(#c)" stroke="#330000" stroke-width="2"/><path d="M 35 50 Q 50 10 60 10 Q 70 30 75 45" fill="none" stroke="#007700" stroke-width="4"/><path d="M 60 10 Q 75 5 90 15" fill="none" stroke="#00aa00" stroke-width="4"/><path d="M 50 10 L 70 10" stroke="#552200" stroke-width="4"/></g></svg>`,
    bar: `<svg width="140" height="140" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#555"/><stop offset="30%" stop-color="#111"/><stop offset="70%" stop-color="#333"/><stop offset="100%" stop-color="#000"/></linearGradient><filter id="barf"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity="0.8"/></filter></defs><g filter="url(#barf)"><rect x="10" y="30" width="80" height="40" rx="5" fill="url(#bar)" stroke="#aaa" stroke-width="3"/><rect x="15" y="35" width="70" height="30" rx="3" fill="none" stroke="#555" stroke-width="1"/><text x="50" y="60" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#fff" text-anchor="middle" letter-spacing="4">BAR</text></g></svg>`
};

const createTexture = (svgString) => {
    return PIXI.Texture.from(`data:image/svg+xml;charset=utf8,${encodeURIComponent(svgString)}`);
};

class SlotRenderer {
    constructor(containerId, onSpinComplete) {
        this.onSpinComplete = onSpinComplete;
        const container = document.getElementById(containerId);
        this.container = container;
        this.DESIGN_W = 650;
        this.DESIGN_H = 350;
        const w = this.DESIGN_W;
        const h = this.DESIGN_H;

        this.app = new PIXI.Application({
            width: w,
            height: h,
            backgroundColor: 0xfdfdfd,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
        });
        container.appendChild(this.app.view);
        this.app.view.style.width = '100%';
        this.app.view.style.height = '100%';
        // Ensure the render loop is running (some environments end up with a stopped ticker)
        if (typeof this.app.start === 'function') this.app.start();
        if (this.app.ticker && typeof this.app.ticker.start === 'function') this.app.ticker.start();

        window.addEventListener('resize', () => this.resize());

        this.REELS_COUNT = 3;
        this.SYMBOL_SIZE = 140; 
        
        this.SYMBOL_TEXTURES = [
            createTexture(svgData.seven),
            createTexture(svgData.diamond),
            createTexture(svgData.bell),
            createTexture(svgData.cherry),
            createTexture(svgData.lemon),
            createTexture(svgData.bar)
        ];

        this.reels = [];
        this.isSpinning = false;
        this.lastSpin = null;
        
        this.initReels(this.DESIGN_W, this.DESIGN_H);
        this.resize();
    }

    positionReels(width, height) {
        const reelWidth = width / this.REELS_COUNT;
        this.reels.forEach((r, i) => {
            r.container.x = i * reelWidth + reelWidth / 2;
            r.container.y = height / 2;
        });
        this.app.stage.mask.clear();
        this.app.stage.mask.beginFill(0xffffff);
        this.app.stage.mask.drawRect(0, 0, width, height);
        this.app.stage.mask.endFill();
        this.drawLines(width, height, reelWidth);
    }

    getRandomSymbolIndex() {
        return Math.floor(Math.random() * this.SYMBOL_TEXTURES.length);
    }

    initReels(width, height) {
        const reelWidth = width / this.REELS_COUNT;
        this.NUM_SYMBOLS_PER_REEL = this.SYMBOL_TEXTURES.length * 2; 

        for (let i = 0; i < this.REELS_COUNT; i++) {
            const rc = new PIXI.Container();
            rc.x = i * reelWidth + reelWidth / 2;
            rc.y = height / 2;
            
            const reel = {
                container: rc,
                symbols: [],
                position: 0,
                previousPosition: 0,
                blur: new PIXI.filters.BlurFilter(),
                speed: 0,
                targetStopPos: null,
                timeToStop: 0,
                targetSymbolIndex: 0,
                phase: 'STOPPED',
                t: 0
            };

            reel.blur.blurX = 0;
            reel.blur.blurY = 0;
            rc.filters = [reel.blur];

            for (let j = 0; j < this.NUM_SYMBOLS_PER_REEL; j++) {
                const visualIndex = j % this.SYMBOL_TEXTURES.length;
                const sprite = new PIXI.Sprite(this.SYMBOL_TEXTURES[visualIndex]);
                sprite.anchor.set(0.5);
                sprite.width = 110; 
                sprite.height = 110;
                
                reel.symbols.push({
                    spriteObj: sprite,
                    visualIndex: visualIndex
                });
                rc.addChild(sprite);
            }
            
            this.reels.push(reel);
            this.app.stage.addChild(rc);
        }

        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, width, height); 
        mask.endFill();
        this.app.stage.mask = mask;

        this.linesGraphics = new PIXI.Graphics();
        this.drawLines(width, height, reelWidth);
        this.app.stage.addChild(this.linesGraphics);

        this.updateReelLayout(0);
        this.app.ticker.add((delta) => {
            try {
                this.update(delta);
            } catch (err) {
                console.error('Renderer update failed:', err);
                // Fail-safe: stop spinning so UI doesn't get stuck
                this.isSpinning = false;
                if (this.onSpinComplete) this.onSpinComplete();
            }
        });
    }

    resize() {
        if (!this.container) return;
        const cw = Math.max(1, Math.floor(this.container.clientWidth || this.DESIGN_W));
        const ch = Math.max(1, Math.floor(this.container.clientHeight || this.DESIGN_H));

        this.app.renderer.resize(cw, ch);

        const scale = Math.min(cw / this.DESIGN_W, ch / this.DESIGN_H);
        this.app.stage.scale.set(scale);
        this.app.stage.x = Math.floor((cw - this.DESIGN_W * scale) / 2);
        this.app.stage.y = Math.floor((ch - this.DESIGN_H * scale) / 2);

        // Layout inside design coordinates
        this.positionReels(this.DESIGN_W, this.DESIGN_H);
    }

    drawLines(width, height, reelWidth) {
        this.linesGraphics.clear();
        this.linesGraphics.lineStyle(2, 0xdddddd, 1);
        for(let i=1; i<this.REELS_COUNT; i++) {
            this.linesGraphics.moveTo(i * reelWidth, 0);
            this.linesGraphics.lineTo(i * reelWidth, height);
        }
        
        // Linha de pagamento central 
        this.linesGraphics.lineStyle(4, 0xff0000, 0.4);
        this.linesGraphics.moveTo(0, height / 2);
        this.linesGraphics.lineTo(width, height / 2);
    }

    startSpin(spin) {
        if (this.isSpinning) return;
        this.isSpinning = true;
        this.lastSpin = spin || null;

        const spinSymbols = Array.isArray(spin?.symbols) && spin.symbols.length === 3
            ? spin.symbols.slice(0, 3)
            : [this.getRandomSymbolIndex(), this.getRandomSymbolIndex(), this.getRandomSymbolIndex()];

        this.reels.forEach((reel, i) => {
            reel.targetStopPos = null;
            reel.speed = 0;
            reel.targetSymbolIndex = spinSymbols[i] ?? 0;

            // Timeline-based motion: accel → cruise → brake (with gentle overshoot)
            reel.t = 0;
            reel.phase = 'ACCEL';
            reel.accelDur = 18 + i * 4;
            reel.cruiseDur = 22 + i * 6;
            reel.brakeDur = 36 + i * 8;
            reel.maxSpeed = 70 + i * 8;
            reel.brakeStartPos = 0;
            reel.brakeTargetPos = 0;

            // Clear any previous win glow
            reel.symbols.forEach(s => {
                s.spriteObj.filters = [];
                s.spriteObj.scale.set(1);
                s.spriteObj.alpha = 1;
                s.spriteObj.tint = 0xFFFFFF;
            });
        });
    }

    updateReelLayout() {
        const maxY = this.NUM_SYMBOLS_PER_REEL * this.SYMBOL_SIZE;
        this.reels.forEach((reel) => {
            reel.symbols.forEach((symObj, j) => {
                let symY = (j * this.SYMBOL_SIZE) + reel.position;
                symY = ((symY + maxY/2) % maxY);
                if (symY < 0) symY += maxY;
                symY -= maxY/2;
                symObj.spriteObj.y = symY;
            });
        });
    }

    update(delta) {
        if (!this.isSpinning) return;

        // Normalize dt so motion doesn't depend on refresh rate
        const dt = Math.min(2.5, (this.app.ticker?.deltaMS ?? (delta * 16.6667)) / 16.6667);

        let allStopped = true;
        const maxY = this.NUM_SYMBOLS_PER_REEL * this.SYMBOL_SIZE;

        this.reels.forEach((reel) => {
            reel.t += dt;
            let advanceBySpeed = true;

            const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
            const easeOutBack = (x) => {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
            };

            if (reel.phase === 'ACCEL') {
                allStopped = false;
                const p = Math.min(1, reel.t / reel.accelDur);
                reel.speed = reel.maxSpeed * easeOutCubic(p);
                if (p >= 1) {
                    reel.phase = 'CRUISE';
                    reel.t = 0;
                }
            } else if (reel.phase === 'CRUISE') {
                allStopped = false;
                reel.speed = reel.maxSpeed;
                if (reel.t >= reel.cruiseDur) {
                    // Compute an exact landing position where target symbol hits payline center (y ~ 0)
                    const targetJ = reel.symbols.findIndex(s => s.visualIndex === reel.targetSymbolIndex);
                    const baseTargetPos = -targetJ * this.SYMBOL_SIZE;
                    let dist = (baseTargetPos - reel.position) % maxY;
                    if (dist <= 0) dist += maxY;

                    // Force extra loops so braking feels real
                    const extraLoops = 2;
                    reel.brakeStartPos = reel.position;
                    reel.brakeTargetPos = reel.position + dist + maxY * extraLoops;
                    reel.phase = 'BRAKE';
                    reel.t = 0;
                }
            } else if (reel.phase === 'BRAKE') {
                allStopped = false;
                const p = Math.min(1, reel.t / reel.brakeDur);
                const e = easeOutBack(p);
                const prevPos = reel.position;
                reel.position = reel.brakeStartPos + (reel.brakeTargetPos - reel.brakeStartPos) * e;
                // Derive speed for blur only; don't advance position again this frame
                reel.speed = (reel.position - prevPos) / Math.max(1e-6, dt);
                advanceBySpeed = false;
                if (p >= 1) {
                    reel.speed = 0;
                    reel.position = reel.brakeTargetPos;
                    reel.phase = 'STOPPED';
                }
            }

            if (reel.phase !== 'STOPPED') {
                if (advanceBySpeed) reel.position += reel.speed * dt;
                reel.blur.blurY = Math.abs(reel.speed) * 0.4;
                
                while (reel.position < 0) {
                    reel.position += maxY;
                    if (reel.brakeTargetPos !== null) reel.brakeTargetPos += maxY;
                }
            } else {
                reel.blur.blurY = 0;
            }
            
            if (reel.position > maxY * 50) {
                reel.position %= maxY;
                if (reel.brakeTargetPos) reel.brakeTargetPos = reel.position + (reel.brakeTargetPos % maxY);
            }
        });

        this.updateReelLayout();

        if (allStopped && this.isSpinning) {
            this.isSpinning = false;

            // Win VFX: glow + pulse on payline symbol(s)
            if (this.lastSpin?.isWin) {
                this.reels.forEach((reel) => {
                    // Find the symbol currently closest to the payline (y≈0)
                    let best = null;
                    for (const s of reel.symbols) {
                        const dy = Math.abs(s.spriteObj.y);
                        if (!best || dy < best.dy) best = { s, dy };
                    }
                    if (best) {
                        const sprite = best.s.spriteObj;
                        const filters = [];
                        if (PIXI.filters?.DropShadowFilter) {
                            const glow = new PIXI.filters.DropShadowFilter({
                                color: 0xFFD84D,
                                alpha: 0.9,
                                blur: 8,
                                distance: 0
                            });
                            filters.push(glow);
                        }
                        sprite.filters = filters;
                        sprite.tint = 0xFFF2A8;
                        // simple pulse
                        const baseScale = 1.0;
                        let pulseT = 0;
                        const pulse = (d) => {
                            pulseT += d;
                            const k = 1 + 0.06 * Math.sin(pulseT * 0.35);
                            sprite.scale.set(baseScale * k);
                            if (pulseT < 90) {
                                this.app.ticker.addOnce(pulse);
                            } else {
                                sprite.scale.set(1);
                            }
                        };
                        this.app.ticker.addOnce(pulse);
                    }
                });
            }

            if (this.onSpinComplete) this.onSpinComplete();
        }
    }
}

window.SlotRenderer = SlotRenderer;
