# Especificación funcional - Up Down River Score

## 1. Objetivo

Desarrollar una aplicación **web mobile** para llevar el puntaje de partidas del juego de cartas **Up Down River** (variante de bazas / trick-taking), enfocada exclusivamente en facilitar el registro de manos y el cálculo automático de puntos.

La aplicación **no simula el juego**, no reparte cartas y no administra bazas jugadas carta por carta. Su propósito es funcionar como **scorekeeper** durante una partida real presencial, usada por una sola persona desde un dispositivo móvil.

---

## 2. Alcance del MVP

La primera versión debe permitir:

- crear una nueva partida
- ingresar entre 3 y 7 jugadores
- recorrer automáticamente la secuencia completa de manos
- cargar por cada jugador el número de bazas declaradas
- marcar si el jugador acertó o no en esa mano
- calcular automáticamente el puntaje de la mano
- acumular el puntaje total por jugador
- mostrar resultados por mano y ranking final
- consultar el historial de la partida

La primera versión **no incluye**:

- multijugador online
- login o cuentas de usuario
- sincronización entre dispositivos
- backend
- publicación en stores
- simulación del juego
- administración de cartas o bazas reales carta por carta

---

## 3. Plataforma objetivo

- **tipo:** web mobile
- **uso inicial:** navegador móvil
- **operación:** una sola persona carga y administra la partida
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

### 4.3 Regla de puntuación

Para cada jugador en una mano:

#### Si el jugador acierta
Sin importar si dijo 0 o un número mayor a 0:

- suma **10 + cantidad de cartas repartidas en esa mano**

Ejemplos:
- en mano de 7 cartas: suma **17**
- en mano de 4 cartas: suma **14**
- en mano de 1 carta: suma **11**

#### Si el jugador no acierta y había dicho un número mayor a 0

- suma **0**

#### Si el jugador no acierta y había dicho 0

- **resta 10**

### 4.4 Resumen de fórmula

Dado:
- `cartasMano`
- `dijo`
- `acerto`

Reglas:

- si `acerto = true` → puntos = `10 + cartasMano`
- si `acerto = false` y `dijo > 0` → puntos = `0`
- si `acerto = false` y `dijo = 0` → puntos = `-10`

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

### 6.1 Crear partida
El usuario:
- abre la app
- crea una nueva partida
- ingresa nombres de jugadores
- inicia la partida

### 6.2 Cargar mano
Para cada mano:
- la app muestra cuántas cartas corresponde repartir en esa mano
- el usuario carga para cada jugador cuántas bazas dijo
- el usuario marca si el jugador acertó o no
- el usuario presiona **Cerrar mano**

### 6.3 Calcular resultado
Al cerrar la mano:
- la app calcula el puntaje individual de cada jugador
- actualiza los acumulados
- muestra el resultado de la mano
- permite avanzar a la siguiente mano

### 6.4 Finalizar partida
Al terminar la mano 14:
- la app muestra el ranking final
- permite revisar historial
- permite comenzar una nueva partida
- permite repetir con los mismos jugadores

---

## 7. Pantallas funcionales

## 7.1 Pantalla de inicio

### Objetivo
Punto de entrada de la aplicación.

### Contenido
- nombre de la app
- botón **Nueva partida**
- opcional en fases siguientes: listado de partidas recientes

---

## 7.2 Pantalla Nueva partida

### Objetivo
Configurar una nueva partida.

### Campos
- cantidad de jugadores
- nombre de cada jugador

### Reglas
- no permitir menos de 3 jugadores
- no permitir más de 7 jugadores
- todos los jugadores deben tener nombre

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

Ejemplo:
- **Mano 3 de 14**
- **Cartas repartidas: 5**

### Información por jugador
Cada jugador debe mostrarse en una tarjeta o fila con:

- nombre del jugador
- campo numérico: **Dijo**
- control de estado: **Acertó / No acertó**

### Interacción por jugador

#### Campo “Dijo”
- input numérico
- obligatorio
- valor mínimo: `0`
- valor máximo: cantidad de cartas de la mano actual

