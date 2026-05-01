# 📡 Teoría de la Información — Trabajos Prácticos

> **Facultad de Ingeniería** · Cátedra: Teoría de la Información  
> Lenguaje: JavaScript (Node.js)

---

## 📋 Índice

- [Descripción General](#-descripción-general)
- [Requisitos Previos](#-requisitos-previos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [TP1 — Fuentes de Información](#-tp1--fuentes-de-información)
- [TP2 — Codificación de Fuente](#-tp2--codificación-de-fuente)
- [TP3 — Compresión LZW](#-tp3--compresión-lzw)
- [TP4 — Canal Discreto sin Memoria](#-tp4--canal-discreto-sin-memoria)
- [Material Complementario](#-material-complementario)
- [Autores](#-autores)
- [Licencia](#-licencia)

---

## 📖 Descripción General

Repositorio con los **cuatro trabajos prácticos** de la materia **Teoría de la Información**, implementados en **JavaScript (Node.js)**. Cada TP aborda un tema fundamental de la teoría de la información de Shannon:

| TP | Tema | Conceptos clave |
|----|------|-----------------|
| 1 | Fuentes de Información | Entropía, memoria, vector estacionario, extensión de fuente |
| 2 | Codificación de Fuente | Kraft-McMillan, código instantáneo, código compacto, longitud media |
| 3 | Compresión LZW | Lempel-Ziv-Welch, tasa de compresión, rendimiento, redundancia |
| 4 | Canal Discreto sin Memoria | Entropía condicional, equivocación, información mutua, paridad cruzada |

---

## ⚙️ Requisitos Previos

- **Node.js** ≥ 14.x  
  ```bash
  # Verificar instalación
  node --version
  ```

No se requieren dependencias externas (npm install). Todos los scripts usan exclusivamente módulos nativos de Node.js (`fs`, `path`, `buffer`).

---

## 📁 Estructura del Proyecto

```
Teoria Informacion/
│
├── tp1/
│   ├── TP1.js                  # Análisis de fuentes de información binarias
│   └── informeTP1.docx         # Informe del TP1
│
├── tp2/
│   ├── tp2CodeV4.js             # Codificación de fuente y propiedades de códigos
│   └── informe Tp2.docx        # Informe del TP2
│
├── tp3/
│   ├── tpi3.js                  # Compresor/descompresor LZW
│   └── informeTP3.docx         # Informe del TP3
│
├── tp4.js                       # Simulación de canal discreto sin memoria
├── informe tp4.docx             # Informe del TP4

│
├── varios/                      # Material de apoyo
│   ├── TP1_DiagramaFlujo.png    # Diagrama de flujo del TP1
│   ├── TP1_CalculoVectorEstacionario.png  # Cálculo del vector estacionario
│   ├── ExplicacionTieneMemoria.docx       # Explicación teórica sobre memoria
│   └── Tp2.docx                 # Notas adicionales del TP2
│
└── README.md                    # Este archivo
```

---

## 🔬 TP1 — Fuentes de Información

### Descripción

Analiza archivos binarios (`.bin`) para determinar las propiedades estadísticas de una fuente de información binaria. Calcula probabilidades individuales y condicionales (pares), determina si la fuente tiene **memoria nula o no nula**, y en cada caso realiza el análisis correspondiente.

### Conceptos implementados

- **Probabilidades marginales**: P(0), P(1)
- **Probabilidades condicionales**: P(00), P(01), P(10), P(11) — calculadas como frecuencias relativas de pares consecutivos
- **Detección de memoria**: compara P(0|0) ≈ P(0|1) y P(1|0) ≈ P(1|1) con tolerancia ε = 0.01
- **Fuente sin memoria (memoria nula)**:
  - Entropía de la fuente: H(S) = Σ p(s) · log₂(1/p(s))
  - Extensión de orden N y su entropía
- **Fuente con memoria (memoria NO nula)**:
  - Vector estacionario [X₀, X₁] mediante la relación X₁ = (b/c) · X₀

### Uso

```bash
# Análisis básico
node tp1/TP1.js <archivo.bin>

# Análisis con extensión de orden N
node tp1/TP1.js <archivo.bin> <N>
```

### Ejemplo

```bash
node tp1/TP1.js tp1_samples/tp1_sample1.bin
# Salida:
# probabilites { '0': 0.625, '1': 0.375, pairs: { '00': 0.6, '01': 0.4, '10': 0.333, '11': 0.667 } }
# Es de memoria NO nula
# Vector estacionario: [0.4545, 0.5454]

node tp1/TP1.js tp1_samples/tp1_sample2.bin 3
# Salida:
# Es de memoria nula
# Entropia: 0.9710
# Extensión: 000 (21.88%), 001 (9.38%), ...
# Entropia de la extension: 2.9130
```

### Diagrama de flujo

El flujo del programa sigue la siguiente lógica:

1. Lee el archivo binario bit a bit
2. Cuenta ocurrencias individuales y de pares consecutivos
3. Calcula probabilidades marginales y condicionales
4. Determina si tiene memoria o no
5. Si **tiene memoria** → calcula el vector estacionario
6. Si **no tiene memoria** → calcula entropía y opcionalmente la extensión de orden N

---

## 🔤 TP2 — Codificación de Fuente

### Descripción

Analiza un archivo de texto que contiene palabras código (una por línea o separadas por espacios) y evalúa las propiedades del código resultante según los fundamentos de la codificación de fuente.

### Conceptos implementados

- **Entropía de la fuente**: H = Σ p(sᵢ) · log_D(1/p(sᵢ)) — donde D es el tamaño del alfabeto del código
- **Longitud media**: L = Σ p(sᵢ) · lᵢ
- **Desigualdad de Kraft-McMillan**: Σ D^(−lᵢ) ≤ 1
- **Código instantáneo**: ninguna palabra código es prefijo de otra
- **Código compacto**: evalúa si las longitudes de las palabras código son óptimas respecto a la información de cada símbolo

### Uso

```bash
node tp2/tp2CodeV4.js <archivo_codigo.txt>
```

### Ejemplo

```bash
node tp2/tp2CodeV4.js codigos/codigo1.txt
# Salida:
# Palabras:
#   00
#   01
#   10
#   11
# Alfabeto fuente:
#   0
#   1
#
# Entropia: 1.0
# Longitud Media: 2.0
# Cumple con Kraft / McMillan
# Instantaneo: true
# Compacto: true
```

### Formato del archivo de entrada

El archivo de texto debe contener las palabras código separadas por espacios o saltos de línea:

```
00 01 10 110 111
```

---

## 🗜️ TP3 — Compresión LZW

### Descripción

Implementación completa del algoritmo de compresión **Lempel-Ziv-Welch (LZW)** con soporte para compresión y descompresión. El programa genera archivos binarios comprimidos y calcula métricas de rendimiento.

### Conceptos implementados

- **Compresión LZW**: construcción dinámica del diccionario durante la compresión
- **Descompresión LZW**: reconstrucción del diccionario durante la descompresión
- **Escritura/lectura binaria**: empaquetado de códigos con bits variables en archivos binarios
- **Tasa de compresión**: tamaño_original / tamaño_comprimido
- **Rendimiento**: η = H / L (entropía / longitud del código)
- **Redundancia**: R = 1 − η

### Uso

```bash
# Comprimir
node tp3/tpi3.js <archivo_texto> <archivo_binario> -c

# Descomprimir
node tp3/tpi3.js <archivo_texto> <archivo_binario> -d
```

### Ejemplo

```bash
# Comprimir un archivo de texto
node tp3/tpi3.js entrada.txt salida.bin -c
# Salida:
# Compresión exitosa!
#
# Tasa de compresion: 1.85:1
# Rendimiento: 0.8923
# Redundancia: 0.1077

# Descomprimir el archivo
node tp3/tpi3.js salida_descomprimida.txt salida.bin -d
# Salida:
# Descompresión exitosa!
#
# Tasa de compresion: 1.85:1
# Rendimiento: 0.8923
# Redundancia: 0.1077
```

### Detalles técnicos

- El diccionario se inicializa con los 256 caracteres ASCII estándar
- Los códigos se almacenan en formato binario con la cantidad mínima de bits necesaria
- El primer byte del archivo binario indica la cantidad de bits por código
- Los números se escriben en **little endian** a nivel de bits

---

## 📡 TP4 — Canal Discreto sin Memoria

### Descripción

Simulación de un **canal discreto sin memoria (DMC)**. A partir de una matriz de canal (probabilidades de transición), genera mensajes aleatorios, los transmite a través del canal simulado y evalúa las propiedades del canal. Opcionalmente implementa **control de errores por paridad cruzada**.

### Conceptos implementados

- **Probabilidades del canal**:
  - P(A) — probabilidad a priori de la fuente
  - P(B|A) — probabilidad de transición (matriz de canal)
  - P(B) — probabilidad marginal de la salida
  - P(A|B) — probabilidad a posteriori (Bayes)
  - P(A,B) — probabilidad conjunta
- **Información**:
  - I(A), I(B) — información propia
  - I(B|A), I(A|B) — información condicional
- **Entropías**:
  - H(A), H(B) — entropía de la fuente y del destino
  - H(A|B) — equivocación
  - H(B|A) — entropía del canal
- **Información mutua**: I(A;B) = H(A) − H(A|B)
- **Paridad cruzada** (flag `-p`):
  - Agrega bits de paridad por fila y columna
  - Detección y corrección de errores simples

### Uso

```bash
# Sin paridad
node tp4.js <archivo_matriz> <N_filas> <M_columnas>

# Con paridad cruzada
node tp4.js <archivo_matriz> <N_filas> <M_columnas> -p
```

### Formato del archivo de matriz

El archivo de texto debe contener la matriz de canal con el siguiente formato:

```
P(A=0)   P(A=1)
P(B=0|A=0)  P(B=1|A=0)
P(B=0|A=1)  P(B=1|A=1)
```

**Ejemplo** (Canal binario simétrico con p = 0.1):
```
0.5 0.5
0.9 0.1
0.1 0.9
```

### Ejemplo

```bash
node tp4.js canal_bsc.txt 10 8
# Salida:
# entropia de canal A 1.0 equivocacion A_B 0.531 informacion mutua A_B 0.469
# entropia de canal B 1.0 equivocacion B_A 0.531 informacion mutua B_A 0.469
# mensajes correctos: 7 mensaje incorrectos: 3

node tp4.js canal_bsc.txt 10 8 -p
# Salida (adicional):
# Se puede correjir fila 2 columna 5
# mensajes correctos: 8 mensaje incorrectos: 2
```

---

## 📚 Material Complementario

En la carpeta `varios/` se encuentran recursos de apoyo:

| Archivo | Descripción |
|---------|-------------|
| `TP1_DiagramaFlujo.png` | Diagrama de flujo del algoritmo del TP1 |
| `TP1_CalculoVectorEstacionario.png` | Desarrollo matemático del cálculo del vector estacionario para fuentes con memoria |
| `ExplicacionTieneMemoria.docx` | Explicación teórica sobre cómo determinar si una fuente tiene memoria |
| `Tp2.docx` | Notas complementarias del TP2 |

---

## 🧰 Resumen de Comandos

```bash
# TP1 - Fuentes de Información
node tp1/TP1.js <archivo.bin>             # Análisis básico
node tp1/TP1.js <archivo.bin> <N>         # Con extensión de orden N

# TP2 - Codificación de Fuente
node tp2/tp2CodeV4.js <archivo_codigo.txt>

# TP3 - Compresión LZW
node tp3/tpi3.js <texto> <binario> -c     # Comprimir
node tp3/tpi3.js <texto> <binario> -d     # Descomprimir

# TP4 - Canal Discreto sin Memoria
node tp4.js <matriz> <N> <M>              # Sin paridad
node tp4.js <matriz> <N> <M> -p           # Con paridad cruzada
```

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para la cátedra de **Teoría de la Información** de la Facultad de Ingeniería.
