# Especificación funcional - Up Down River Score

## 1. Objetivo

Desarrollar una aplicación **web mobile** para llevar el puntaje de partidas del juego de cartas **Up Down River** (variante de bazas / trick-taking), enfocada exclusivamente en facilitar el registro de manos y el cálculo automático de puntos.

La aplicación **no simula el juego**, no reparte cartas y no administra bazas jugadas carta por carta. Su propósito es funcionar como **scorekeeper** durante una partida real presencial, usada por una sola persona desde un dispositivo móvil.

---

## 2. Alcance del MVP actual

La versión actual permite:

- crear una nueva partida
- ingresar entre 3 y 7 jugadores
- elegir el idioma de la interfaz (**español** o **inglés**) desde la pantalla principal
- elegir una opción global para tamaño de fuente (**normal**, **grande**, **extra grande**)
- dejar **inglés como idioma por defecto** al abrir la app
- elegir la regla aplicable al cero fallado
- indicar qué jugador comienza dando cartas
- recorrer automáticamente la secuencia completa de manos
- mostrar en cada mano quién reparte
- cargar por cada jugador el número de bazas declaradas
- marcar si el jugador acertó o no en esa mano
- calcular automáticamente el puntaje de la mano
- acumular el puntaje total por jugador
- mostrar resultados por mano y ranking final
- consultar el historial de la partida
- reiniciar la app y comenzar una partida nueva desde cero en cualquier momento
- persistir localmente el estado de la partida en curso
- mostrar un footer persistente con copyright
- mostrar número de versión visible en el footer
- permitir reabrir la última mano cerrada para corregirla

La versión actual **no incluye**:

- multijugador online
- login o cuentas de usuario
- sincronización entre dispositivos
- backend
- publicación en stores
- simulación del juego
- administración de cartas o bazas reales carta por carta
- edición retroactiva de manos cerradas

---

## 3. Plataforma objetivo

- **tipo:** web mobile
- **uso inicial:** navegador móvil y navegador desktop
- **operación:** una sola persona carga y administra la partida
- **persistencia:** almacenamiento local del navegador (`localStorage`)
- **evolución posible:** futura conversión a PWA instalable

---

## 4. Reglas del juego a soportar

### 4.1 Cantidad de jugadores

- mínimo: **3 jugadores**
- máximo: **7 jugadores**

### 4.2 Secuencia de manos

La partida sigue esta secuencia fija de cartas repartidas por mano:

**7, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7**

Total de manos:
- **14 manos**

### 4.3 Regla de puntuación base

Para cada jugador en una mano:

#### Si el jugador dijo un número mayor a 0 y acierta

- suma **10 + cantidad de bazas que dijo**

Ejemplos:
- si dijo 3 y acierta: suma **13**
- si dijo 1 y acierta: suma **11**

#### Si el jugador dijo un número mayor a 0 y no acierta

- suma **0**

#### Si el jugador dijo 0 y acierta

- suma **10 + cantidad de cartas repartidas en esa mano**

Ejemplos:
- en mano de 7 cartas: suma **17**
- en mano de 4 cartas: suma **14**
- en mano de 1 carta: suma **11**

### 4.4 Regla configurable para cero fallado

Al iniciar la partida, el usuario puede elegir una de estas dos opciones:

#### Opción A
**Cero fallado resta 10 puntos**
- si el jugador dijo `0` y no acertó:
  - puntos = `-10`

#### Opción B
**Cero fallado no suma puntos**
- si el jugador dijo `0` y no acertó:
  - puntos = `0`

### 4.5 Resumen de fórmula

Dado:
- `cartasMano`
- `dijo`
- `acerto`
- `zeroMissRule`

Reglas:

- si `acerto = true` y `dijo > 0` → puntos = `10 + dijo`
- si `acerto = true` y `dijo = 0` → puntos = `10 + cartasMano`
- si `acerto = false` y `dijo > 0` → puntos = `0`
- si `acerto = false` y `dijo = 0`:
  - si `zeroMissRule = "minus10"` → puntos = `-10`
  - si `zeroMissRule = "zero"` → puntos = `0`

