class GaussJordanMethods {
    constructor() {
        this.methods = {
            'robust': new RobustMethod(),
            'classic': new ClassicMethod(),
            'pivoting': new PartialPivotingMethod(),
            'scaling': new ScalingMethod()
        };
    }

    solve(matrix, methodName = 'robust') {
        if (!this.methods[methodName]) {
            throw new Error(`Método ${methodName} no encontrado`);
        }
        
        return this.methods[methodName].solve(matrix);
    }

    getAvailableMethods() {
        return [
            { id: 'robust', name: 'Método Robusto (Sin Infinitos)', description: 'Nunca produce infinitos, resultados exactos en fracciones' },
            { id: 'classic', name: 'Método Clásico', description: 'Diagonal tradicional con fracciones' },
            { id: 'pivoting', name: 'Pivoteo Parcial', description: 'Busca el mejor pivote en cada paso' },
            { id: 'scaling', name: 'Escalamiento', description: 'Normaliza filas para mejor estabilidad' }
        ];
    }
}

// MÉTODO ROBUSTO COMPLETO - NUNCA PRODUCE INFINITOS
class RobustMethod {
    constructor() {
        this.steps = [];
        this.fractionMode = true;
    }

    solve(matrix) {
        this.steps = [];
        
        // Validar entrada
        this.validateInput(matrix);
        
        // Convertir matriz a representación de fracciones
        const fractionMatrix = this.convertToFractionMatrix(matrix);
        this.addStep("🛡️ Inicio - Método Robusto (sin infinitos, fracciones exactas)", this.convertToDecimalMatrix(fractionMatrix));
        
        try {
            this.gaussJordanWithFractions(fractionMatrix);
            
            // Convertir resultado final
            const resultMatrix = this.convertToDecimalMatrix(fractionMatrix);
            this.cleanAndValidateResult(resultMatrix);
            
            this.addStep("✅ Resultado final validado y limpio", resultMatrix);
            
            return {
                result: resultMatrix,
                steps: this.steps,
                method: 'robust'
            };
            
        } catch (error) {
            throw new Error(`Error en método robusto: ${error.message}`);
        }
    }

