# Mapa de trabajo — Spec-Driven Development con OpenCode

## 🗺️ Flujo completo

```text
                 ┌──────────────────────────┐
                 │  1. PREPARAR PROYECTO    │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │  2. INSTALAR SKILLS      │
                 │     DE FERNANDO          │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │  3. CREAR / CONFIGURAR  │
                 │     specs/               │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │  4. DESCRIBIR QUÉ       │
                 │     PROBLEMA QUERÉS     │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │  5. /spec               │
                 │     → PLAN MODE         │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │  6. PREGUNTAS /         │
                 │     ACLARACIONES        │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │  7. REFINAR EL SPEC     │
                 │     hasta estar conforme│
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │  8. SE GUARDA            │
                 │  specs/NN-nombre.md     │
                 │  Status: Draft          │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │  9. REVISAR EL SPEC     │
                 │     MANUALMENTE         │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │ 10. Draft → Approved    │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │ 11. /spec-impl          │
                 │     NN-nombre-feature    │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │ 12. VALIDAR Approved    │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │ 13. RAMA GIT             │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │ 14. IMPLEMENTAR PASO    │
                 │     POR PASO            │
                 └────────────┬─────────────┘
                              ↓
                 ┌──────────────────────────┐
                 │ 15. PAUSA + REVISAR DIFF│
                 └────────────┬─────────────┘
                              ↓
                       ¿Está bien?
                      /          \
                    NO            SÍ
                    ↓              ↓
              corregir /       siguiente
              actualizar SPEC     paso
                                   ↓
                              repetir
                                   ↓
                 ┌──────────────────────────┐
                 │ 16. FEATURE TERMINADA   │
                 │     + CRITERIOS OK      │
                 └──────────────────────────┘
```

---

# 1. Preparar el proyecto

Partir de un proyecto Git/OpenCode.

Ejemplo:

```text
05-Pacman/
├── ...
├── AGENTS.md
├── opencode.jsonc
└── specs/
```

La carpeta `specs/` será donde se guardarán las especificaciones.

---

# 2. Instalar los Skills de Fernando Herrera

Repositorio:

**Klerith/fernando-skills**

Instalación indicada por el repositorio:

```bash
npx skills@latest add Klerith/fernando-skills
```

Los skills principales que interesan para este flujo son:

```text
/spec
/spec-impl
```

> La instalación/configuración concreta puede variar según la versión de OpenCode y lo mostrado en el curso. El concepto importante es disponer de los skills `/spec` y `/spec-impl`.

---

# 3. Crear la carpeta `specs/`

En la raíz del proyecto:

```text
specs/
```

Ejemplo:

```text
specs/
├── 01-ghosts-personalidades.md
├── 02-corregir-salida-fantasmas.md
└── ...
```

Las especificaciones quedan almacenadas allí y sirven como contrato para la implementación.

---

# 4. Describir el PROBLEMA

Antes de pedir código, describir **qué problema se quiere resolver o qué comportamiento se quiere conseguir**.

## Mejor

```text
Quiero corregir el comportamiento de los fantasmas
cuando salen de la casa.
```

## Evitar

```text
Modificá ghost.js, agregá una función releaseGhost()
y cambiá el timer.
```

La idea es describir el **qué**, no imponer de entrada el **cómo**.

---

# 5. Ejecutar `/spec`

Ejemplo:

```text
/spec corregir-salida-fantasmas
```

Este comando sirve para **crear la especificación**, no para implementar el código.

Flujo:

```text
/spec
   ↓
análisis
   ↓
preguntas
   ↓
refinamiento
   ↓
SPEC
```

---

# 6. OpenCode entra en modo PLAN

En esta etapa todavía **no se programa**.

OpenCode analiza el requerimiento y prepara el diseño.

El SPEC puede incluir:

- Objetivo
- Alcance
- Fuera de alcance
- Archivos afectados
- Modelo de datos
- Decisiones técnicas
- Plan de implementación
- Criterios de aceptación
- Riesgos
- Decisiones tomadas