---

## 5. Objetivo funcional de la interfaz

La app debe minimizar la fricción al momento de cargar cada mano.

Por decisión funcional, en la pantalla de cada mano **no se ingresará cuántas bazas hizo realmente el jugador**. Solo se registrará:

- cuántas bazas dijo
- si acertó o no

Con eso alcanza para calcular el puntaje según la variante definida.

Esto simplifica notablemente el uso durante una partida real.

---

## 6. Flujo general de uso

### 6.1 Pantalla principal
El usuario:
- abre la app
- ve la pantalla principal
- puede elegir idioma (**Español** o **English**)
- puede elegir tamaño de fuente (**normal**, **grande**, **extra grande**)
- puede comenzar una nueva partida
- si existe una partida en curso, puede continuarla o descartarla y empezar una nueva desde cero

### 6.2 Crear partida
El usuario:
- ingresa nombres de jugadores
- define la regla para cero fallado
- indica qué jugador comienza repartiendo
- inicia la partida

### 6.3 Cargar mano
Para cada mano:
- la app muestra cuántas cartas corresponde repartir en esa mano
- la app muestra qué jugador reparte en esa mano
- el usuario carga para cada jugador cuántas bazas dijo
- el usuario marca si el jugador acertó o no
- el usuario presiona **Cerrar mano**

### 6.4 Calcular resultado
Al cerrar la mano:
- la app calcula el puntaje individual de cada jugador según la configuración elegida al inicio
- actualiza los acumulados
- guarda la mano en el historial
- muestra el resultado de la mano
- permite avanzar a la siguiente mano
- permite volver atrás y reabrir la mano recién cerrada para corregir datos

### 6.5 Finalizar partida
Al terminar la mano 14:
- la app muestra el ranking final
- permite revisar historial
- permite comenzar una nueva partida
- permite repetir con los mismos jugadores

---

## 7. Pantallas funcionales

## 7.1 Pantalla principal

### Objetivo
Punto de entrada de la aplicación.

### Contenido
- nombre de la app
- selector de idioma
- selector global de tamaño de fuente
- botón **Nueva partida**
- si hay una partida guardada:
  - botón para continuar partida actual
  - botón para empezar una nueva desde cero

### Comportamiento
- el idioma por defecto al cargar es **inglés**
- el usuario puede cambiar a español manualmente

---

## 7.2 Pantalla Nueva partida

### Objetivo
Configurar una nueva partida.

### Campos
- cantidad implícita según cantidad de jugadores cargados
- nombre de cada jugador
- opción de regla para cero fallado
- selector del jugador que comienza repartiendo

### Regla configurable para cero fallado
Debe existir un control claro para elegir una de estas dos opciones:

- **Cero fallado resta 10 puntos**
- **Cero fallado no suma puntos**

### Jugador inicial que reparte
Debe existir un selector para definir:
- qué jugador comienza dando cartas en la primera mano

### Reglas
- no permitir menos de 3 jugadores
- no permitir más de 7 jugadores
- todos los jugadores deben tener nombre
- debe quedar seleccionada una regla para cero fallado
- debe quedar seleccionado el jugador que inicia repartiendo

### Acción principal
- botón **Comenzar partida**

---

## 7.3 Pantalla Mano actual

### Objetivo
Cargar la información mínima de la mano de forma rápida.

### Información fija visible
- número de mano
- total de manos
- cantidad de cartas repartidas en esa mano
- indicador de progreso
- regla vigente para cero fallado
- jugador que reparte en esa mano

Ejemplo:
- **Hand 3 / 14**
- **5 cards dealt**
- **Dealer: Luis**

### Información por jugador
Cada jugador se muestra en una tarjeta o fila con:

- nombre del jugador
- total actual
- campo numérico: **Dijo / Declared tricks**
- control de estado: **Acertó / No acertó** o **Hit / Missed**, ubicado a la derecha del input numérico, sin bajar debajo del campo, para formar una lista más compacta y prolija

### Interacción por jugador