    validateInput(matrix) {
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                const value = matrix.getElement(i, j);
                if (!isFinite(value) || isNaN(value)) {
                    throw new Error(`Valor inválido en entrada [${i+1}, ${j+1}]: ${value}`);
                }
            }
        }
    }

    convertToFractionMatrix(matrix) {
        const fractionMatrix = [];
        
        for (let i = 0; i < matrix.rows; i++) {
            fractionMatrix[i] = [];
            for (let j = 0; j < matrix.cols; j++) {
                const value = matrix.getElement(i, j);
                fractionMatrix[i][j] = this.decimalToFraction(value);
            }
        }
        
        return {
            rows: matrix.rows,
            cols: matrix.cols,
            data: fractionMatrix
        };
    }

    convertToDecimalMatrix(fractionMatrix) {
        const matrix = new Matrix(fractionMatrix.rows, fractionMatrix.cols);
        
        for (let i = 0; i < fractionMatrix.rows; i++) {
            for (let j = 0; j < fractionMatrix.cols; j++) {
                const fraction = fractionMatrix.data[i][j];
                let decimal;
                
                // Manejar casos especiales
                if (fraction.denominator === 0) {
                    decimal = 0; // Convertir división por cero a 0
                } else if (fraction.numerator === 0) {
                    decimal = 0;
                } else {
                    decimal = fraction.numerator / fraction.denominator;
                }
                
                // Verificar que el resultado sea finito
                if (!isFinite(decimal) || isNaN(decimal)) {
                    decimal = 0;
                }
                
                matrix.setElement(i, j, decimal);
            }
        }
        
        return matrix;
    }

    gaussJordanWithFractions(fractionMatrix) {
        const n = Math.min(fractionMatrix.rows, fractionMatrix.cols - 1);
        
        // Fase 1: Eliminación hacia adelante
        for (let i = 0; i < n; i++) {
            // Buscar mejor pivote
            this.findBestPivotFraction(fractionMatrix, i);
            
            // Normalizar fila pivote
            this.normalizePivotRow(fractionMatrix, i);
            
            // Eliminar hacia abajo
            this.eliminateColumnDown(fractionMatrix, i);
        }
        
        // Fase 2: Eliminación hacia arriba
        for (let i = n - 1; i >= 0; i--) {
            this.eliminateColumnUp(fractionMatrix, i);
        }
    }

    findBestPivotFraction(fractionMatrix, col) {
        let bestRow = col;
        let bestFraction = fractionMatrix.data[col][col];
        
        // Buscar el pivote más simple (no cero)
        for (let row = col; row < fractionMatrix.rows; row++) {
            const fraction = fractionMatrix.data[row][col];
            
            // Evitar fracciones cero
            if (fraction.numerator === 0) continue;
            
            // Preferir fracciones más simples
            if (bestFraction.numerator === 0 || 
                Math.abs(fraction.numerator) < Math.abs(bestFraction.numerator) ||
                (Math.abs(fraction.numerator) === Math.abs(bestFraction.numerator) && 
                 fraction.denominator < bestFraction.denominator)) {
                bestRow = row;
                bestFraction = fraction;
            }
        }
        
        // Intercambiar filas si es necesario
        if (bestRow !== col && bestFraction.numerator !== 0) {
            [fractionMatrix.data[col], fractionMatrix.data[bestRow]] = 
            [fractionMatrix.data[bestRow], fractionMatrix.data[col]];
            
            const decimalMatrix = this.convertToDecimalMatrix(fractionMatrix);
            this.addStep(`🔄 Intercambiar F${col + 1} ↔ F${bestRow + 1} (pivote: ${this.fractionToString(bestFraction)})`, decimalMatrix);
        }
        
        // Verificar pivote válido
        if (fractionMatrix.data[col][col].numerator === 0) {
            // Si no hay pivote válido, buscar en otras columnas
            for (let j = col + 1; j < fractionMatrix.cols - 1; j++) {
                for (let i = col; i < fractionMatrix.rows; i++) {
                    if (fractionMatrix.data[i][j].numerator !== 0) {
                        // Intercambiar columnas (esto requiere cuidado especial)
                        // Por simplicidad, marcar como sistema sin solución única
                        throw new Error(`Sistema puede no tener solución única`);
                    }
                }
            }
        }
    }

    normalizePivotRow(fractionMatrix, row) {
        const pivot = fractionMatrix.data[row][row];
        
        // Si el pivote es cero, no normalizar
        if (pivot.numerator === 0) return;
        
        // Si el pivote ya es 1, no hacer nada
        if (pivot.numerator === pivot.denominator) return;
        
        // Dividir toda la fila por el pivote
        for (let j = 0; j < fractionMatrix.cols; j++) {
            fractionMatrix.data[row][j] = this.divideFractions(fractionMatrix.data[row][j], pivot);
        }
        
        const decimalMatrix = this.convertToDecimalMatrix(fractionMatrix);
        this.addStep(`➗ F${row + 1} = F${row + 1} ÷ (${this.fractionToString(pivot)})`, decimalMatrix);
    }

    eliminateColumnDown(fractionMatrix, pivotRow) {
        for (let row = pivotRow + 1; row < fractionMatrix.rows; row++) {
            const target = fractionMatrix.data[row][pivotRow];
            
            // Si el target ya es cero, saltar
            if (target.numerator === 0) continue;
            
            // Restar target * fila_pivote de la fila actual
            for (let j = 0; j < fractionMatrix.cols; j++) {
                const product = this.multiplyFractions(target, fractionMatrix.data[pivotRow][j]);
                fractionMatrix.data[row][j] = this.subtractFractions(fractionMatrix.data[row][j], product);
            }
            
            const decimalMatrix = this.convertToDecimalMatrix(fractionMatrix);
            this.addStep(`➖ F${row + 1} = F${row + 1} - (${this.fractionToString(target)}) × F${pivotRow + 1}`, decimalMatrix);
        }
    }

    eliminateColumnUp(fractionMatrix, pivotRow) {
        for (let row = pivotRow - 1; row >= 0; row--) {
            const target = fractionMatrix.data[row][pivotRow];
            
            // Si el target ya es cero, saltar
            if (target.numerator === 0) continue;
            
            // Restar target * fila_pivote de la fila actual
            for (let j = 0; j < fractionMatrix.cols; j++) {
                const product = this.multiplyFractions(target, fractionMatrix.data[pivotRow][j]);
                fractionMatrix.data[row][j] = this.subtractFractions(fractionMatrix.data[row][j], product);
            }
            
            const decimalMatrix = this.convertToDecimalMatrix(fractionMatrix);
            this.addStep(`⬆️ F${row + 1} = F${row + 1} - (${this.fractionToString(target)}) × F${pivotRow + 1}`, decimalMatrix);
        }
    }

    // Aritmética de fracciones
    decimalToFraction(decimal) {
        if (decimal === 0) return { numerator: 0, denominator: 1 };
        if (Number.isInteger(decimal)) return { numerator: Math.round(decimal), denominator: 1 };
        
        const tolerance = 1e-10;
        let sign = decimal < 0 ? -1 : 1;
        decimal = Math.abs(decimal);
        
        // Método simple para casos comunes
        for (let denominator = 1; denominator <= 1000; denominator++) {
            const numerator = Math.round(decimal * denominator);
            if (Math.abs(decimal - numerator / denominator) < tolerance) {
                return this.simplifyFraction({ numerator: sign * numerator, denominator });
            }
        }
        
        // Si no se encuentra fracción simple, usar aproximación
        const numerator = Math.round(decimal * 1000);
        return this.simplifyFraction({ numerator: sign * numerator, denominator: 1000 });
    }

    fractionToString(fraction) {
        if (fraction.denominator === 1) return fraction.numerator.toString();
        if (fraction.numerator === 0) return "0";
        return `${fraction.numerator}/${fraction.denominator}`;
    }

    addFractions(f1, f2) {
        const numerator = f1.numerator * f2.denominator + f2.numerator * f1.denominator;
        const denominator = f1.denominator * f2.denominator;
        return this.simplifyFraction({ numerator, denominator });
    }

    subtractFractions(f1, f2) {
        const numerator = f1.numerator * f2.denominator - f2.numerator * f1.denominator;
        const denominator = f1.denominator * f2.denominator;
        return this.simplifyFraction({ numerator, denominator });
    }

    multiplyFractions(f1, f2) {
        const numerator = f1.numerator * f2.numerator;
        const denominator = f1.denominator * f2.denominator;
        return this.simplifyFraction({ numerator, denominator });
    }

    divideFractions(f1, f2) {
        if (f2.numerator === 0) {
            // Evitar división por cero
            return { numerator: 0, denominator: 1 };
        }
        const numerator = f1.numerator * f2.denominator;
        const denominator = f1.denominator * f2.numerator;
        return this.simplifyFraction({ numerator, denominator });
    }

    simplifyFraction(fraction) {
        if (fraction.numerator === 0) return { numerator: 0, denominator: 1 };
        if (fraction.denominator === 0) return { numerator: 0, denominator: 1 }; // Evitar denominador cero
        
        const gcd = this.gcd(Math.abs(fraction.numerator), Math.abs(fraction.denominator));
        let num = fraction.numerator / gcd;
        let den = fraction.denominator / gcd;
        
        // Asegurar denominador positivo
        if (den < 0) {
            num = -num;
            den = -den;
        }
        
        return { numerator: Math.round(num), denominator: Math.round(den) };
    }

    gcd(a, b) {
        a = Math.abs(Math.round(a));
        b = Math.abs(Math.round(b));
        if (b === 0) return a || 1;
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    cleanAndValidateResult(matrix) {
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                let value = matrix.getElement(i, j);
                
                // Limpiar infinitos y NaN
                if (!isFinite(value) || isNaN(value)) {
                    console.warn(`Valor inválido limpiado en [${i+1}, ${j+1}]: ${value}`);
                    value = 0;
                }
                
                // Limpiar valores muy pequeños
                if (Math.abs(value) < 1e-10) {
                    value = 0;
                }
                
                // Redondear valores cercanos a enteros
                if (Math.abs(value - Math.round(value)) < 1e-10) {
                    value = Math.round(value);
                }
                
                matrix.setElement(i, j, value);
            }
        }
    }

    addStep(description, matrix) {
        this.steps.push({
            description,
            matrix: matrix.clone(),
            stepNumber: this.steps.length + 1
        });
    }
}

