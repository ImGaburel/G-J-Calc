class Solver {
    constructor() {
        this.gaussJordanMethods = new GaussJordanMethods();
        this.mathRenderer = new MathRenderer();
    }

    solve(matrix, methodName = 'robust') {
        try {
            console.log('🔍 Solver.solve called with:', {
                matrix: matrix,
                methodName: methodName,
                matrixType: typeof matrix,
                isArray: Array.isArray(matrix)
            });
            
            if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
                throw new Error('Matriz inválida o vacía');
            }
            
            // Validar que cada fila sea un array
            for (let i = 0; i < matrix.length; i++) {
                if (!Array.isArray(matrix[i])) {
                    throw new Error(`Fila ${i} de la matriz no es válida`);
                }
            }
            
            const result = this.gaussJordanMethods.solve(matrix, methodName);
            
            console.log('✅ GaussJordan result:', result);
            
            // Verificar que el resultado tenga una matriz válida
            if (!result || !result.matrix || !Array.isArray(result.matrix)) {
                throw new Error('El método de resolución no devolvió una matriz válida');
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Error in Solver.solve:', error);
            console.error('Matrix received:', matrix);
            throw error;
        }
    }

    // Método para validar la matriz antes de resolver
    validateMatrix(matrix) {
        if (!matrix || !Array.isArray(matrix)) {
            return { valid: false, error: 'La matriz no es un array válido' };
        }
        
        if (matrix.length === 0) {
            return { valid: false, error: 'La matriz está vacía' };
        }
        
        const cols = matrix[0].length;
        if (cols < 2) {
            return { valid: false, error: 'La matriz debe tener al menos 2 columnas' };
        }
        
        // Verificar que todas las filas tengan el mismo número de columnas
        for (let i = 0; i < matrix.length; i++) {
            if (!Array.isArray(matrix[i])) {
                return { valid: false, error: `Fila ${i + 1} no es un array válido` };
            }
            
            if (matrix[i].length !== cols) {
                return { valid: false, error: `La fila ${i + 1} tiene ${matrix[i].length} columnas, se esperaban ${cols}` };
            }
            
            // Verificar que todos los valores sean números
            for (let j = 0; j < matrix[i].length; j++) {
                const value = matrix[i][j];
                if (typeof value !== 'number' || isNaN(value)) {
                    return { valid: false, error: `El valor en fila ${i + 1}, columna ${j + 1} no es un número válido: ${value}` };
                }
            }
        }
        
        return { valid: true };
    }

    // Método para obtener información sobre el sistema
    getSystemInfo(matrix) {
        if (!matrix || matrix.length === 0) return null;
        
        const rows = matrix.length;
        const cols = matrix[0].length;
        const variables = cols - 1;
        
        return {
            equations: rows,
            variables: variables,
            augmentedMatrix: true,
            systemType: rows === variables ? 'determinado' : (rows < variables ? 'indeterminado' : 'sobredeterminado')
        };
    }

    // Método para renderizar la solución completa
    renderCompleteSolution(matrix, methodName, steps = null) {
        try {
            let html = '';
            
            // Información del sistema
            const systemInfo = this.getSystemInfo(matrix);
            if (systemInfo) {
                html += `
                    <div class="alert alert-info mt-3">
                        <h6><i class="fas fa-info-circle"></i> Información del Sistema:</h6>
                        <small>
                            📊 ${systemInfo.equations} ecuación${systemInfo.equations > 1 ? 'es' : ''}, 
                            ${systemInfo.variables} variable${systemInfo.variables > 1 ? 's' : ''} 
                            (${systemInfo.systemType})
                        </small>
                    </div>
                `;
            }
            
            // Resolver el sistema
            const result = this.solve(matrix, methodName);
            
            // Renderizar la solución
            html += this.mathRenderer.renderSolution(result.matrix, methodName);
            
            // Renderizar pasos si están disponibles
            if (result.steps && result.steps.length > 0) {
                html += this.mathRenderer.renderSteps(result.steps);
            }
            
            return html;
            
        } catch (error) {
            console.error('Error rendering complete solution:', error);
            return `
                <div class="alert alert-danger mt-3">
                    <h6><i class="fas fa-exclamation-triangle"></i> Error al resolver:</h6>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    // Método para obtener métodos disponibles
    getAvailableMethods() {
        return this.gaussJordanMethods.getAvailableMethods();
    }

    // Método para verificar si una matriz tiene solución única
    hasUniqueSolution(matrix) {
        try {
            const result = this.solve(matrix, 'robust');
            
            // Verificar si la matriz está en forma escalonada reducida
            const reducedMatrix = result.matrix;
            const rows = reducedMatrix.length;
            const cols = reducedMatrix[0].length;
            const variables = cols - 1;
            
            // Verificar diagonal principal
            let hasUnique = true;
            for (let i = 0; i < Math.min(rows, variables); i++) {
                if (Math.abs(reducedMatrix[i][i]) < 1e-10) {
                    hasUnique = false;
                    break;
                }
            }
            
            return hasUnique;
            
        } catch (error) {
            return false;
        }
    }

    // Método para detectar sistemas inconsistentes
    isInconsistent(matrix) {
        try {
            const result = this.solve(matrix, 'robust');
            const reducedMatrix = result.matrix;
            
            // Buscar filas con ceros en todas las variables pero no en el resultado
            for (let i = 0; i < reducedMatrix.length; i++) {
                const row = reducedMatrix[i];
                let allZeros = true;
                
                // Verificar todas las columnas excepto la última
                for (let j = 0; j < row.length - 1; j++) {
                    if (Math.abs(row[j]) > 1e-10) {
                        allZeros = false;
                        break;
                    }
                }
                
                // Si todas las variables son cero pero el resultado no
                if (allZeros && Math.abs(row[row.length - 1]) > 1e-10) {
                    return true; // Sistema inconsistente
                }
            }
            
            return false;
            
        } catch (error) {
            return true; // Si hay error, asumir inconsistente
        }
    }
}