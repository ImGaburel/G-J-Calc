class MathRenderer {
    constructor() {
        this.useLatex = true;
        this.useUnicode = true;
        this.useSimpleText = true;
    }

    setRenderingMode(useLatex, useUnicode, useSimpleText) {
        this.useLatex = useLatex;
        this.useUnicode = useUnicode;
        this.useSimpleText = useSimpleText;
    }

    extractSolutions(matrix) {
        // Validación robusta
        if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
            console.error('Matrix is undefined, null, or empty:', matrix);
            return [];
        }
        
        // Verificar que la primera fila existe y es un array
        if (!Array.isArray(matrix[0]) || matrix[0].length === 0) {
            console.error('Matrix first row is invalid:', matrix[0]);
            return [];
        }
        
        const solutions = [];
        const rows = matrix.length;
        const cols = matrix[0].length;
        const numVars = cols - 1; // La última columna es el resultado
        
        console.log('Extracting solutions from matrix:', matrix);
        console.log(`Matrix dimensions: ${rows}x${cols}, Variables: ${numVars}`);
        
        for (let i = 0; i < numVars && i < rows; i++) {
            if (matrix[i] && matrix[i][cols - 1] !== undefined) {
                // Obtener el valor de la última columna (resultado)
                solutions.push(matrix[i][cols - 1]);
            } else {
                console.warn(`Missing solution for variable ${i}`);
                solutions.push(0);
            }
        }
        
        console.log('Extracted solutions:', solutions);
        return solutions;
    }


    renderSolution(matrix, methodName) {
        console.log('🎯 renderSolution called with:', { matrix, methodName });
        
        // Manejar tanto arrays como objetos Matrix
        let matrixData;
        if (matrix && typeof matrix === 'object' && matrix.data) {
            // Es un objeto Matrix
            matrixData = matrix.data;
            console.log('📊 Matrix object detected, using data:', matrixData);
        } else if (Array.isArray(matrix)) {
            // Es un array simple
            matrixData = matrix;
            console.log('📊 Array detected:', matrixData);
        } else {
            console.error('❌ Invalid matrix format:', matrix);
            return `
                <div class="alert alert-warning mt-4">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error:</strong> No se pudo obtener la solución. Formato de matriz inválido.
                </div>
            `;
        }
        
        // Validación inicial
        if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
            return `
                <div class="alert alert-warning mt-4">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error:</strong> No se pudo obtener la solución. La matriz está vacía o es inválida.
                </div>
            `;
        }
        
        const solutions = this.extractSolutions(matrixData);
        
        // Si no hay soluciones, mostrar error
        if (!solutions || solutions.length === 0) {
            return `
                <div class="alert alert-warning mt-4">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error:</strong> No se pudieron extraer las soluciones de la matriz.
                </div>
            `;
        }
        
        const variables = this.getVariableNames(solutions.length);
        
        let result = '';
        
        if (this.useLatex) {
            result += '<div class="solution-container mt-4">';
            result += '<div class="alert alert-success" role="alert">';
            result += '<h5 class="alert-heading text-center mb-3">';
            result += '<i class="fas fa-check-circle me-2"></i>Solución del Sistema:';
            result += '</h5>';
            
            result += '<div class="latex-result text-center">';
            result += '$$\\begin{cases}';
            
            solutions.forEach((value, index) => {
                const variable = variables[index];
                const formattedValue = this.formatNumber(value);
                result += `${variable} = ${formattedValue}`;
                if (index < solutions.length - 1) result += ' \\\\ ';
            });
            
            result += '\\end{cases}$$';
            result += '</div>';
            
            result += '<hr>';
            result += `<small class="text-muted text-center d-block">`;
            result += `<i class="fas fa-cog me-1"></i>Método: ${this.getMethodDisplayName(methodName)} | `;
            result += `<i class="fas fa-calculator me-1"></i>${solutions.length} variable${solutions.length > 1 ? 's' : ''}`;
            result += '</small>';
            
            result += '</div>';
            result += '</div>';
        } else {
            // Versión sin LaTeX
            result += '<div class="solution-container mt-4">';
            result += '<div class="alert alert-success" role="alert">';
            result += '<h5 class="alert-heading text-center mb-3">';
            result += '<i class="fas fa-check-circle me-2"></i>Solución del Sistema:';
            result += '</h5>';
            
            result += '<div class="unicode-result text-center">';
            
            solutions.forEach((value, index) => {
                const variable = variables[index];
                const formattedValue = this.formatNumberSimple(value);
                result += `<p class="mb-2"><strong>${variable} = ${formattedValue}</strong></p>`;
            });
            
            result += '</div>';
            
            result += '<hr>';
            result += `<small class="text-muted text-center d-block">`;
            result += `Método: ${this.getMethodDisplayName(methodName)} | `;
            result += `${solutions.length} variable${solutions.length > 1 ? 's' : ''}`;
            result += '</small>';
            
            result += '</div>';
            result += '</div>';
        }
        
        return result;
    }

    getVariableNames(count) {
        const standardVars = ['x', 'y', 'z', 'w', 'v', 'u', 't', 's', 'r', 'p'];
        const variables = [];
        
        for (let i = 0; i < count; i++) {
            if (i < standardVars.length) {
                variables.push(standardVars[i]);
            } else {
                // Para más de 10 variables, usar subíndices
                if (this.useLatex) {
                    variables.push(`x_{${i + 1}}`);
                } else {
                    variables.push(`x${i + 1}`);
                }
            }
        }
        
        return variables;
    }

    getMethodDisplayName(methodName) {
        const methodNames = {
            'robust': 'Robusto (Sin Infinitos)',
            'classic': 'Clásico',
            'pivoting': 'Pivoteo Parcial',
            'scaling': 'Escalamiento'
        };
        return methodNames[methodName] || methodName;
    }

    formatNumber(num) {
        if (typeof num === 'object' && num.numerator !== undefined) {
            // Es una fracción
            if (num.denominator === 1) {
                return num.numerator.toString();
            }
            return `\\frac{${num.numerator}}{${num.denominator}}`;
        }
        
        if (typeof num === 'number') {
            if (Number.isInteger(num)) {
                return num.toString();
            }
            // Convertir decimal a fracción si es posible
            const fraction = this.decimalToFraction(num);
            if (fraction.denominator !== 1 && fraction.denominator <= 100) {
                return `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
            }
            return num.toFixed(4).replace(/\.?0+$/, '');
        }
        
        return num.toString();
    }

    decimalToFraction(decimal) {
        if (Number.isInteger(decimal)) {
            return { numerator: decimal, denominator: 1 };
        }
        
        const tolerance = 1e-10;
        let numerator = 1;
        let denominator = 1;
        
        while (Math.abs(decimal - numerator / denominator) > tolerance && denominator < 10000) {
            if (decimal > numerator / denominator) {
                numerator++;
            } else {
                denominator++;
                numerator = Math.round(decimal * denominator);
            }
        }
        
        // Simplificar la fracción
        const gcd = this.gcd(Math.abs(numerator), Math.abs(denominator));
        return {
            numerator: numerator / gcd,
            denominator: denominator / gcd
        };
    }

    gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    renderMatrix(matrix, title = '') {
        // ✅ AGREGAR ESTA VALIDACIÓN AL INICIO
        let matrixData;
        
        // Manejar objetos Matrix
        if (matrix && typeof matrix === 'object' && matrix.data) {
            matrixData = matrix.data;
            console.log('📊 Matrix object detected in renderMatrix, using data:', matrixData);
        } else if (Array.isArray(matrix)) {
            matrixData = matrix;
        } else {
            console.error('❌ Invalid matrix format in renderMatrix:', matrix);
            return `<div class="alert alert-warning">Matriz inválida</div>`;
        }
        
        // Validar que los datos existen
        if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
            console.error('❌ Matrix data is empty or invalid:', matrixData);
            return `<div class="alert alert-warning">Datos de matriz vacíos</div>`;
        }
        
        let result = '';
        
        if (title) {
            result += `<h6 class="text-primary mt-3"><i class="fas fa-matrix"></i> ${title}</h6>`;
        }
        
        if (this.useLatex) {
            result += this.renderLatexMatrix(matrixData); // ✅ Pasar matrixData, no matrix
        } else if (this.useUnicode) {
            result += this.renderUnicodeMatrix(matrixData);
        } else {
            result += this.renderSimpleMatrix(matrixData);
        }
        
        return result;
    }

    renderLatexMatrix(matrix) {
        let latex = '$$\\left[\\begin{array}{';
        
        // Configurar columnas
        const cols = matrix[0].length;
        const varCols = cols - 1;
        for (let i = 0; i < varCols; i++) {
            latex += 'c';
        }
        latex += '|c';
        latex += '}';
        
        // Agregar filas
        matrix.forEach((row, index) => {
            row.forEach((cell, cellIndex) => {
                const formattedCell = this.formatNumber(cell);
                latex += formattedCell;
                if (cellIndex < row.length - 1) {
                    latex += ' & ';
                }
            });
            if (index < matrix.length - 1) {
                latex += ' \\\\ ';
            }
        });
        
        latex += '\\end{array}\\right]$$';
        return latex;
    }

    renderUnicodeMatrix(matrix) {
        let result = '<div class="unicode-matrix">';
        
        matrix.forEach((row, rowIndex) => {
            let rowHtml = '<div class="matrix-row">';
            
            if (rowIndex === 0) rowHtml += '<span class="bracket">⎡</span>';
            else if (rowIndex === matrix.length - 1) rowHtml += '<span class="bracket">⎣</span>';
            else rowHtml += '<span class="bracket">⎢</span>';
            
            row.forEach((cell, cellIndex) => {
                const formattedCell = this.formatNumberSimple(cell);
                rowHtml += `<span class="matrix-cell">${formattedCell}</span>`;
                if (cellIndex === row.length - 2) {
                    rowHtml += '<span class="separator">|</span>';
                }
            });
            
            if (rowIndex === 0) rowHtml += '<span class="bracket">⎤</span>';
            else if (rowIndex === matrix.length - 1) rowHtml += '<span class="bracket">⎦</span>';
            else rowHtml += '<span class="bracket">⎥</span>';
            
            rowHtml += '</div>';
            result += rowHtml;
        });
        
        result += '</div>';
        return result;
    }

    renderSimpleMatrix(matrix) {
        let result = '<div class="simple-matrix">';
        result += '<table class="table table-sm table-bordered text-center">';
        
        matrix.forEach(row => {
            result += '<tr>';
            row.forEach((cell, cellIndex) => {
                const formattedCell = this.formatNumberSimple(cell);
                const classes = cellIndex === row.length - 1 ? 'table-warning' : '';
                result += `<td class="${classes}">${formattedCell}</td>`;
            });
            result += '</tr>';
        });
        
        result += '</table>';
        result += '</div>';
        return result;
    }

    formatNumberSimple(num) {
        if (typeof num === 'object' && num.numerator !== undefined) {
            if (num.denominator === 1) {
                return num.numerator.toString();
            }
            return `${num.numerator}/${num.denominator}`;
        }
        
        if (typeof num === 'number') {
            if (Number.isInteger(num)) {
                return num.toString();
            }
            return num.toFixed(2).replace(/\.?0+$/, '');
        }
        
        return num.toString();
    }

    renderSteps(steps) {
        if (!steps || steps.length === 0) return '';
        
        let result = '<div class="steps-container mt-4">';
        result += '<h5 class="text-info mb-3"><i class="fas fa-list-ol"></i> Proceso de Resolución:</h5>';
        
        steps.forEach((step, index) => {
            result += '<div class="step-item mb-3">';
            result += `<h6 class="step-title text-secondary">Paso ${index + 1}: ${step.description}</h6>`;
            
            if (step.matrix) {
                result += this.renderMatrix(step.matrix);
            }
            
            if (step.explanation) {
                result += `<p class="step-explanation text-muted small mt-2">${step.explanation}</p>`;
            }
            
            result += '</div>';
        });
        
        result += '</div>';
        return result;
    }

        refreshMath() {
        // Para MathJax v3 (más moderno)
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise().catch((err) => {
                console.warn('Error al re-renderizar MathJax v3:', err);
            });
        }
        // Para MathJax v2 (más antiguo)
        else if (typeof MathJax !== 'undefined' && MathJax.Hub) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
        // Si MathJax no está cargado, intentar cargarlo
        else {
            console.warn('MathJax no está disponible. Intentando cargar...');
            this.loadMathJax();
        }
    }

}