#### Campo “Dijo”
- input numérico
- obligatorio
- valor mínimo: `0`
- valor máximo: cantidad de cartas de la mano actual

#### Estado “Acertó”
- control simple y visual
- resuelto con botón toggle
- apagado = no acertó
- encendido = acertó

### Acción principal de la pantalla
- botón grande inferior: **Cerrar mano / Close hand**

### Acción secundaria importante
- botón para comenzar una nueva partida desde cero sin necesidad de terminar la actual

### Comportamiento al cerrar mano
- validar datos
- calcular puntajes
- guardar resultados
- actualizar acumulados
- mostrar resultado de la mano

---

## 7.4 Pantalla Resultado de mano

### Objetivo
Mostrar el resumen de la mano recién cerrada.

### Información por jugador
- nombre
- valor declarado (`dijo`)
- estado de acierto
- puntos obtenidos en la mano
- total acumulado

### Información contextual
- número de mano
- cantidad de cartas de la mano
- jugador que repartió esa mano

### Recomendación visual
- verde para puntaje positivo
- rojo para puntaje negativo
- neutro para 0

### Acciones principales
- botón **Siguiente mano**
- botón **Ver historial**
- botón **Atrás** para reabrir la mano recién cerrada y corregirla
- botón para comenzar una nueva partida desde cero

Si era la última mano:
- botón **Ver resultado final**

---

## 7.5 Pantalla Resultado final

### Objetivo
Mostrar el cierre de la partida.

### Información
- ranking final
- nombre de cada jugador
- puntaje total

### Acciones posibles
- **Nueva partida**
- **Repetir con mismos jugadores**
- **Ver historial completo**

---

## 7.6 Pantalla Historial de partida

### Objetivo
Permitir revisar cómo quedó registrada la partida completa.

### Contenido esperado
Por cada mano:
- número de mano
- cartas repartidas
- jugador que repartió
- resultados por jugador:
  - dijo
  - acertó o no
  - puntos de esa mano
  - total acumulado luego de esa mano

### Nota
Para el MVP, el historial sigue siendo de lectura respecto de manos anteriores más viejas, pero la mano recién cerrada sí puede reabrirse inmediatamente desde la pantalla de resultado para corregir errores.

### Acción adicional
- opción para comenzar una nueva partida desde cero

---

## 8. Validaciones funcionales

### 8.1 Validaciones al crear partida
- cantidad de jugadores entre 3 y 7
- todos los nombres obligatorios
- los nombres deben ser únicos
- debe seleccionarse una regla para cero fallado
- debe seleccionarse un jugador inicial que reparte
- no permitir comenzar partida si faltan datos

### 8.2 Validaciones al cerrar mano
Para cada jugador:
- debe tener valor en “Dijo”
- “Dijo” debe ser un número entero
- “Dijo” debe estar entre `0` y `cartasMano`
- el estado de acierto debe estar definido

### 8.3 Comportamiento ante error
Si falta o está mal algún dato:
- no cerrar la mano
- mostrar mensaje claro
- mantener la carga actual para corregir sin perder información

---

## 9. Requisitos de experiencia de usuario

La app se usa en una partida real, desde un teléfono, con necesidad de operar rápido.

Por lo tanto la UX debe priorizar:

- pocos toques
- inputs grandes
- buena legibilidad
- navegación simple
- carga rápida por mano
- botones claros y bien visibles
- persistencia automática local
- salida fácil para reiniciar la app desde cero

### Recomendaciones concretas
- diseño **mobile first**
- tarjetas por jugador para mejorar tactilidad
- botón “Cerrar mano” grande y accesible
- totales visibles sin necesidad de navegar demasiado
- colores de feedback inmediatos
- selector de idioma simple en home
- footer permanente con copyright visible

---

## 10. Modelo de datos sugerido

## 10.1 Entidad Partida
Campos sugeridos:
- `id`
- `fechaCreacion`
- `players[]`
- `manoActualIndex`
- `sequence[]`
- `zeroMissRule`
- `firstDealerId`
- `hands[]`
- `status`
- `currentInputs`