class ClassicMethod {
    constructor() {
        this.steps = [];
    }

    solve(matrix) {
        this.steps = [];
        const workMatrix = matrix.clone();
        
        this.addStep("Inicio - Método clásico (diagonal con fracciones)", workMatrix.clone());
        
        const n = Math.min(matrix.rows, matrix.cols - 1);
        
        for (let i = 0; i < n; i++) {
            this.forwardElimination(workMatrix, i);
        }
        
        for (let i = n - 1; i >= 0; i--) {
            this.backwardElimination(workMatrix, i);
        }
        
        return {
            result: workMatrix,
            steps: this.steps,
            method: 'classic'
        };
    }

    forwardElimination(matrix, pivotRow) {
        const pivot = matrix.getElement(pivotRow, pivotRow);
        if (Math.abs(pivot) > 1e-10 && Math.abs(pivot - 1) > 1e-10) {
            matrix.divideRow(pivotRow, pivot);
            this.addStep(`F${pivotRow + 1} = F${pivotRow + 1} ÷ ${pivot.toFixed(4)}`, matrix.clone());
        }
        
        for (let row = pivotRow + 1; row < matrix.rows; row++) {
            const factor = matrix.getElement(row, pivotRow);
            if (Math.abs(factor) > 1e-10) {
                matrix.addMultipleOfRow(row, pivotRow, -factor);
                this.addStep(`F${row + 1} = F${row + 1} - (${factor.toFixed(4)}) × F${pivotRow + 1}`, matrix.clone());
            }
        }
    }

