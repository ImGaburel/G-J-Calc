class Matrix {
    constructor(rows, cols, data = null) {
        this.rows = rows;
        this.cols = cols;
        this.data = data || Array(rows).fill().map(() => Array(cols).fill(0));
    }

    getElement(i, j) {
        return this.data[i][j];
    }

    setElement(i, j, value) {
        this.data[i][j] = value;
    }

    clone() {
        const cloned = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                cloned.data[i][j] = this.data[i][j];
            }
        }
        return cloned;
    }

    // MÉTODOS NUEVOS que faltaban
    copyFrom(otherMatrix) {
        if (this.rows !== otherMatrix.rows || this.cols !== otherMatrix.cols) {
            throw new Error('Las matrices deben tener las mismas dimensiones para copiar');
        }
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = otherMatrix.data[i][j];
            }
        }
    }

    isValid() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const value = this.data[i][j];
                if (!isFinite(value) || isNaN(value)) {
                    return false;
                }
            }
        }
        return true;
    }

    cleanSmallValues(threshold = 1e-10) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (Math.abs(this.data[i][j]) < threshold) {
                    this.data[i][j] = 0;
                }
            }
        }
    }

    // MÉTODOS EXISTENTES (los que ya tenías)
    swapRows(row1, row2) {
        if (row1 >= 0 && row1 < this.rows && row2 >= 0 && row2 < this.rows) {
            [this.data[row1], this.data[row2]] = [this.data[row2], this.data[row1]];
        }
    }

    multiplyRow(row, scalar) {
        if (row >= 0 && row < this.rows && Math.abs(scalar) > 1e-10) {
            for (let j = 0; j < this.cols; j++) {
                this.data[row][j] *= scalar;
            }
        }
    }

    divideRow(row, scalar) {
        if (row >= 0 && row < this.rows && Math.abs(scalar) > 1e-10) {
            for (let j = 0; j < this.cols; j++) {
                this.data[row][j] /= scalar;
            }
        }
    }

    addMultipleOfRow(targetRow, sourceRow, scalar) {
        if (targetRow >= 0 && targetRow < this.rows && 
            sourceRow >= 0 && sourceRow < this.rows) {
            for (let j = 0; j < this.cols; j++) {
                this.data[targetRow][j] += scalar * this.data[sourceRow][j];
            }
        }
    }

    toString() {
        return this.data.map(row => 
            row.map(val => {
                if (Math.abs(val) < 1e-10) return '0';
                if (Number.isInteger(val)) return val.toString();
                return parseFloat(val.toFixed(4)).toString();
            }).join('\t')
        ).join('\n');
    }

    // Método para determinar el rango de la matriz
    getRank() {
        const tempMatrix = this.clone();
        let rank = 0;
        
        for (let col = 0; col < Math.min(tempMatrix.rows, tempMatrix.cols); col++) {
            // Buscar pivote
            let pivotRow = -1;
            for (let row = rank; row < tempMatrix.rows; row++) {
                if (Math.abs(tempMatrix.getElement(row, col)) > 1e-10) {
                    pivotRow = row;
                    break;
                }
            }
            
            if (pivotRow === -1) continue;
            
            // Intercambiar filas
            if (pivotRow !== rank) {
                tempMatrix.swapRows(rank, pivotRow);
            }
            
            // Eliminar hacia abajo
            const pivot = tempMatrix.getElement(rank, col);
            for (let row = rank + 1; row < tempMatrix.rows; row++) {
                const factor = tempMatrix.getElement(row, col) / pivot;
                tempMatrix.addMultipleOfRow(row, rank, -factor);
            }
            
            rank++;
        }
        
        return rank;
    }

    // Método para verificar si la matriz es singular
    isSingular() {
        if (this.rows !== this.cols - 1) return false; // Solo para matrices cuadradas de coeficientes
        return this.getRank() < this.rows;
    }
}