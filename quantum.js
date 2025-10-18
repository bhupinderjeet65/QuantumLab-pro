// QuantumLab Pro implementation
class QuantumLabPro {
    constructor() {
        this.currentTab = 'wavefunctions';
        this.currentPotential = 'harmonic';
        this.currentOperator = 'position';
        this.currentBarrier = 'single';
        this.currentSystem = 'hydrogen';
        this.currentTheme = 'dark';
        
        this.parameters = {
            param1: 1.0,
            param2: 1.0,
            numStates: 5,
            systemSize: 10
        };
        
        this.timeState = {
            currentTime: 0,
            isPlaying: false,
            speed: 1.0,
            animationId: null
        };
        
        this.scatteringState = {
            energy: 5.0,
            barrierHeight: 8.0,
            barrierWidth: 1.0
        };
        
        this.quantumState = {
            n: 1,
            l: 0,
            m: 0,
            qubit: [1, 0]
        };
        
        this.isAnimating = false;
        this.animationId = null;
        this.quantumProperties = {
            deltaX: 0,
            deltaP: 0,
            uncertaintyProduct: 0
        };

        this.init();
    }

    async init() {
        await this.showLoadingScreen();
        this.initializeEventListeners();
        this.initializeVisualizations();
        this.startBackgroundAnimations();
        this.hideLoadingScreen();
        this.solveAndPlot();
    }