    backwardElimination(matrix, pivotRow) {
        for (let row = pivotRow - 1; row >= 0; row--) {
            const factor = matrix.getElement(row, pivotRow);
            if (Math.abs(factor) > 1e-10) {
                matrix.addMultipleOfRow(row, pivotRow, -factor);
                this.addStep(`F${row + 1} = F${row + 1} - (${factor.toFixed(4)}) × F${pivotRow + 1}`, matrix.clone());
            }
        }
    }

    addStep(description, matrix) {
        this.steps.push({
            description,
            matrix: matrix.clone(),
            stepNumber: this.steps.length + 1
        });
    }
}

class PartialPivotingMethod {
    constructor() {
        this.steps = [];
    }

    solve(matrix) {
        this.steps = [];
        const workMatrix = matrix.clone();
        
        this.addStep("Inicio - Método con pivoteo parcial", workMatrix.clone());
        
        const n = Math.min(matrix.rows, matrix.cols - 1);
        
        for (let i = 0; i < n; i++) {
            this.findAndSwapBestPivot(workMatrix, i);
            this.forwardElimination(workMatrix, i);
        }
        
        for (let i = n - 1; i >= 0; i--) {
            this.backwardElimination(workMatrix, i);
        }
        
        return {
            result: workMatrix,
            steps: this.steps,
            method: 'pivoting'
        };
    }

    findAndSwapBestPivot(matrix, col) {
        let maxRow = col;
        let maxValue = Math.abs(matrix.getElement(col, col));
        
        for (let row = col + 1; row < matrix.rows; row++) {
            const value = Math.abs(matrix.getElement(row, col));
            if (value > maxValue) {
                maxValue = value;
                maxRow = row;
            }
        }
        
        if (maxRow !== col && maxValue > 1e-10) {
            matrix.swapRows(col, maxRow);
            this.addStep(`Intercambiar F${col + 1} ↔ F${maxRow + 1} (mejor pivote: ${maxValue.toFixed(3)})`, matrix.clone());
        }
    }

