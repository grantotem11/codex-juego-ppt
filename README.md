# Piedra, Papel o Tijera

Mini juego desarrollado con HTML, CSS y JavaScript vanilla. Compite contra la CPU
hasta alcanzar cinco puntos y mantén tu mejor racha de victorias.

## Características

- Animaciones suaves en los botones, realce del panel de resultado y un temblor
  al perder que respetan la preferencia del sistema para reducir movimiento.
- Control de sonido con efectos para victorias/derrotas y botón para silenciar,
  cuya preferencia persiste en `localStorage`.
- Marcador accesible con mejor racha almacenada y reinicio al llegar a cinco
  puntos.

## Estructura

- `index.html`: estructura semántica y accesible del juego.
- `styles.css`: estilos responsive, con soporte para foco visible y modo oscuro automático.
- `app.js`: lógica del juego, marcador, persistencia de rachas, sonidos y reinicio.

## Cómo usar

1. Clona el repositorio y abre el archivo `index.html` en tu navegador preferido.
2. Elige Piedra, Papel o Tijera para jugar cada ronda.
3. Gana cinco puntos antes que la CPU para incrementar tu racha.

## Pruebas manuales

- Abrir `index.html` en el navegador.
- Jugar hasta que alguno llegue a 5 puntos y verificar que aparezca el botón **Reiniciar**.
- Pulsar **Reiniciar** y comprobar que el marcador vuelve a 0.
- Refrescar la página tras ganar una partida para confirmar que la sección "Mejor racha" conserva el valor más alto.
- Ganar y perder una ronda para escuchar los sonidos asociados.
- Activar el botón **Sonido** para silenciar y volver a activar, refrescando la página para validar que la preferencia se conserva.
- Elegir una jugada y observar la animación; perder una ronda para visualizar el
  efecto de sacudida (o desactivar las animaciones si el sistema tiene "Reducir
  movimiento").

## Accesibilidad y soporte

- Controles con roles y etiquetas accesibles.
- Uso de `aria-live` para narrar resultados y marcador.
- Botones manejables con teclado (Enter/Espacio) y foco visible.
- Diseño mobile-first adaptable a pantallas mayores y compatible con esquemas de color claros/oscursos.
