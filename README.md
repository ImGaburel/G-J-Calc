# 🧮 GJ Calculator

Una calculadora web para resolver sistemas de ecuaciones lineales con el método de Gauss-Jordan. ¡Ya no más dolores de cabeza haciendo cálculos a mano o resolviendo con IA! 🎯

## 🚀 ¿Qué hace esta cosa?

Te permite resolver sistemas de ecuaciones de 2x2 hasta 6x6 con diferentes métodos súper avanzados.

### ✨ Características principales:

- 🛡️ **Método Robusto**: Nunca produce infinitos, trabaja con fracciones exactas (lo recomiendo mucho)
- 📚 **Método Clásico**: El de toda la vida, diagonal tradicional
- 🔄 **Pivoteo Parcial**: Busca automáticamente el mejor pivote
- 📏 **Escalamiento**: Normaliza las filas para mayor precisión

### 🎨 Se ve bonito porque tiene:

- **LaTeX profesional** - Las matrices se ven como en los libros de matemáticas
- **Interfaz responsive** - Para que se vea bien en celular y computadora
- **Pasos detallados** - Puedes ver todos los pasos e ir aprendiendo
- **Múltiples formatos** - Ecuaciones o matriz aumentada, como prefieras

## 🎮 Demo

**[¡Pruébala aquí!](https://imgaburel.github.io/G-J-Calc/)**

## 🛠️ ¿Cómo usarla?

1. **Elige cuántas ecuaciones** tienes (2 a 6)
2. **Selecciona el modo**: 
   - 📝 Ecuaciones (escribes como: 2x + 3y = 5)
   - 🔢 Matriz (solo números)
3. **Llena los valores** 
4. **Escoge el método** (recomiendo el Robusto 🛡️)
5. **¡Dale a resolver!** 
6. **Disfruta** viendo cómo se resuelve paso a paso

## 🔧 Tecnologías usadas

- **HTML** - La estructura
- **CSS y Bootstrap** - Para que se vea bonito y darle estilo
- **JavaScript** - Para realizar los calculos
- **MathJax** - Para que los resultados se vean esteticos y elegantes
- **Font Awesome** - Para los iconos

## 🐛 ¿Problemas conocidos?

- Si metes números muy grandes (más de 1000000) puede que se vuelva lento
- Funciona mejor en navegadores modernos (Chrome, Firefox, Safari, Edge)

## 🤝 ¿Quieres contribuir?

Si quieres mejorar algo:

1. Haz un **fork** del repo
2. Crea una **branch** nueva: `git checkout -b mi-mejora`
3. Haz tus cambios
4. **Commit**: `git commit -m "Agregué algo nuevooo"`
5. **Push**: `git push origin mi-mejora`
6. Abre un **Pull Request**

### Ideas para mejoras futuras:
- [ ] Agregar determinantes
- [ ] Matriz inversa
- [ ] English version
- [ ] Exportar resultados a PDF
- [ ] Modo oscuro 🌙
- [ ] Historial de cálculos

## 📚 ¿Cómo funciona por dentro?

La calculadora usa diferentes algoritmos del método de Gauss-Jordan:

- **Método Robusto**: Usa aritmética de fracciones exactas para evitar errores de punto flotante
- **Pivoteo Parcial**: Selecciona automáticamente el mejor pivote para mayor estabilidad
- **Escalamiento**: Normaliza las filas para mejorar la precisión numérica

## 🎓 ¿Para qué sirve?

Perfecto para:
- Estudiantes de álgebra lineal
- Tareas de matemáticas
- Verificar resultados hechos a mano
- Aprender el proceso paso a paso
- Profesores que quieren mostrar ejemplos

## 📄 Licencia

MIT License - Úsala como quieras, para lo que quieras. Espero te sea de mucha utilidad :)

## 🙋‍♂️ Autor

**ImGaburel** 
- GitHub: [@ImGaburel](https://github.com/ImGaburel)

**¿Te gustó? ¡Dale una ⭐ al repo!** 

¿Encontraste un bug? ¡Avísame en los issues!

¿Tienes una idea genial? ¡También avísame!

---

*Hecho con 💖 y muchas ganas de que las matemáticas sean menos dolorosas*

**Última actualización:** Junio 2025

![GitHub stars](https://img.shields.io/github/stars/ImGaburel/G-J-Calc)
![GitHub forks](https://img.shields.io/github/forks/ImGaburel/G-J-Calc)
![GitHub issues](https://img.shields.io/github/issues/ImGaburel/G-J-Calc)