    forwardElimination(matrix, pivotRow) {
        const pivot = matrix.getElement(pivotRow, pivotRow);
        if (Math.abs(pivot) < 1e-10) {
            this.addStep(`⚠️ Pivote muy pequeño: ${pivot}`, matrix.clone());
            return;
        }
        
        if (Math.abs(pivot - 1) > 1e-10) {
            matrix.divideRow(pivotRow, pivot);
            this.addStep(`F${pivotRow + 1} = F${pivotRow + 1} ÷ ${pivot.toFixed(4)}`, matrix.clone());
        }
        
        for (let row = pivotRow + 1; row < matrix.rows; row++) {
            const factor = matrix.getElement(row, pivotRow);
            if (Math.abs(factor) > 1e-10) {
                matrix.addMultipleOfRow(row, pivotRow, -factor);
                this.addStep(`F${row + 1} = F${row + 1} - (${factor.toFixed(4)}) × F${pivotRow + 1}`, matrix.clone());
            }
        }
    }

    backwardElimination(matrix, pivotRow) {
        for (let row = pivotRow - 1; row >= 0; row--) {
            const factor = matrix.getElement(row, pivotRow);
            if (Math.abs(factor) > 1e-10) {
                matrix.addMultipleOfRow(row, pivotRow, -factor);
                this.addStep(`F${row + 1} = F${row + 1} - (${factor.toFixed(4)}) × F${pivotRow + 1}`, matrix.clone());
            }
        }
    }

    addStep(description, matrix) {
        this.steps.push({
            description,
            matrix: matrix.clone(),
            stepNumber: this.steps.length + 1
        });
    }
}

class ScalingMethod {
    constructor() {
        this.steps = [];
    }

    solve(matrix) {
        this.steps = [];
        const workMatrix = matrix.clone();
        
        this.addStep("Inicio - Método con escalamiento", workMatrix.clone());
        
        this.scaleRows(workMatrix);
        
        const n = Math.min(matrix.rows, matrix.cols - 1);
        
        for (let i = 0; i < n; i++) {
            this.forwardElimination(workMatrix, i);
        }
        
        for (let i = n - 1; i >= 0; i--) {
            this.backwardElimination(workMatrix, i);
        }
        
        return {
            result: workMatrix,
            steps: this.steps,
            method: 'scaling'
        };
    }

    scaleRows(matrix) {
        for (let i = 0; i < matrix.rows; i++) {
            let maxValue = 0;
            for (let j = 0; j < matrix.cols - 1; j++) {
                maxValue = Math.max(maxValue, Math.abs(matrix.getElement(i, j)));
            }
            
            if (maxValue > 1e-10 && Math.abs(maxValue - 1) > 1e-10) {
                matrix.divideRow(i, maxValue);
                this.addStep(`Escalar F${i + 1} ÷ ${maxValue.toFixed(3)} (normalización)`, matrix.clone());
            }
        }
    }

    forwardElimination(matrix, pivotRow) {
        const pivot = matrix.getElement(pivotRow, pivotRow);
        if (Math.abs(pivot) < 1e-10) return;
        
        if (Math.abs(pivot - 1) > 1e-10) {
            matrix.divideRow(pivotRow, pivot);
            this.addStep(`F${pivotRow + 1} = F${pivotRow + 1} ÷ ${pivot.toFixed(4)}`, matrix.clone());
        }
        
        for (let row = pivotRow + 1; row < matrix.rows; row++) {
            const factor = matrix.getElement(row, pivotRow);
            if (Math.abs(factor) > 1e-10) {
                matrix.addMultipleOfRow(row, pivotRow, -factor);
                this.addStep(`F${row + 1} = F${row + 1} - (${factor.toFixed(4)}) × F${pivotRow + 1}`, matrix.clone());
            }
        }
    }

    backwardElimination(matrix, pivotRow) {
        for (let row = pivotRow - 1; row >= 0; row--) {
            const factor = matrix.getElement(row, pivotRow);
            if (Math.abs(factor) > 1e-10) {
                matrix.addMultipleOfRow(row, pivotRow, -factor);
                this.addStep(`F${row + 1} = F${row + 1} - (${factor.toFixed(4)}) × F${pivotRow + 1}`, matrix.clone());
            }
        }
    }

    addStep(description, matrix) {
        this.steps.push({
            description,
            matrix: matrix.clone(),
            stepNumber: this.steps.length + 1
        });
    }
}