## 10.2 Entidad Jugador
Campos sugeridos:
- `id`
- `name`
- `total`

## 10.3 Entidad Mano
Campos sugeridos:
- `number`
- `handCards`
- `dealerName`
- `results[]`

## 10.4 Entidad ResultadoJugadorMano
Campos sugeridos:
- `playerId`
- `playerName`
- `declared`
- `hit`
- `points`
- `totalAfterHand`

## 10.5 Estado de aplicación persistido
Campos sugeridos:
- `screen`
- `setup`
- `match`
- `lastHandResult`
- `language`

---

## 11. Arquitectura técnica implementada para MVP

### Stack
- **React**
- **Vite**
- **CSS mobile-first**

### Persistencia
- `localStorage`

### Backend
- no requerido

### Build
- `npm run build`

### Desarrollo local
- `npm run dev`
- para pruebas desde celular en red local: `npm run dev -- --host`

---

## 12. Funcionalidades incluidas en la versión actual

- nueva partida
- carga de entre 3 y 7 jugadores
- configuración de regla para cero fallado
- selección del jugador inicial que reparte
- rotación automática del dealer por mano
- secuencia fija de 14 manos
- carga por mano de “dijo” y “acertó/no acertó”
- cálculo automático de puntaje
- total acumulado
- resultado por mano
- historial por mano
- ranking final
- selector de idioma español / inglés
- selector global de tamaño de fuente (normal, grande, extra grande)
- inglés por defecto
- persistencia local automática
- opción para reiniciar la partida desde cero en cualquier momento
- footer persistente con texto:
  - **Copyright: Morales-Wise-Picone Team**
  - **Versión 2.2**

---

## 13. Publicación actual

La app está preparada para publicación como sitio estático.

### Plataforma sugerida y utilizada
- **Vercel**

### Configuración esperada de despliegue
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Fuente del despliegue
- repositorio GitHub: `luispicone/updownriver-score`
- branch principal: `main`

### Comportamiento de despliegue
- cada `push` al branch `main` puede disparar un redeploy automático en Vercel
- si no se ejecuta automáticamente, puede relanzarse manualmente desde la sección **Deployments** del proyecto en Vercel

---

## 14. Criterios de aceptación de la versión actual

La versión actual se considera correcta si permite:

1. crear una partida con entre 3 y 7 jugadores
2. elegir idioma desde la pantalla principal
3. iniciar en inglés por defecto
4. elegir la regla del cero fallado al iniciar la partida
5. elegir el jugador que comienza repartiendo
6. recorrer automáticamente las 14 manos con la secuencia definida
7. mostrar en cada mano quién reparte
8. cargar por cada jugador un número declarado y su estado de acierto
9. calcular correctamente los puntos según las reglas definidas y la configuración elegida
10. mantener acumulado total por jugador
11. mostrar resultado de cada mano
12. mostrar historial completo
13. mostrar ranking final al terminar
14. permitir iniciar una nueva partida desde cero en cualquier momento
15. funcionar correctamente en navegador móvil y desktop
16. poder desplegarse correctamente en Vercel
17. permitir cambiar el tamaño de fuente para accesibilidad
18. mostrar la versión actual en el footer
19. permitir reabrir inmediatamente la última mano cerrada para corregirla

---

## 15. Resumen ejecutivo

Se definió y desarrolló una app **web mobile** de baja a media complejidad, enfocada exclusivamente en resolver un problema real de uso: llevar el puntaje del juego Up Down River de forma simple y rápida.

Las decisiones funcionales más importantes de esta versión son:
- registrar solo cuánto dijo cada jugador y si acertó o no
- permitir configurar la regla del cero fallado
- indicar el jugador que comienza repartiendo y rotarlo automáticamente
- permitir reiniciar la app desde cero en cualquier momento
- soportar interfaz en español e inglés
- dejar inglés como idioma por defecto
- permitir despliegue simple y gratuito en Vercel

El resultado es un MVP ya funcional, publicable y listo para seguir iterando. La versión documentada actual es la **2.2**.