La finalidad es determinar **qué hay que construir y cómo debería abordarse** antes de escribir código.

---

# 7. Responder las preguntas de aclaración

`/spec` puede hacer preguntas para eliminar ambigüedades.

Ejemplo:

```text
Pregunta 1:
¿Querés que el fantasma salga inmediatamente
o después de determinado tiempo?

Pregunta 2:
¿Todos los fantasmas deben seguir la misma regla?

Pregunta 3:
¿Qué ocurre si Pacman pierde una vida?
```

Se responde y se continúa refinando.

El proceso puede ser:

```text
pregunta
   ↓
respuesta
   ↓
análisis
   ↓
otra pregunta
   ↓
respuesta
```

hasta que el requerimiento esté suficientemente definido.

---

# 8. Refinar el SPEC

No hay que aceptar necesariamente el primer resultado.

Se puede indicar:

```text
Eso no quiero que esté incluido.

Agregá este caso.

Esto queda fuera de alcance.

Quiero que este comportamiento sea diferente.

Esta decisión técnica no es correcta.
```

El objetivo es llegar a una especificación que realmente represente lo que se quiere construir.

Conceptualmente:

```text
SPEC v1
   ↓
revisión
   ↓
SPEC v2
   ↓
revisión
   ↓
SPEC definitivo
```

---

# 9. Se genera el archivo `.md`

La especificación queda en:

```text
specs/NN-nombre-feature.md
```

Por ejemplo:

```text
specs/02-corregir-salida-fantasmas.md
```

Inicialmente puede tener:

```text
Status: Draft
```

**Draft significa que todavía no está aprobado para implementar.**

---

# 10. Revisar manualmente el SPEC

Abrir el archivo:

```text
specs/02-corregir-salida-fantasmas.md
```

Y revisarlo cuidadosamente.

Preguntarse:

- ¿Esto es realmente lo que quiero?
- ¿Está incluido todo?
- ¿Hay algo que no quiero?
- ¿Los criterios de aceptación son correctos?
- ¿Los pasos de implementación tienen sentido?
- ¿Hay alguna decisión equivocada?
- ¿El alcance está bien definido?

La revisión humana es una parte fundamental del proceso.

---

# 11. Cambiar `Draft` → `Approved`

Cuando la especificación está correcta:

```text
Status: Draft
```

se cambia a:

```text
Status: Approved
```

La aprobación significa:

> "Estoy de acuerdo con esta especificación y autorizo su implementación."

Este paso funciona como una **firma humana sobre el contrato de implementación**.

---

# 12. Ejecutar `/spec-impl`

Una vez aprobado el SPEC:

```text
/spec-impl 02-corregir-salida-fantasmas
```

Ahora comienza la implementación.

La secuencia completa es:

```text
/spec
   ↓
SPEC Draft
   ↓
revisión humana
   ↓
Approved
   ↓
/spec-impl
   ↓
código
```

---

# 13. `/spec-impl` busca y valida el SPEC

Busca:

```text
specs/02-corregir-salida-fantasmas.md
```

y comprueba que esté aprobado:

```text
Status: Approved
```

Si todavía está en:

```text
Status: Draft
```

no debería implementarse.

---

# 14. Se crea / utiliza una rama de Git

El flujo contempla trabajar en una rama específica para la implementación.

Ejemplo:

```text
spec-02-corregir-salida-fantasmas
```

Esto permite mantener aislados los cambios de esa funcionalidad.

---

# 15. Implementar PASO A PASO

El SPEC contiene un plan de implementación.

Ejemplo:

```text
Implementation Plan

1. Modificar X
2. Crear Y
3. Cambiar comportamiento de Z
4. Agregar tests
5. Verificar criterios de aceptación
```

La implementación debe avanzar de manera controlada:

