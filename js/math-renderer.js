class MathRenderer {
    constructor() {
        this.useLatex = true;
    }

    extractSolutions(matrix) {
        if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
            console.error('Matrix is undefined, null, or empty:', matrix);
            return [];
        }
        
        if (!Array.isArray(matrix[0]) || matrix[0].length === 0) {
            console.error('Matrix first row is invalid:', matrix[0]);
            return [];
        }
        
        const solutions = [];
        const rows = matrix.length;
        const cols = matrix[0].length;
        const numVars = cols - 1;
        
        for (let i = 0; i < numVars && i < rows; i++) {
            if (matrix[i] && matrix[i][cols - 1] !== undefined) {
                solutions.push(matrix[i][cols - 1]);
            } else {
                console.warn(`Missing solution for variable ${i}`);
                solutions.push(0);
            }
        }
        
        return solutions;
    }

    renderSolution(matrix, methodName) {
        let matrixData;
        if (matrix && typeof matrix === 'object' && matrix.data) {
            matrixData = matrix.data;
        } else if (Array.isArray(matrix)) {
            matrixData = matrix;
        } else {
            return `
                <div class="alert alert-warning mt-4">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error:</strong> No se pudo obtener la solución. Formato de matriz inválido.
                </div>
            `;
        }
        
        if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
            return `
                <div class="alert alert-warning mt-4">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error:</strong> No se pudo obtener la solución. La matriz está vacía o es inválida.
                </div>
            `;
        }
        
        const solutions = this.extractSolutions(matrixData);
        
        if (!solutions || solutions.length === 0) {
            return `
                <div class="alert alert-warning mt-4">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error:</strong> No se pudieron extraer las soluciones de la matriz.
                </div>
            `;
        }
        
        const variables = this.getVariableNames(solutions.length);
        
        let result = '<div class="solution-container mt-4">';
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
        
        return result;
    }

    getVariableNames(count) {
        const standardVars = ['x', 'y', 'z', 'w', 'v', 'u', 't', 's', 'r', 'p'];
        const variables = [];
        
        for (let i = 0; i < count; i++) {
            if (i < standardVars.length) {
                variables.push(standardVars[i]);
            } else {
                variables.push(`x_{${i + 1}}`);
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
            if (num.denominator === 1) {
                return num.numerator.toString();
            }
            return `\\frac{${num.numerator}}{${num.denominator}}`;
        }
        
        if (typeof num === 'number') {
            if (Number.isInteger(num)) {
                return num.toString();
            }
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
        let matrixData;
        
        if (matrix && typeof matrix === 'object' && matrix.data) {
            matrixData = matrix.data;
        } else if (Array.isArray(matrix)) {
            matrixData = matrix;
        } else {
            return `<div class="alert alert-warning">Matriz inválida</div>`;
        }
        
        if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
            return `<div class="alert alert-warning">Datos de matriz vacíos</div>`;
        }
        
        let result = '';
        
        if (title) {
            result += `<h6 class="text-primary mt-3"><i class="fas fa-matrix"></i> ${title}</h6>`;
        }
        
        result += this.renderLatexMatrix(matrixData);
        
        return result;
    }

    renderLatexMatrix(matrix) {
        let latex = '$$\\left[\\begin{array}{';
        
        const cols = matrix[0].length;
        const varCols = cols - 1;
        for (let i = 0; i < varCols; i++) {
            latex += 'c';
        }
        latex += '|c';
        latex += '}';
        
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
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise().catch((err) => {
                console.warn('Error al re-renderizar MathJax v3:', err);
            });
        } else if (typeof MathJax !== 'undefined' && MathJax.Hub) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        } else {
            console.warn('MathJax no está disponible.');
        }
    }
}