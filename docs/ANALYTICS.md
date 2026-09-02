# Sistema de Analíticas (Analytics)

## Taxonomía de Eventos (Event Taxonomy)
- Convención de nombres: `snake_case` para nombres de eventos y parámetros.

## Core Events
- `game_started`: La aplicación fue iniciada.
- `dj_selected`: El jugador seleccionó un DJ (Parámetros: `dj_id`).
- `run_started`: Inicia una carrera.
- `run_completed`: Carrera terminada exitosamente (Parámetros: `score`, `distance`).
- `game_over`: Fin de la carrera por colisión.
- `event_clicked`: Interacción con un evento in-game.
- `promotion_clicked`: Interacción con publicidad o promo.
- `reward_claimed`: Recompensa obtenida (Parámetros: `reward_type`, `amount`).
- `promo_code_used`: Código de referido canjeado (Parámetros: `code_id`).
- `external_link_clicked`: Redirección fuera del juego (ej. venta de tickets).
- `skin_selected`: Cambio de aspecto o cosmético.

## Session Tracking
- **Duration**: Tiempo total de la sesión.
- **Frequency**: Número de sesiones por intervalo de tiempo.
- **Retention**: Análisis de retención D1, D7, D30.

## DJ Analytics
- **Popularity**: Basado en frecuencia de elección.
- **Play time**: Tiempo total jugado con un DJ específico.
- **Selection rate**: Porcentaje de selección frente al total.

## Business Events
- `conversion_by_campaign`: Conversiones exitosas rastreadas desde una campaña.
- `referral_attribution`: Evento disparado para la atribución de un jugador a un DJ.

## Enfoque de Implementación (Implementation Approach)
- Arquitectura basada en interfaces: `IAnalyticsProvider`
- Backends enchufables (Pluggable backends) para facilitar el cambio o la agregación de servicios sin afectar la lógica del juego.

## Data Model Examples
```json
{
  "event_name": "dj_selected",
  "timestamp": 1718293847,
  "parameters": {
    "dj_id": "dj_fresar",
    "user_id": "usr_99238"
  }
}
```

## Consideraciones de Privacidad (Privacy Considerations)
- Diseño conforme a regulaciones como GDPR y COPPA.
- Implementación de flujos de opt-in/opt-out para recolección de datos.

## Estado MVP
- El MVP contará únicamente con **local event logging** (en la consola) y las interfaces de arquitectura preparadas.

## Futuro (Future)
- Integración completa con Firebase Analytics y GameAnalytics.
- Desarrollo de custom dashboards para stakeholders (DJs, marcas, managers).