```text
Paso 1
   ↓
PAUSA
   ↓
revisión
   ↓
Paso 2
   ↓
PAUSA
   ↓
revisión
   ↓
Paso 3
   ↓
...
```

---

# 16. Revisar el DIFF después de cada paso

Después de cada cambio:

```text
Paso 1
   ↓
git diff
   ↓
¿Está bien?
```

Si está bien:

```text
CONTINUAR
```

Si está mal:

```text
DETENER
   ↓
CORREGIR
   ↓
CONTINUAR
```

La ventaja es evitar llegar al final con cientos de cambios y descubrir demasiado tarde que una decisión inicial era incorrecta.

---

# 17. ¿Qué hacer si aparece una nueva idea durante la implementación?

Regla importante:

## ❌ No improvisar directamente en el código

Por ejemplo:

```text
Estoy implementando...

"Ah, también estaría bueno agregar X"

→ modifico el código directamente
```

## ✅ Volver al SPEC

La secuencia correcta es:

```text
DETENER IMPLEMENTACIÓN
        ↓
volver al SPEC
        ↓
modificar/refinar SPEC
        ↓
volver a Approved
        ↓
continuar /spec-impl
```

El SPEC debe seguir siendo la fuente de verdad.

---

# 18. Finalizar la implementación

Cuando todos los pasos están terminados:

```text
Feature terminada
        ↓
verificar criterios de aceptación
        ↓
revisar cambios
        ↓
tests / validaciones
        ↓
finalizar
```

El resultado esperado es que el código implemente exactamente lo que estaba definido en el SPEC aprobado.

---

# 🎯 RESUMEN ULTRA RÁPIDO

Esta es la versión para tener al lado de OpenCode:

```text
SPEC-DRIVEN DEVELOPMENT
────────────────────────────────────

1. Preparar proyecto
        ↓
2. Instalar Fernando Skills
        ↓
3. Crear specs/
        ↓
4. Describir el PROBLEMA
   (no la solución)
        ↓
5. /spec nombre-feature
        ↓
6. OpenCode → PLAN MODE
        ↓
7. Responder preguntas
        ↓
8. Refinar / corregir
        ↓
9. Se crea:
   specs/NN-nombre-feature.md
   Status: Draft
        ↓
10. YO reviso el SPEC
        ↓
11. Cambio:
    Draft → Approved
        ↓
12. /spec-impl NN-nombre-feature
        ↓
13. Valida que esté Approved
        ↓
14. Rama Git
        ↓
15. Implementa PASO 1
        ↓
16. PAUSA
        ↓
17. Reviso DIFF
        ↓
18. ¿Está bien?
       ↙     ↘
     NO       SÍ
      ↓        ↓
   corregir   paso siguiente
               ↓
             repetir
        ↓
19. Feature terminada
        ↓
20. Verificar criterios de aceptación
```

---

# 🧠 IDEA CENTRAL

## `/spec`

**NO hace el código.**

Su función es decidir:

> **¿Qué hay que construir?**

Produce el SPEC.

---

## `/spec-impl`

**NO decide qué construir.**

Su función es:

> **Construir lo que dice el SPEC aprobado.**

---

## La separación fundamental

```text
                 PROBLEMA
                    ↓
                  /spec
                    ↓
             ┌──────────────┐
             │     SPEC     │
             │    Draft     │
             └──────┬───────┘
                    ↓
             REVISIÓN HUMANA
                    ↓
             ┌──────────────┐
             │   Approved   │
             └──────┬───────┘
                    ↓
               /spec-impl
                    ↓
             IMPLEMENTACIÓN
                    ↓
            PASO → DIFF → OK
                    ↓
            PASO → DIFF → OK
                    ↓
            PASO → DIFF → OK
                    ↓
               FINALIZADO
```

### Frase para recordar

> **`/spec` decide qué construir.**  
> **`/spec-impl` construye lo que el SPEC aprobado dice.**

El SPEC es el **contrato** entre vos y el agente.
