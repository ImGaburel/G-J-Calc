class MatrixCalculatorUI {
    constructor() {
        this.currentSize = 3;
        this.inputMode = 'equation';
        this.mathRenderer = new MathRenderer();
        
        // Verificar que las dependencias estén cargadas
        if (typeof Matrix === 'undefined') {
            console.error('Matrix class no está cargada');
            return;
        }
        
        if (typeof GaussJordanMethods === 'undefined') {
            console.error('GaussJordanMethods class no está cargada');
            this.solver = null;
        } else {
            this.solver = new GaussJordanMethods();
        }
        
        console.log('Inicializando UI...');
        this.initializeEventListeners();
        this.createSystemInput();
    }

    initializeEventListeners() {
        console.log('Configurando event listeners...');
        
        // Botones principales
        const createBtn = document.getElementById('createSystem');
        const calculateBtn = document.getElementById('calculate');
        
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                console.log('Crear sistema clickeado');
                this.createSystemInput();
            });
        }
        
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                console.log('Calcular clickeado');
                this.solveSystem();
            });
        }
        
        // Control de tamaño
        const increaseBtn = document.getElementById('increaseSize');
        const decreaseBtn = document.getElementById('decreaseSize');
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => this.changeSystemSize(1));
        }
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => this.changeSystemSize(-1));
        }
        
        // Modo de entrada
        const modeRadios = document.querySelectorAll('input[name="inputMode"]');
        modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                console.log('Modo cambiado a:', e.target.id);
                this.inputMode = e.target.id === 'equationMode' ? 'equation' : 'matrix';
                this.createSystemInput();
            });
        });
        
        // Estilo de visualización
        const visualStyle = document.getElementById('visualStyle');
        if (visualStyle) {
            visualStyle.addEventListener('change', (e) => {
                this.mathRenderer.setStyle(e.target.value);
                console.log('Estilo de visualización cambiado a:', e.target.value);
            });
        }
        
        // Descripción del método
        const methodSelect = document.getElementById('methodSelect');
        if (methodSelect) {
            methodSelect.addEventListener('change', () => this.updateMethodDescription());
        }
        
        this.updateMethodDescription();
    }

    changeSystemSize(delta) {
        const newSize = this.currentSize + delta;
        if (newSize >= 2 && newSize <= 6) {
            this.currentSize = newSize;
            const sizeInput = document.getElementById('systemSize');
            if (sizeInput) {
                sizeInput.value = newSize;
            }
            this.createSystemInput();
        }
    }

    updateMethodDescription() {
        const methodSelect = document.getElementById('methodSelect');
        const descriptionEl = document.getElementById('methodDescription');
    
        if (!methodSelect || !descriptionEl) return;
    
        const method = methodSelect.value;
        const descriptions = {
            'robust': '<i class="fas fa-shield-alt"></i> Nunca produce infinitos, trabaja con fracciones exactas',
            'classic': '<i class="fas fa-info-circle"></i> Método diagonal tradicional permitiendo fracciones',
            'pivoting': '<i class="fas fa-info-circle"></i> Selecciona automáticamente el mejor pivote para estabilidad',
            'scaling': '<i class="fas fa-info-circle"></i> Normaliza filas para mejorar la precisión numérica'
        };
    
        descriptionEl.innerHTML = descriptions[method] || 'Método no encontrado';
    }

    createSystemInput() {
        console.log('Creando sistema de entrada, modo:', this.inputMode);
        const container = document.getElementById('systemInput');
        
        if (!container) {
            console.error('Container systemInput no encontrado');
            return;
        }
        
        if (this.inputMode === 'equation') {
            container.innerHTML = this.createEquationInterface();
            // Agregar event listeners para los botones de signo después de crear la interfaz
            this.setupSignToggleListeners();
        } else {
            container.innerHTML = this.createMatrixInterface();
        }
    }

    createEquationInterface() {
        const n = this.currentSize;
        let html = `
            <div class="card equation-input-container">
                <div class="card-header">
                    <h5><i class="fas fa-function"></i> Sistema de ${n} Ecuaciones con ${n} Incógnitas</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <small class="text-muted">
                            <i class="fas fa-lightbulb"></i> 
                            Ingresa los coeficientes y haz clic en los signos + / - para cambiarlos.
                        </small>
                    </div>
        `;

        for (let eq = 0; eq < n; eq++) {
            html += `<div class="equation-row">`;
            html += `<div class="equation-number">${eq + 1}</div>`;
            
            for (let var_i = 0; var_i < n; var_i++) {
                html += `
                    <div class="coefficient-group">
                        <button class="btn btn-sm sign-toggle ${var_i === 0 ? 'btn-outline-secondary' : 'btn-outline-primary'}" 
                                id="sign-${eq}-${var_i}" 
                                data-sign="${var_i === 0 ? 'positive' : 'positive'}"
                                ${var_i === 0 ? 'style="visibility: hidden;"' : ''}>
                            ${var_i === 0 ? '' : '+'}
                        </button>
                        <input type="number" 
                               class="coefficient-input" 
                               id="coeff-${eq}-${var_i}" 
                               placeholder="0" 
                               step="any"
                               value="0"
                               min="0">
                        <span class="variable-label">x<sub>${var_i + 1}</sub></span>
                    </div>
                `;
            }
            
            html += `
                <span class="equals-sign">=</span>
                <input type="number" 
                       class="result-input" 
                       id="result-${eq}" 
                       placeholder="0" 
                       step="any"
                       value="0">
            `;
            html += `</div>`;
        }

        html += `
                </div>
            </div>
            <div class="text-center mb-3">
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-info" onclick="ui.loadEquationExample()">
                        <i class="fas fa-lightbulb"></i> Ejemplo
                    </button>
                    <button class="btn btn-outline-warning" onclick="ui.clearEquations()">
                        <i class="fas fa-eraser"></i> Limpiar
                    </button>
                    <button class="btn btn-outline-secondary" onclick="ui.toggleMatrixView()">
                        <i class="fas fa-table"></i> Ver Matriz
                    </button>
                </div>
            </div>
        `;

        return html;
    }

    setupSignToggleListeners() {
        // Configurar todos los botones de signo
        const signButtons = document.querySelectorAll('.sign-toggle');
        signButtons.forEach(button => {
            if (button.style.visibility !== 'hidden') {
                button.addEventListener('click', (e) => {
                    this.toggleSign(e.target);
                });
            }
        });
    }

    toggleSign(button) {
        const currentSign = button.getAttribute('data-sign');
        const newSign = currentSign === 'positive' ? 'negative' : 'positive';
        
        button.setAttribute('data-sign', newSign);
        button.textContent = newSign === 'positive' ? '+' : '−';
        button.className = newSign === 'positive' ? 
            'btn btn-sm sign-toggle btn-outline-primary' : 
            'btn btn-sm sign-toggle btn-outline-danger';
    }

    createMatrixInterface() {
        const n = this.currentSize;
        let html = `
            <div class="card matrix-container">
                <div class="card-header">
                    <h5><i class="fas fa-table"></i> Matriz Aumentada ${n}×${n + 1}</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <small class="text-muted">
                            <i class="fas fa-info-circle"></i> 
                            Las primeras ${n} columnas son los coeficientes, la última columna son los términos independientes.
                        </small>
                    </div>
                    <div class="matrix-grid" style="grid-template-columns: repeat(${n + 1}, 1fr);">
        `;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n + 1; j++) {
                const isResultColumn = j === n;
                html += `
                    <input type="number" 
                           class="matrix-cell ${isResultColumn ? 'result-column' : ''}" 
                           id="matrix-${i}-${j}" 
                           placeholder="0" 
                           step="any"
                           value="0">
                `;
            }
        }

        html += `
                    </div>
                </div>
            </div>
            <div class="text-center mb-3">
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-info" onclick="ui.loadMatrixExample()">
                        <i class="fas fa-lightbulb"></i> Ejemplo
                    </button>
                    <button class="btn btn-outline-warning" onclick="ui.clearMatrix()">
                        <i class="fas fa-eraser"></i> Limpiar
                    </button>
                    <button class="btn btn-outline-secondary" onclick="ui.toggleEquationView()">
                        <i class="fas fa-function"></i> Ver Ecuaciones
                    </button>
                </div>
            </div>
        `;

        return html;
    }

    // Métodos de utilidad mejorados
    loadEquationExample() {
        console.log('Cargando ejemplo de ecuación');
        const examples = [
            { 
                coeffs: [[2, 1, 3], [1, -4, 2], [-3, 2, 1]], 
                results: [11, -5, 4],
                signs: [['positive', 'positive', 'positive'], ['positive', 'negative', 'positive'], ['negative', 'positive', 'positive']]
            },
            { 
                coeffs: [[1, 2, -1], [2, -1, 3], [1, 1, 1]], 
                results: [8, 13, 6],
                signs: [['positive', 'positive', 'negative'], ['positive', 'negative', 'positive'], ['positive', 'positive', 'positive']]
            }
        ];
        
        const example = examples[0];
        const n = this.currentSize;
        
        for (let i = 0; i < Math.min(n, example.coeffs.length); i++) {
            for (let j = 0; j < Math.min(n, example.coeffs[i].length); j++) {
                const input = document.getElementById(`coeff-${i}-${j}`);
                const signButton = document.getElementById(`sign-${i}-${j}`);
                
                if (input) {
                    input.value = Math.abs(example.coeffs[i][j]);
                }
                
                if (signButton && j > 0) {
                    const sign = example.signs[i][j];
                    signButton.setAttribute('data-sign', sign);
                    signButton.textContent = sign === 'positive' ? '+' : '−';
                    signButton.className = sign === 'positive' ? 
                        'btn btn-sm sign-toggle btn-outline-primary' : 
                        'btn btn-sm sign-toggle btn-outline-danger';
                }
            }
            const resultInput = document.getElementById(`result-${i}`);
            if (resultInput) resultInput.value = example.results[i];
        }
    }

    loadMatrixExample() {
        console.log('Cargando ejemplo de matriz');
        const example = [[2, 1, 3, 11], [1, -4, 2, -5], [-3, 2, 1, 4]];
        const n = this.currentSize;
        
        for (let i = 0; i < Math.min(n, example.length); i++) {
            for (let j = 0; j < Math.min(n + 1, example[i].length); j++) {
                const input = document.getElementById(`matrix-${i}-${j}`);
                if (input) input.value = example[i][j];
            }
        }
    }

    clearEquations() {
        const n = this.currentSize;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const input = document.getElementById(`coeff-${i}-${j}`);
                const signButton = document.getElementById(`sign-${i}-${j}`);
                
                if (input) input.value = '0';
                
                if (signButton && j > 0) {
                    signButton.setAttribute('data-sign', 'positive');
                    signButton.textContent = '+';
                    signButton.className = 'btn btn-sm sign-toggle btn-outline-primary';
                }
            }
            const resultInput = document.getElementById(`result-${i}`);
            if (resultInput) resultInput.value = '0';
        }
    }

    clearMatrix() {
        const n = this.currentSize;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n + 1; j++) {
                const input = document.getElementById(`matrix-${i}-${j}`);
                if (input) input.value = '0';
            }
        }
    }

    toggleMatrixView() {
        document.getElementById('matrixMode').checked = true;
        this.inputMode = 'matrix';
        this.transferDataToMatrix();
        this.createSystemInput();
    }

    toggleEquationView() {
        document.getElementById('equationMode').checked = true;
        this.inputMode = 'equation';
        this.transferDataToEquations();
        this.createSystemInput();
    }

    transferDataToMatrix() {
        const n = this.currentSize;
        const data = [];
        
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j < n; j++) {
                const input = document.getElementById(`coeff-${i}-${j}`);
                const signButton = document.getElementById(`sign-${i}-${j}`);
                
                let value = parseFloat(input?.value) || 0;
                
                // Aplicar signo si no es el primer término
                if (j > 0 && signButton) {
                    const sign = signButton.getAttribute('data-sign');
                    if (sign === 'negative') {
                        value = -value;
                    }
                }
                
                row.push(value);
            }
            const resultInput = document.getElementById(`result-${i}`);
            row.push(parseFloat(resultInput?.value) || 0);
            data.push(row);
        }
        
        setTimeout(() => {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n + 1; j++) {
                    const input = document.getElementById(`matrix-${i}-${j}`);
                    if (input) input.value = data[i][j] || 0;
                }
            }
        }, 100);
    }

    transferDataToEquations() {
        const n = this.currentSize;
        const data = [];
        
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j < n + 1; j++) {
                const input = document.getElementById(`matrix-${i}-${j}`);
                row.push(parseFloat(input?.value) || 0);
            }
            data.push(row);
        }
        
        setTimeout(() => {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const input = document.getElementById(`coeff-${i}-${j}`);
                    const signButton = document.getElementById(`sign-${i}-${j}`);
                    
                    const value = data[i][j] || 0;
                    
                    if (input) input.value = Math.abs(value);
                    
                    if (signButton && j > 0) {
                        const sign = value >= 0 ? 'positive' : 'negative';
                        signButton.setAttribute('data-sign', sign);
                        signButton.textContent = sign === 'positive' ? '+' : '−';
                        signButton.className = sign === 'positive' ? 
                            'btn btn-sm sign-toggle btn-outline-primary' : 
                            'btn btn-sm sign-toggle btn-outline-danger';
                    }
                }
                const resultInput = document.getElementById(`result-${i}`);
                if (resultInput) resultInput.value = data[i][n] || 0;
            }
        }, 100);
    }

    getMatrixFromInput() {
        const n = this.currentSize;
        const matrix = new Matrix(n, n + 1);
        
        if (this.inputMode === 'equation') {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const input = document.getElementById(`coeff-${i}-${j}`);
                    const signButton = document.getElementById(`sign-${i}-${j}`);
                    
                    let value = parseFloat(input?.value) || 0;
                    
                    // Aplicar signo si no es el primer término
                    if (j > 0 && signButton) {
                        const sign = signButton.getAttribute('data-sign');
                        if (sign === 'negative') {
                            value = -value;
                        }
                    }
                    
                    matrix.setElement(i, j, value);
                }
                const resultInput = document.getElementById(`result-${i}`);
                const resultValue = parseFloat(resultInput?.value) || 0;
                matrix.setElement(i, n, resultValue);
            }
        } else {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n + 1; j++) {
                    const input = document.getElementById(`matrix-${i}-${j}`);
                    const value = parseFloat(input?.value) || 0;
                    matrix.setElement(i, j, value);
                }
            }
        }
        
        return matrix;
    }

    solveSystem() {
        console.log('Intentando resolver sistema...');
        
        try {
            const matrix = this.getMatrixFromInput();
            console.log('🎯 Matriz obtenida:', matrix);
            console.log('🎯 Datos de matriz:', matrix.data);
            
            if (!this.solver) {
                this.displayError('Los métodos de resolución no están disponibles. Verifica que todos los archivos JS estén cargados.');
                return;
            }
            
            const method = document.getElementById('methodSelect').value;
            console.log('🎯 Método seleccionado:', method);
            
            // Mostrar loading
            this.showLoading();
            
            setTimeout(() => {
                try {
                    const result = this.solver.solve(matrix, method);
                    console.log('✅ Resultado del solver:', result);
                    console.log('✅ Matriz resultado:', result.result);
                    console.log('✅ Datos matriz resultado:', result.result.data);
                    this.displayResults(result, matrix);
                } catch (solveError) {
                    console.error('❌ Error al resolver:', solveError);
                    this.displayError(`Error al resolver: ${solveError.message}`);
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ Error general:', error);
            this.displayError(error.message);
        }
    }

    showLoading() {
        document.getElementById('results').innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Calculando...</span>
                    </div>
                    <p class="mt-3">Resolviendo sistema...</p>
                </div>
            </div>
        `;
    }

    displayResults(result, originalMatrix) {
        // Obtener el método seleccionado
        const selectedMethod = document.getElementById('methodSelect').value;
        
        const resultsHTML = `
            <div class="card">
                <div class="card-header">
                    <h5><i class="fas fa-check-circle text-success"></i> Resultado Final</h5>
                </div>
                <div class="card-body">
                    ${this.mathRenderer.renderMatrix(result.result, "🎯 Matriz en Forma Escalonada Reducida:", "")}
                    ${this.mathRenderer.renderSolution(result.result.data, selectedMethod)}
                    <div class="mt-3 text-center">
                        <span class="badge bg-primary">Método: ${this.getMethodName(result.method)}</span>
                        <span class="badge bg-info">${result.steps.length} pasos</span>
                        <span class="badge bg-secondary">Estilo: ${this.mathRenderer.style || 'LaTeX'}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('results').innerHTML = resultsHTML;

        this.mathRenderer.refreshMath();

        // Mostrar pasos detallados
        this.displaySteps(result.steps);
        
        // Verificar sistema si es posible
        if (this.verifier && result.result.rows === result.result.cols - 1) {
            this.performVerification(originalMatrix, result.result);
        }
    }

    displaySteps(steps) {
        const stepsHTML = steps.map((step, index) => `
            <div class="step-container" style="animation-delay: ${index * 0.1}s">
                <div class="step-title">
                    <i class="fas fa-arrow-right"></i>
                    Paso ${step.stepNumber}: ${step.description}
                </div>
                ${this.mathRenderer.renderMatrix(step.matrix, "", step.description)}
            </div>
        `).join('');

        document.getElementById('stepByStep').innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5><i class="fas fa-list-ol"></i> Procedimiento Detallado</h5>
                </div>
                <div class="card-body">
                    ${stepsHTML}
                </div>
            </div>
        `;

        this.mathRenderer.refreshMath();
    }

    getMethodName(methodId) {
        const names = {
            'robust': 'Robusto (Sin Infinitos)',
            'classic': 'Clásico',
            'pivoting': 'Pivoteo Parcial',
            'scaling': 'Escalamiento'
        };
        return names[methodId] || methodId;
    }

    displayError(message) {
        document.getElementById('results').innerHTML = `
            <div class="alert alert-danger">
                <h5 class="alert-heading">
                    <i class="fas fa-exclamation-triangle"></i> Error
                </h5>
                <p class="mb-0">${message}</p>
            </div>
        `;
        document.getElementById('stepByStep').innerHTML = '';
    }
}

// Inicializar aplicación
let ui;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando...');
    ui = new MatrixCalculatorUI();
});