#### Estado “Acertó”
- control simple y visual
- puede resolverse con un switch, toggle o botón de encendido/apagado
- apagado = no acertó
- encendido = acertó

### Acción principal de la pantalla
- botón grande inferior: **Cerrar mano**

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

### Recomendación visual
- verde para puntaje positivo
- rojo para puntaje negativo
- neutro para 0

### Acción principal
- botón **Siguiente mano**

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
- resultados por jugador:
  - dijo
  - acertó o no
  - puntos de esa mano
  - total acumulado luego de esa mano

### Nota
Para el MVP, el historial puede ser solo de lectura.
Una futura versión puede permitir editar manos anteriores.

---

## 8. Validaciones funcionales

### 8.1 Validaciones al crear partida
- cantidad de jugadores entre 3 y 7
- todos los nombres obligatorios
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

La app se usará en una partida real, desde un teléfono, con necesidad de operar rápido.

Por lo tanto la UX debe priorizar:

- pocos toques
- inputs grandes
- buena legibilidad
- navegación simple
- carga rápida por mano
- botones claros y bien visibles

### Recomendaciones concretas
- diseño **mobile first**
- tarjetas por jugador para mejorar tactilidad
- botón “Cerrar mano” grande y fijo abajo si es posible
- totales visibles sin necesidad de navegar demasiado
- colores de feedback inmediatos

---

## 10. Modelo de datos sugerido

## 10.1 Entidad Partida
Campos sugeridos:
- `id`
- `fechaCreacion`
- `jugadores[]`
- `manoActualIndex`
- `secuenciaManos[]`
- `manos[]`
- `finalizada`

## 10.2 Entidad Jugador
Campos sugeridos:
- `id`
- `nombre`
- `total`

## 10.3 Entidad Mano
Campos sugeridos:
- `numero`
- `cartasRepartidas`
- `resultados[]`

## 10.4 Entidad ResultadoJugadorMano
Campos sugeridos:
- `jugadorId`
- `dijo`
- `acerto`
- `puntos`
- `totalAcumulado`

---

## 11. Arquitectura técnica recomendada para MVP

### Stack sugerido
- **React**
- **Vite**
- **Bootstrap 5.3**

### Persistencia sugerida
Para MVP:
- `localStorage`

Evolución posible:
- `IndexedDB`

### Backend
- no requerido en la primera etapa

---

## 12. Funcionalidades incluidas en MVP

- nueva partida
- carga de entre 3 y 7 jugadores
- secuencia fija de 14 manos
- carga por mano de “dijo” y “acertó/no acertó”
- cálculo automático de puntaje
- total acumulado
- resultado por mano
- resultado final
- historial de la partida

---

## 13. Funcionalidades futuras posibles

### Fase 2
- guardar partidas anteriores
- reanudar partida incompleta
- editar una mano cerrada
- repetir partida con mismos jugadores

### Fase 3
- PWA instalable
- exportación de resultados
- estadísticas históricas
- soporte de variantes configurables de puntuación
- temas visuales

---

## 14. Criterios de aceptación del MVP

El MVP se considera correcto si permite:

1. crear una partida con entre 3 y 7 jugadores
2. recorrer automáticamente las 14 manos con la secuencia definida
3. cargar por cada jugador un número declarado y su estado de acierto
4. calcular correctamente los puntos según las reglas definidas
5. mantener acumulado total por jugador
6. mostrar resultado de cada mano
7. mostrar ranking final al terminar
8. funcionar correctamente en navegador móvil

---

## 15. Resumen ejecutivo

Se definió una app **web mobile** de baja a media complejidad, enfocada exclusivamente en resolver un problema real de uso: llevar el puntaje del juego Up Down River de forma simple y rápida.

La decisión funcional más importante es que por mano solo se registrará:
- cuánto dijo cada jugador
- si acertó o no

Eso reduce fricción, simplifica la interfaz y elimina cálculos manuales molestos durante la partida.

El proyecto es adecuado para un **MVP rápido**, sin backend y con foco total en experiencia móvil.