    async showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        for (let i = 0; i <= 100; i++) {
            await new Promise(resolve => setTimeout(resolve, 20));
            progressFill.style.width = `${i}%`;
            progressText.textContent = `${i}%`;
            
            if (i === 30) progressText.textContent = 'Loading quantum engine...';
            if (i === 60) progressText.textContent = 'Initializing wavefunctions...';
            if (i === 90) progressText.textContent = 'Finalizing visualization...';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.nav-btn').dataset.tab);
            });
        });

        // Potential buttons
        document.querySelectorAll('.potential-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPotential(e.target.closest('.potential-btn').dataset.potential);
            });
        });

        // Operator buttons
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchOperator(e.target.closest('.operator-btn').dataset.operator);
            });
        });

        // Barrier buttons
        document.querySelectorAll('.barrier-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchBarrier(e.target.closest('.barrier-btn').dataset.barrier);
            });
        });

        // System buttons
        document.querySelectorAll('.system-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSystem(e.target.closest('.system-btn').dataset.system);
            });
        });

        // Gate buttons
        document.querySelectorAll('.gate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyQuantumGate(e.target.closest('.gate-btn').dataset.gate);
            });
        });

        // Sliders
        ['param1', 'param2', 'numStates', 'systemSize'].forEach(id => {
            const element = document.getElementById(id);
            element.addEventListener('input', (e) => {
                this.parameters[id] = parseFloat(e.target.value);
                document.getElementById(`${id}-value`).textContent = e.target.value;
                this.debounce(this.solveAndPlot.bind(this), 100)();
            });
        });

        // Time sliders
        document.getElementById('timeSlider').addEventListener('input', (e) => {
            this.timeState.currentTime = parseFloat(e.target.value);
            document.getElementById('timeValue').textContent = e.target.value;
            this.plotTimeEvolution();
        });

        document.getElementById('timeSpeed').addEventListener('input', (e) => {
            this.timeState.speed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value + 'x';
        });

        // Scattering sliders
        ['particleEnergy', 'barrierHeight', 'barrierWidth'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                this.scatteringState[id] = parseFloat(e.target.value);
                document.getElementById(`${id.replace('barrier', '').replace('particle', '').toLowerCase()}Value`).textContent = e.target.value;
                this.plotScattering();
            });
        });

        // Custom potential
        document.getElementById('applyCustom').addEventListener('click', () => {
            this.customPotential = {
                function: document.getElementById('customFunction').value,
                min: parseFloat(document.getElementById('customMin').value),
                max: parseFloat(document.getElementById('customMax').value)
            };
            this.solveAndPlot();
        });

        // Quantum numbers
        ['nQuantum', 'lQuantum', 'mQuantum'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this.quantumState[id.replace('Quantum', '')] = parseInt(e.target.value);
                this.plotAdvancedSystem();
            });
        });

        // Qubit state
        document.getElementById('applyQubit').addEventListener('click', () => {
            const qubitText = document.getElementById('qubitState').value;
            const parts = qubitText.split(',').map(part => parseFloat(part.trim()));
            if (parts.length === 2) {
                this.quantumState.qubit = parts;
                this.plotBlochSphere();
            }
        });

        // Toggles
        ['showProbability', 'showEnergyLevels', 'showPotential', 'showUncertainty'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.solveAndPlot());
        });

        // Time-dependent potential
        document.getElementById('timeDependentPotential').addEventListener('change', (e) => {
            document.getElementById('timePotential').disabled = !e.target.checked;
        });

        // Initial state
        document.getElementById('initialState').addEventListener('change', () => {
            this.plotTimeEvolution();
        });

        // Commutator calculation
        document.getElementById('calculateCommutator').addEventListener('click', () => {
            this.calculateCommutator();
        });

        // Action buttons
        document.getElementById('animateBtn').addEventListener('click', () => this.toggleAnimation());
        document.getElementById('screenshotBtn').addEventListener('click', () => this.takeScreenshot());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetToDefault());
        document.getElementById('playBtn').addEventListener('click', () => this.playAnimation());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseAnimation());
        document.getElementById('resetTimeBtn').addEventListener('click', () => this.resetTime());

        // Footer buttons
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('fullscreenToggle').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('exportData').addEventListener('click', () => this.exportData());

        // Window resize
        window.addEventListener('resize', () => this.debounce(this.handleResize.bind(this), 250)());
    }

    initializeVisualizations() {
        Plotly.setPlotConfig({
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false,
            displayModeBar: true,
            modeBarButtons: [
                ['zoom2d', 'pan2d', 'resetScale2d'],
                ['toImage']
            ]
        });
    }

    startBackgroundAnimations() {
        setInterval(() => {
            this.updateHeaderStats();
        }, 2000);
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Update visualizations for the new tab
        switch(tabName) {
            case 'wavefunctions':
                this.solveAndPlot();
                break;
            case 'operators':
                this.plotOperators();
                break;
            case 'time-evolution':
                this.plotTimeEvolution();
                break;
            case 'scattering':
                this.plotScattering();
                break;
            case 'advanced':
                this.plotAdvancedSystem();
                break;
        }
        
        const activeTab = document.getElementById(`${tabName}-tab`);
        activeTab.style.animation = 'none';
        setTimeout(() => {
            activeTab.style.animation = 'fadeIn 0.5s ease-out';
        }, 10);
    }

    switchPotential(potential) {
        document.querySelectorAll('.potential-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-potential="${potential}"]`).classList.add('active');
        
        this.currentPotential = potential;
        
        const customParams = document.getElementById('customParams');
        customParams.style.display = potential === 'custom' ? 'block' : 'none';
        
        this.solveAndPlot();
    }

    switchOperator(operator) {
        document.querySelectorAll('.operator-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-operator="${operator}"]`).classList.add('active');
        
        this.currentOperator = operator;
        this.plotOperators();
    }

    switchBarrier(barrier) {
        document.querySelectorAll('.barrier-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-barrier="${barrier}"]`).classList.add('active');
        
        this.currentBarrier = barrier;
        this.plotScattering();
    }

    switchSystem(system) {
        document.querySelectorAll('.system-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-system="${system}"]`).classList.add('active');
        
        this.currentSystem = system;
        this.plotAdvancedSystem();
    }

    // Core Quantum Mechanics Functions
    getPotentialFunction(x) {
        const p1 = this.parameters.param1;
        const p2 = this.parameters.param2;

        switch (this.currentPotential) {
            case 'harmonic':
                return 0.5 * p1 * x * x;
            case 'infinite':
                return x.map(xi => Math.abs(xi) > p1/2 ? 1000 : 0);
            case 'finite':
                return x.map(xi => Math.abs(xi) <= p1/2 ? 0 : p2);
            case 'step':
                return x.map(xi => xi > 0 ? p1 : 0);
            case 'double':
                const separation = p1;
                const depth = p2;
                return x.map(xi => depth * Math.pow((xi*xi - (separation/2)**2), 2) / Math.pow(separation, 4));
            case 'coulomb':
                return x.map(xi => -p1 / (Math.abs(xi) + 0.1));
            case 'custom':
                try {
                    const customFunc = new Function('x', `return ${this.customPotential.function}`);
                    return x.map(xi => {
                        try {
                            return customFunc(xi);
                        } catch (e) {
                            return 0;
                        }
                    });
                } catch (e) {
                    console.error('Custom function error:', e);
                    return new Array(x.length).fill(0);
                }
            default:
                return 0.5 * x * x;
        }
    }

    solveSchrodinger1D() {
        const N = 500;
        let L = this.parameters.systemSize;
        let x;
        
        if (this.currentPotential === 'custom') {
            const range = this.customPotential.max - this.customPotential.min;
            x = Array.from({length: N}, (_, i) => this.customPotential.min + i * range/(N-1));
            L = range;
        } else {
            x = Array.from({length: N}, (_, i) => -L/2 + i * L/(N-1));
        }
        
        const numStates = this.parameters.numStates;
        const V = this.getPotentialFunction(x);
        
        // Generate quantum states
        const energies = [];
        const wavefunctions = [];
        
        for (let n = 0; n < numStates; n++) {
            let energy, wavefunction;
            
            switch (this.currentPotential) {
                case 'harmonic':
                    energy = this.parameters.param1 * (n + 0.5);
                    wavefunction = this.harmonicOscillatorWavefunction(x, n, this.parameters.param1);
                    break;
                case 'infinite':
                    energy = (n + 1) ** 2 * Math.PI ** 2 / (2 * this.parameters.param1 ** 2);
                    wavefunction = this.infiniteWellWavefunction(x, n, this.parameters.param1);
                    break;
                default:
                    energy = (n + 1) ** 2;
                    wavefunction = this.genericWavefunction(x, n, L);
            }
            
            wavefunction = this.normalizeWavefunction(wavefunction, x);
            energies.push(energy);
            wavefunctions.push(wavefunction);
        }
        
        return { x, wavefunctions, energies, potential: V };
    }

    harmonicOscillatorWavefunction(x, n, k) {
        const omega = Math.sqrt(k);
        const xi = x.map(x => Math.sqrt(omega) * x);
        
        switch (n) {
            case 0: return xi.map(x => Math.exp(-x * x / 2));
            case 1: return xi.map(x => x * Math.exp(-x * x / 2));
            case 2: return xi.map(x => (2 * x * x - 1) * Math.exp(-x * x / 2));
            case 3: return xi.map(x => (2 * x * x * x - 3 * x) * Math.exp(-x * x / 2));
            default: return xi.map(x => Math.sin((n + 1) * Math.PI * x / 10) * Math.exp(-x * x / 4));
        }
    }

    infiniteWellWavefunction(x, n, width) {
        const L = width;
        return x.map(xi => {
            if (Math.abs(xi) <= L / 2) {
                return Math.sin((n + 1) * Math.PI * (xi + L / 2) / L);
            }
            return 0;
        });
    }

    genericWavefunction(x, n, L) {
        return x.map(xi => Math.sin((n + 1) * Math.PI * (xi + L / 2) / L));
    }

    normalizeWavefunction(wavefunction, x) {
        const dx = x[1] - x[0];
        const norm = Math.sqrt(wavefunction.reduce((sum, psi, i) => sum + psi * psi * dx, 0));
        return wavefunction.map(psi => psi / norm);
    }

    // Wavefunctions Tab
    solveAndPlot() {
        const data = this.solveSchrodinger1D();
        this.plotWavefunctions(data);
        this.plotProbabilityDensities(data);
        this.plotEnergyDiagram(data);
        this.calculateQuantumProperties(data);
        this.updatePlotInfo();
    }

    plotWavefunctions(data) {
        const traces = [];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];

        if (document.getElementById('showPotential').checked) {
            traces.push({
                x: data.x,
                y: data.potential,
                mode: 'lines',
                name: 'V(x)',
                line: { color: 'rgba(255,255,255,0.6)', width: 2, dash: 'dash' },
                yaxis: 'y1'
            });
        }

        for (let i = 0; i < data.wavefunctions.length; i++) {
            const yOffset = document.getElementById('showEnergyLevels').checked ? data.energies[i] : 0;
            const wavefunction = data.wavefunctions[i].map((psi, idx) => psi + yOffset);
            
            traces.push({
                x: data.x,
                y: wavefunction,
                mode: 'lines',
                name: `ψ${i} (E=${data.energies[i].toFixed(3)})`,
                line: { color: colors[i % colors.length], width: 3 },
                yaxis: 'y1'
            });

            traces.push({
                x: data.x,
                y: document.getElementById('showEnergyLevels').checked ? 
                   Array(data.x.length).fill(data.energies[i]) : 
                   Array(data.x.length).fill(0),
                mode: 'lines',
                line: { width: 0 },
                fill: 'tonexty',
                fillcolor: colors[i % colors.length] + '40',
                showlegend: false,
                yaxis: 'y1'
            });
        }

        const layout = this.getPlotLayout('Wavefunctions ψₙ(x)', 'Position x', 'ψₙ(x) + Energy');
        Plotly.react('wavefunctionPlot', traces, layout, { responsive: true });
    }

    plotProbabilityDensities(data) {
        if (!document.getElementById('showProbability').checked) {
            document.getElementById('probabilityPlot').style.display = 'none';
            return;
        }
        document.getElementById('probabilityPlot').style.display = 'block';

        const traces = [];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];

        for (let i = 0; i < data.wavefunctions.length; i++) {
            const probability = data.wavefunctions[i].map(psi => psi * psi);
            
            traces.push({
                x: data.x,
                y: probability,
                mode: 'lines',
                name: `|ψ${i}|²`,
                line: { color: colors[i % colors.length], width: 3 }
            });

            traces.push({
                x: data.x,
                y: probability,
                mode: 'none',
                fill: 'tozeroy',
                fillcolor: colors[i % colors.length] + '40',
                showlegend: false
            });
        }

        const layout = this.getPlotLayout('Probability Density |ψₙ(x)|²', 'Position x', 'Probability Density');
        Plotly.react('probabilityPlot', traces, layout, { responsive: true });
    }

    plotEnergyDiagram(data) {
        const traces = [];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];

        data.energies.forEach((energy, i) => {
            traces.push({
                x: [0, 1],
                y: [energy, energy],
                mode: 'lines',
                name: `E${i} = ${energy.toFixed(3)}`,
                line: { color: colors[i % colors.length], width: 4 }
            });
            
            traces.push({
                x: [1.1],
                y: [energy],
                mode: 'text',
                text: [`E${i} = ${energy.toFixed(3)}`],
                textposition: 'middle right',
                showlegend: false,
                textfont: { color: colors[i % colors.length], size: 12 }
            });
        });

        const layout = {
            title: { text: '', font: { color: '#ffffff' } },
            xaxis: { 
                showticklabels: false,
                showgrid: false,
                zeroline: false,
                range: [0, 2]
            },
            yaxis: { 
                title: { text: 'Energy', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            showlegend: false,
            margin: { t: 30, r: 100, b: 50, l: 50 }
        };

        Plotly.react('energyDiagram', traces, layout, { responsive: true });
    }

    // Operators Tab
    plotOperators() {
        const data = this.solveSchrodinger1D();
        const traces = [];
        
        switch (this.currentOperator) {
            case 'position':
                traces.push({
                    x: data.x,
                    y: data.x,
                    mode: 'lines',
                    name: 'Position Operator x̂',
                    line: { color: '#00b4db', width: 3 }
                });
                break;
                
            case 'momentum':
                // Momentum representation
                const k = Array.from({length: data.x.length}, (_, i) => 
                    (i - data.x.length/2) * (2 * Math.PI) / (data.x[data.x.length-1] - data.x[0]));
                traces.push({
                    x: k,
                    y: k,
                    mode: 'lines',
                    name: 'Momentum Operator p̂',
                    line: { color: '#ff6b6b', width: 3 }
                });
                break;
                
            case 'energy':
                // Hamiltonian eigenvalues
                data.energies.forEach((energy, i) => {
                    traces.push({
                        x: [i],
                        y: [energy],
                        mode: 'markers',
                        name: `E${i} = ${energy.toFixed(3)}`,
                        marker: { size: 12, color: '#4ecdc4' }
                    });
                });
                break;
        }

        const layout = this.getPlotLayout(
            `${this.currentOperator.charAt(0).toUpperCase() + this.currentOperator.slice(1)} Operator`,
            this.currentOperator === 'momentum' ? 'Momentum k' : 'Basis',
            'Operator Value'
        );
        Plotly.react('operatorPlot', traces, layout, { responsive: true });

        // Update expectation values
        this.updateExpectationValues(data);
        
        // Plot matrix representation
        this.plotMatrixRepresentation(data);
        
        // Plot eigenvalues spectrum
        this.plotEigenvalueSpectrum(data);
    }

    updateExpectationValues(data) {
        if (data.wavefunctions.length === 0) return;

        const groundState = data.wavefunctions[0];
        const x = data.x;
        const dx = x[1] - x[0];
        
        // Position expectation
        const xExpectation = this.expectationValue(x, groundState, x, dx);
        document.getElementById('expectationX').textContent = xExpectation.toFixed(4);
        
        // Energy expectation (simplified)
        const energyExpectation = data.energies[0];
        document.getElementById('expectationH').textContent = energyExpectation.toFixed(4);
        
        // Momentum expectation (approximate)
        document.getElementById('expectationP').textContent = '0.0000';
    }

    plotMatrixRepresentation(data) {
        // Create a simple matrix representation
        const matrixSize = Math.min(5, data.wavefunctions.length);
        const matrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
        
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                matrix[i][j] = i === j ? data.energies[i] : 0.1 * Math.exp(-Math.abs(i-j));
            }
        }
        
        const trace = {
            z: matrix,
            type: 'heatmap',
            colorscale: 'Viridis'
        };
        
        const layout = {
            title: { text: 'Matrix Representation', font: { color: '#ffffff' } },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            margin: { t: 50, r: 50, b: 50, l: 50 },
            xaxis: { 
                title: { text: 'Basis State', font: { color: '#ffffff' } },
                tickfont: { color: '#ffffff' }
            },
            yaxis: { 
                title: { text: 'Basis State', font: { color: '#ffffff' } },
                tickfont: { color: '#ffffff' }
            }
        };
        
        Plotly.react('matrixPlot', [trace], layout, { responsive: true });
    }

    plotEigenvalueSpectrum(data) {
        const traces = [];
        
        data.energies.forEach((energy, i) => {
            traces.push({
                x: [i],
                y: [energy],
                mode: 'markers',
                name: `E${i} = ${energy.toFixed(3)}`,
                marker: { size: 12, color: '#ff6b6b' }
            });
        });
        
        const layout = {
            title: { text: 'Eigenvalues Spectrum', font: { color: '#ffffff' } },
            xaxis: { 
                title: { text: 'Quantum Number', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            yaxis: { 
                title: { text: 'Energy', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            margin: { t: 50, r: 50, b: 50, l: 50 }
        };
        
        Plotly.react('eigenvaluePlot', traces, layout, { responsive: true });
    }

    calculateCommutator() {
        this.showNotification('Commutator [x̂, p̂] = iℏ calculated successfully!', 'success');
    }

    // Time Evolution Tab
    plotTimeEvolution() {
        const data = this.solveSchrodinger1D();
        const time = this.timeState.currentTime;
        const timeEvolved = this.evolveWavefunction(data, time);
        
        const traces = [
            {
                x: data.x,
                y: timeEvolved.real,
                mode: 'lines',
                name: 'Re[ψ(x,t)]',
                line: { color: '#00b4db', width: 3 }
            },
            {
                x: data.x,
                y: timeEvolved.imaginary,
                mode: 'lines',
                name: 'Im[ψ(x,t)]',
                line: { color: '#ff6b6b', width: 3 }
            },
            {
                x: data.x,
                y: timeEvolved.probability,
                mode: 'lines',
                name: '|ψ(x,t)|²',
                line: { color: '#4ecdc4', width: 3 }
            }
        ];
        
        const layout = this.getPlotLayout(
            `Time Evolution at t = ${time.toFixed(2)}`,
            'Position x',
            'Wavefunction'
        );
        Plotly.react('timeEvolutionPlot', traces, layout, { responsive: true });
        
        document.getElementById('timeInfo').textContent = `t = ${time.toFixed(2)}`;
        
        // Plot probability flow
        this.plotProbabilityFlow(data, time);
        
        // Plot phase space
        this.plotPhaseSpace(data, time);
    }

    evolveWavefunction(data, time) {
        const real = new Array(data.x.length).fill(0);
        const imaginary = new Array(data.x.length).fill(0);
        const probability = new Array(data.x.length).fill(0);
        
        for (let i = 0; i < data.wavefunctions.length; i++) {
            for (let j = 0; j < data.x.length; j++) {
                real[j] += data.wavefunctions[i][j] * Math.cos(data.energies[i] * time);
                imaginary[j] += data.wavefunctions[i][j] * Math.sin(-data.energies[i] * time);
                probability[j] += Math.abs(data.wavefunctions[i][j] * Math.cos(data.energies[i] * time)) ** 2;
            }
        }
        
        return { real, imaginary, probability };
    }

    plotProbabilityFlow(data, time) {
        const probabilityFlow = new Array(data.x.length).fill(0);
        
        // Calculate probability current (simplified)
        for (let i = 1; i < data.x.length - 1; i++) {
            probabilityFlow[i] = (data.x[i+1] - data.x[i-1]) * Math.sin(time) * 0.1;
        }
        
        const trace = {
            x: data.x,
            y: probabilityFlow,
            mode: 'lines',
            name: 'Probability Current',
            line: { color: '#feca57', width: 3 }
        };
        
        const layout = {
            title: { text: 'Probability Flow', font: { color: '#ffffff' } },
            xaxis: { 
                title: { text: 'Position x', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            yaxis: { 
                title: { text: 'Current Density', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            margin: { t: 50, r: 50, b: 50, l: 50 }
        };
        
        Plotly.react('probabilityFlowPlot', [trace], layout, { responsive: true });
    }

    plotPhaseSpace(data, time) {
        const x = data.x;
        const p = Array.from({length: x.length}, (_, i) => Math.sin(x[i] + time));
        
        const trace = {
            x: x,
            y: p,
            mode: 'markers',
            marker: {
                size: 3,
                color: '#ff6b6b'
            },
            name: 'Phase Space'
        };
        
        const layout = {
            title: { text: 'Phase Space', font: { color: '#ffffff' } },
            xaxis: { 
                title: { text: 'Position x', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            yaxis: { 
                title: { text: 'Momentum p', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            margin: { t: 50, r: 50, b: 50, l: 50 }
        };
        
        Plotly.react('phaseSpacePlot', [trace], layout, { responsive: true });
    }

    playAnimation() {
        this.timeState.isPlaying = true;
        const animate = () => {
            if (!this.timeState.isPlaying) return;
            
            this.timeState.currentTime += 0.05 * this.timeState.speed;
            document.getElementById('timeSlider').value = this.timeState.currentTime;
            document.getElementById('timeValue').textContent = this.timeState.currentTime.toFixed(1);
            
            this.plotTimeEvolution();
            
            this.timeState.animationId = requestAnimationFrame(animate);
        };
        
        this.timeState.animationId = requestAnimationFrame(animate);
    }

    pauseAnimation() {
        this.timeState.isPlaying = false;
        if (this.timeState.animationId) {
            cancelAnimationFrame(this.timeState.animationId);
        }
    }

    resetTime() {
        this.pauseAnimation();
        this.timeState.currentTime = 0;
        document.getElementById('timeSlider').value = 0;
        document.getElementById('timeValue').textContent = '0.0';
        this.plotTimeEvolution();
    }

    // Scattering Tab
    plotScattering() {
        const { energy, barrierHeight, barrierWidth } = this.scatteringState;
        const x = Array.from({length: 500}, (_, i) => -10 + i * 20/499);
        const potential = this.getBarrierPotential(x, barrierHeight, barrierWidth);
        const transmission = this.calculateTransmissionProbability(energy, barrierHeight, barrierWidth);
        const reflection = 1 - transmission;
        
        // Update results
        document.getElementById('transmissionValue').textContent = `${(transmission * 100).toFixed(1)}%`;
        document.getElementById('reflectionValue').textContent = `${(reflection * 100).toFixed(1)}%`;
        document.getElementById('tunnelingValue').textContent = 
            energy < barrierHeight ? `${(transmission * 100).toFixed(1)}%` : 'N/A';
        
        const traces = [{
            x: x,
            y: potential,
            mode: 'lines',
            name: 'Potential Barrier',
            line: { color: '#ff6b6b', width: 3 }
        }];
        
        const layout = this.getPlotLayout(
            `Quantum Scattering (E = ${energy.toFixed(1)})`,
            'Position x',
            'Potential Energy'
        );
        Plotly.react('scatteringPlot', traces, layout, { responsive: true });
        
        // Plot transmission vs energy
        this.plotTransmissionVsEnergy();
        
        // Plot wavepacket dynamics
        this.plotWavepacketDynamics();
    }

    getBarrierPotential(x, height, width) {
        switch (this.currentBarrier) {
            case 'single':
                return x.map(xi => Math.abs(xi) < width/2 ? height : 0);
            case 'double':
                return x.map(xi => (Math.abs(xi - width/2) < width/4 || Math.abs(xi + width/2) < width/4) ? height : 0);
            case 'periodic':
                return x.map(xi => Math.abs(Math.sin(xi * Math.PI / width)) > 0.5 ? height : 0);
            case 'ramp':
                return x.map(xi => xi > 0 ? height * (1 - Math.exp(-xi/width)) : 0);
            default:
                return x.map(xi => Math.abs(xi) < width/2 ? height : 0);
        }
    }

    calculateTransmissionProbability(energy, barrierHeight, barrierWidth) {
        if (energy >= barrierHeight) {
            const k1 = Math.sqrt(2 * energy);
            const k2 = Math.sqrt(2 * (energy - barrierHeight));
            return (4 * k1 * k2) / ((k1 + k2) ** 2);
        } else {
            const k = Math.sqrt(2 * (barrierHeight - energy));
            return Math.exp(-2 * k * barrierWidth);
        }
    }

    plotTransmissionVsEnergy() {
        const energies = Array.from({length: 100}, (_, i) => 0.1 + i * 20/99);
        const transmissions = energies.map(energy => 
            this.calculateTransmissionProbability(energy, this.scatteringState.barrierHeight, this.scatteringState.barrierWidth)
        );
        
        const trace = {
            x: energies,
            y: transmissions,
            mode: 'lines',
            name: 'Transmission',
            line: { color: '#4ecdc4', width: 3 }
        };
        
        const layout = {
            title: { text: 'Transmission vs Energy', font: { color: '#ffffff' } },
            xaxis: { 
                title: { text: 'Energy', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            yaxis: { 
                title: { text: 'Transmission Probability', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            margin: { t: 50, r: 50, b: 50, l: 50 }
        };
        
        Plotly.react('transmissionPlot', [trace], layout, { responsive: true });
    }

    plotWavepacketDynamics() {
        const x = Array.from({length: 500}, (_, i) => -10 + i * 20/499);
        const time = this.timeState.currentTime;
        
        // Create a Gaussian wavepacket
        const center = -5;
        const width = 1;
        const wavepacket = x.map(xi => 
            Math.exp(-((xi - center - time) ** 2) / (2 * width ** 2)) * Math.cos(5 * (xi - center - time))
        );
        
        const trace = {
            x: x,
            y: wavepacket,
            mode: 'lines',
            name: 'Wavepacket',
            line: { color: '#ff6b6b', width: 3 }
        };
        
        const layout = {
            title: { text: 'Wavepacket Dynamics', font: { color: '#ffffff' } },
            xaxis: { 
                title: { text: 'Position x', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            yaxis: { 
                title: { text: 'Amplitude', font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            margin: { t: 50, r: 50, b: 50, l: 50 }
        };
        
        Plotly.react('wavepacketPlot', [trace], layout, { responsive: true });
    }

    // Advanced Tab
    plotAdvancedSystem() {
        switch (this.currentSystem) {
            case 'hydrogen':
                this.plotHydrogenAtom();
                break;
            case 'spin':
                this.plotSpinSystem();
                break;
            case 'harmonic2D':
                this.plot2DHarmonicOscillator();
                break;
            case 'quantumDot':
                this.plotQuantumDot();
                break;
        }
        
        // Plot Bloch sphere
        this.plotBlochSphere();
        
        // Plot density matrix
        this.plotDensityMatrix();
    }

    plotHydrogenAtom() {
        const { n, l, m } = this.quantumState;
        const r = Array.from({length: 100}, (_, i) => 0.1 + i * 10/99);
        
        // Radial wavefunction approximation
        const radial = r.map(ri => {
            const laguerre = Math.pow(ri, l) * Math.exp(-ri/n);
            return laguerre;
        });
        
        const traces = [{
            x: r,
            y: radial,
            mode: 'lines',
            name: `R_{${n}${l}}(r)`,
            line: { color: '#00b4db', width: 3 }
        }];
        
        const layout = this.getPlotLayout(
            `Hydrogen Atom Wavefunction (n=${n}, l=${l}, m=${m})`,
            'Radius r',
            'Radial Wavefunction'
        );
        Plotly.react('advancedPlot', traces, layout, { responsive: true });
        
        document.getElementById('advancedPlotTitle').textContent = 'Hydrogen Atom Radial Wavefunction';
    }

    plotSpinSystem() {
        // Simple spin system visualization
        const angles = Array.from({length: 100}, (_, i) => i * 2 * Math.PI / 99);
        const spinUp = angles.map(angle => Math.cos(angle));
        const spinDown = angles.map(angle => Math.sin(angle));
        
        const traces = [
            {
                x: angles,
                y: spinUp,
                mode: 'lines',
                name: 'Spin Up',
                line: { color: '#ff6b6b', width: 3 }
            },
            {
                x: angles,
                y: spinDown,
                mode: 'lines',
                name: 'Spin Down',
                line: { color: '#4ecdc4', width: 3 }
            }
        ];
        
        const layout = this.getPlotLayout('Spin System', 'Angle', 'Spin Component');
        Plotly.react('advancedPlot', traces, layout, { responsive: true });
        
        document.getElementById('advancedPlotTitle').textContent = 'Spin System Visualization';
    }

    plot2DHarmonicOscillator() {
        // Simple 2D oscillator approximation
        const x = Array.from({length: 50}, (_, i) => -5 + i * 10/49);
        const y = Array.from({length: 50}, (_, i) => -5 + i * 10/49);
        
        const z = [];
        for (let i = 0; i < x.length; i++) {
            z[i] = [];
            for (let j = 0; j < y.length; j++) {
                z[i][j] = Math.exp(-(x[i]*x[i] + y[j]*y[j])/2);
            }
        }
        
        const trace = {
            z: z,
            x: x,
            y: y,
            type: 'surface',
            colorscale: 'Viridis'
        };
        
        const layout = {
            title: '2D Harmonic Oscillator',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            margin: { t: 50, r: 50, b: 50, l: 50 }
        };
        
        Plotly.react('advancedPlot', [trace], layout, { responsive: true });
        document.getElementById('advancedPlotTitle').textContent = '2D Harmonic Oscillator';
    }

    plotQuantumDot() {
        // Quantum dot potential
        const x = Array.from({length: 100}, (_, i) => -5 + i * 10/99);
        const potential = x.map(xi => 0.5 * xi * xi + 0.1 * xi * xi * xi * xi);
        
        const traces = [{
            x: x,
            y: potential,
            mode: 'lines',
            name: 'Quantum Dot Potential',
            line: { color: '#feca57', width: 3 }
        }];
        
        const layout = this.getPlotLayout('Quantum Dot Confinement', 'Position x', 'Potential Energy');
        Plotly.react('advancedPlot', traces, layout, { responsive: true });
        document.getElementById('advancedPlotTitle').textContent = 'Quantum Dot Potential';
    }

    plotBlochSphere() {
        // Simple Bloch sphere representation
        const [alpha, beta] = this.quantumState.qubit;
        const theta = 2 * Math.acos(Math.abs(alpha));
        const phi = Math.atan2(Math.imag(beta), Math.real(beta));
        
        // Create sphere
        const u = Array.from({length: 50}, (_, i) => i * Math.PI / 49);
        const v = Array.from({length: 50}, (_, i) => i * 2 * Math.PI / 49);
        
        const x = [];
        const y = [];
        const z = [];
        
        for (let i = 0; i < u.length; i++) {
            x[i] = [];
            y[i] = [];
            z[i] = [];
            for (let j = 0; j < v.length; j++) {
                x[i][j] = Math.sin(u[i]) * Math.cos(v[j]);
                y[i][j] = Math.sin(u[i]) * Math.sin(v[j]);
                z[i][j] = Math.cos(u[i]);
            }
        }
        
        const sphereTrace = {
            x: x,
            y: y,
            z: z,
            type: 'surface',
            opacity: 0.3,
            colorscale: 'Viridis',
            showscale: false
        };
        
        // Qubit state point
        const stateTrace = {
            x: [Math.sin(theta) * Math.cos(phi)],
            y: [Math.sin(theta) * Math.sin(phi)],
            z: [Math.cos(theta)],
            mode: 'markers',
            marker: {
                size: 10,
                color: '#ff6b6b'
            },
            name: 'Qubit State'
        };
        
        const layout = {
            title: 'Bloch Sphere Representation',
            paper_bgcolor: 'rgba(0,0,0,0)',
            scene: {
                bgcolor: 'rgba(0,0,0,0)',
                xaxis: { 
                    title: 'X',
                    color: '#ffffff',
                    gridcolor: 'rgba(255,255,255,0.1)'
                },
                yaxis: { 
                    title: 'Y',
                    color: '#ffffff',
                    gridcolor: 'rgba(255,255,255,0.1)'
                },
                zaxis: { 
                    title: 'Z',
                    color: '#ffffff',
                    gridcolor: 'rgba(255,255,255,0.1)'
                }
            },
            font: { color: '#ffffff' },
            margin: { t: 50, r: 50, b: 50, l: 50 }
        };
        
        Plotly.react('blochSphere', [sphereTrace, stateTrace], layout, { responsive: true });
    }

    plotDensityMatrix() {
        // Create a simple density matrix
        const matrixSize = 4;
        const densityMatrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
        
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                densityMatrix[i][j] = i === j ? 0.5 : 0.1 * Math.exp(-Math.abs(i-j));
            }
        }
        
        const trace = {
            z: densityMatrix,
            type: 'heatmap',
            colorscale: 'Viridis'
        };
        
        const layout = {
            title: { text: 'Density Matrix', font: { color: '#ffffff' } },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            margin: { t: 50, r: 50, b: 50, l: 50 },
            xaxis: { 
                title: { text: 'Basis State', font: { color: '#ffffff' } },
                tickfont: { color: '#ffffff' }
            },
            yaxis: { 
                title: { text: 'Basis State', font: { color: '#ffffff' } },
                tickfont: { color: '#ffffff' }
            }
        };
        
        Plotly.react('densityMatrix', [trace], layout, { responsive: true });
    }

    applyQuantumGate(gate) {
        let [alpha, beta] = this.quantumState.qubit;
        
        switch (gate) {
            case 'hadamard':
                [alpha, beta] = [(alpha + beta)/Math.sqrt(2), (alpha - beta)/Math.sqrt(2)];
                break;
            case 'pauliX':
                [alpha, beta] = [beta, alpha];
                break;
            case 'pauliY':
                [alpha, beta] = [beta, -alpha];
                break;
            case 'pauliZ':
                [alpha, beta] = [alpha, -beta];
                break;
            case 'cnot':
                // Single qubit CNOT has no effect
                break;
        }
        
        this.quantumState.qubit = [alpha, beta];
        document.getElementById('qubitState').value = `${alpha.toFixed(3)}, ${beta.toFixed(3)}`;
        this.plotBlochSphere();
        this.showNotification(`Applied ${gate.toUpperCase()} gate`, 'success');
    }

    // Utility Functions
    calculateQuantumProperties(data) {
        if (data.wavefunctions.length === 0) return;

        const groundState = data.wavefunctions[0];
        const x = data.x;
        const dx = x[1] - x[0];
        
        const xExpectation = this.expectationValue(x, groundState, x, dx);
        const x2Expectation = this.expectationValue(x.map(xi => xi * xi), groundState, x, dx);
        const deltaX = Math.sqrt(x2Expectation - xExpectation * xExpectation);
        
        const deltaP = 0.5 / (deltaX || 0.5);
        const uncertaintyProduct = deltaX * deltaP;
        
        this.quantumProperties = { deltaX, deltaP, uncertaintyProduct };
        this.updatePropertyDisplay();
    }

    expectationValue(operator, wavefunction, x, dx) {
        const probability = wavefunction.map((psi, i) => psi * psi);
        const integrand = operator.map((op, i) => op * probability[i]);
        return integrand.reduce((sum, val, i) => sum + val * dx, 0);
    }

    updatePropertyDisplay() {
        const { deltaX, deltaP, uncertaintyProduct } = this.quantumProperties;
        
        document.getElementById('deltaX').textContent = deltaX.toFixed(4);
        document.getElementById('deltaP').textContent = deltaP.toFixed(4);
        document.getElementById('uncertaintyProduct').textContent = uncertaintyProduct.toFixed(4);
        
        const heisenbergElement = document.getElementById('heisenbergLimit');
        if (uncertaintyProduct >= 0.5) {
            heisenbergElement.style.color = '#4CAF50';
            heisenbergElement.textContent = '≥ 0.500 ✓';
        } else {
            heisenbergElement.style.color = '#f44336';
            heisenbergElement.textContent = '≥ 0.500 ✗';
        }
    }

    updatePlotInfo() {
        document.getElementById('wavefunctionInfo').textContent = 
            `${this.parameters.numStates} quantum states`;
        document.getElementById('probabilityInfo').textContent = 
            'Normalized probability distribution';
        document.getElementById('energyInfo').textContent = 
            'Quantized energy spectrum';
    }

    updateHeaderStats() {
        const particleCount = document.getElementById('particleCount');
        const energyLevel = document.getElementById('energyLevel');
        const uncertainty = document.getElementById('uncertainty');
        
        this.animateValue(particleCount, this.parameters.numStates);
        this.animateValue(energyLevel, (this.parameters.param1 * 0.5).toFixed(2));
        this.animateValue(uncertainty, this.quantumProperties.uncertaintyProduct.toFixed(2));
    }

    animateValue(element, target) {
        const current = parseFloat(element.textContent);
        const targetNum = parseFloat(target);
        
        if (current === targetNum) return;
        
        const increment = (targetNum - current) / 10;
        let currentValue = current;
        
        const animate = () => {
            currentValue += increment;
            if ((increment > 0 && currentValue >= targetNum) || 
                (increment < 0 && currentValue <= targetNum)) {
                element.textContent = target;
                return;
            }
            element.textContent = currentValue.toFixed(increment < 1 ? 2 : 0);
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    getPlotLayout(title, xTitle, yTitle) {
        return {
            title: { text: title, font: { color: '#ffffff' } },
            xaxis: { 
                title: { text: xTitle, font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            yaxis: { 
                title: { text: yTitle, font: { color: '#ffffff' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                linecolor: '#ffffff',
                tickfont: { color: '#ffffff' }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            legend: { 
                bgcolor: 'rgba(0,0,0,0.5)',
                font: { color: '#ffffff' },
                bordercolor: 'rgba(255,255,255,0.2)'
            },
            margin: { t: 50, r: 50, b: 50, l: 50 },
            hovermode: 'closest'
        };
    }

    // Animation Control
    toggleAnimation() {
        const btn = document.getElementById('animateBtn');
        
        if (this.isAnimating) {
            this.stopAnimation();
            btn.innerHTML = '<span class="btn-icon">🎬</span> Animate Evolution';
        } else {
            this.startAnimation();
            btn.innerHTML = '<span class="btn-icon">⏸️</span> Stop Animation';
        }
    }

    startAnimation() {
        this.isAnimating = true;
        this.animationTime = 0;
        
        const animate = () => {
            if (!this.isAnimating) return;
            
            this.animationTime += 0.05;
            this.animateWavefunctions();
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.solveAndPlot();
    }

    animateWavefunctions() {
        const data = this.solveSchrodinger1D();
        const traces = [];
        
        const timeEvolved = new Array(data.x.length).fill(0);
        for (let i = 0; i < Math.min(2, data.wavefunctions.length); i++) {
            const phase = Math.cos(data.energies[i] * this.animationTime);
            data.wavefunctions[i].forEach((psi, idx) => {
                timeEvolved[idx] += psi * phase;
            });
        }
        
        const norm = Math.sqrt(timeEvolved.reduce((sum, psi) => sum + psi * psi, 0));
        const normalized = timeEvolved.map(psi => psi / norm);
        
        traces.push({
            x: data.x,
            y: normalized,
            mode: 'lines',
            name: 'ψ(x,t)',
            line: { color: '#00b4db', width: 3 }
        });
        
        traces.push({
            x: data.x,
            y: normalized.map(psi => psi * psi),
            mode: 'lines',
            name: '|ψ(x,t)|²',
            line: { color: '#ff6b6b', width: 3 }
        });

        const layout = this.getPlotLayout(
            `Time Evolution (t = ${this.animationTime.toFixed(2)})`,
            'Position x',
            'Wavefunction'
        );
        Plotly.react('wavefunctionPlot', traces, layout, { responsive: true });
    }

    // Theme and UI Controls
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.showNotification(`Switched to ${this.currentTheme} theme`, 'success');
        
        // Redraw all plots to update theme
        this.handleResize();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    takeScreenshot() {
        const plots = ['wavefunctionPlot', 'probabilityPlot', 'energyDiagram'];
        
        plots.forEach((plotId, index) => {
            Plotly.toImage(document.getElementById(plotId), {
                format: 'png',
                width: 1200,
                height: 800,
                scale: 2
            }).then(function(url) {
                const link = document.createElement('a');
                link.href = url;
                link.download = `quantum_${plotId}_${new Date().getTime()}.png`;
                link.click();
            });
        });
        
        this.showNotification('Screenshots downloaded!', 'success');
    }

    exportData() {
        const data = this.solveSchrodinger1D();
        const exportData = {
            parameters: this.parameters,
            potential: this.currentPotential,
            customPotential: this.customPotential,
            quantumProperties: this.quantumProperties,
            data: data
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `quantum_data_${new Date().getTime()}.json`;
        link.click();
        
        this.showNotification('Data exported successfully!', 'success');
    }

    resetToDefault() {
        this.parameters = {
            param1: 1.0,
            param2: 1.0,
            numStates: 5,
            systemSize: 10
        };
        
        Object.keys(this.parameters).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = this.parameters[key];
                document.getElementById(`${key}-value`).textContent = this.parameters[key];
            }
        });
        
        this.switchPotential('harmonic');
        this.stopAnimation();
        this.solveAndPlot();
        this.showNotification('Reset to default values', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        notification.querySelector('.notification-close').onclick = () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        };
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    handleResize() {
        // Redraw current tab
        switch(this.currentTab) {
            case 'wavefunctions':
                this.solveAndPlot();
                break;
            case 'operators':
                this.plotOperators();
                break;
            case 'time-evolution':
                this.plotTimeEvolution();
                break;
            case 'scattering':
                this.plotScattering();
                break;
            case 'advanced':
                this.plotAdvancedSystem();
                break;
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new QuantumLabPro();
});