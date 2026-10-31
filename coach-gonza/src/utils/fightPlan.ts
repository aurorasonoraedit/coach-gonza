import { Rival } from '../types';

export type PlanArea = 'guardia' | 'distancia' | 'ataque' | 'defensa' | 'ritmo' | 'clave';

export interface PlanTip {
  area: PlanArea;
  text: string;
}

export const AREA_LABEL: Record<PlanArea, { label: string; emoji: string }> = {
  clave: { label: 'Clave', emoji: '🎯' },
  guardia: { label: 'Guardia', emoji: '🦶' },
  distancia: { label: 'Distancia', emoji: '📏' },
  ataque: { label: 'Ataque', emoji: '👊' },
  defensa: { label: 'Defensa', emoji: '🛡️' },
  ritmo: { label: 'Ritmo', emoji: '⏱️' }
};

const has = (r: Rival, tag: string) => (r.styles || []).includes(tag);

/**
 * Plan de pelea sugerido a partir de la ficha del rival.
 * Son pautas generales de boxeo según lo cargado; el plan final lo arma el coach.
 */
export const buildFightPlan = (r: Rival): PlanTip[] => {
  const tips: PlanTip[] = [];
  const add = (area: PlanArea, text: string) => tips.push({ area, text });

  const fights = (r.wins ?? 0) + (r.losses ?? 0) + (r.draws ?? 0);
  const koRate = r.wins ? (r.kos ?? 0) / r.wins : 0;

  // Puntos débiles anotados: lo primero
  if (r.weaknesses) add('clave', `Atacá lo que viste: ${r.weaknesses}`);

  // Guardia
  if (r.stance === 'zurdo') {
    add('guardia', 'Es zurdo (pensado para tu boxeador diestro): ganá la posición del pie adelantado por afuera del suyo.');
    add('guardia', 'Movete hacia tu izquierda, lejos de su mano zurda.');
    add('ataque', 'Tu cross (derecha recta) es el golpe principal contra un zurdo: tirala por el medio.');
  } else if (r.stance === 'cambia') {
    add('guardia', 'Cambia de guardia: castigalo justo en el momento del cambio, cuando queda cuadrado.');
    add('guardia', 'Fijate en qué guardia se siente más cómodo y obligalo a pelear en la otra.');
  } else if (r.stance === 'ortodoxo') {
    add('guardia', 'Es diestro: salí hacia tu izquierda, lejos de su derecha. Si tu boxeador es zurdo, buscá el pie adelantado por afuera y tirá la zurda recta.');
  }

  // Altura / distancia
  const tall = (r.height ?? 0) >= 180;
  if (tall || has(r, 'Boxeador de distancia') || has(r, 'Buen jab')) {
    add('distancia', 'No le pelees de lejos: achicá la distancia entrando detrás de tu jab, con la cabeza en movimiento.');
    add('distancia', 'Cortale el ring en lugar de perseguirlo: pasos laterales para cerrarle la salida.');
    add('ataque', 'Trabajo al cuerpo para bajarle las piernas y el jab.');
  }
  if (has(r, 'Buenas piernas')) {
    add('distancia', 'Se mueve mucho: cortá el ring y castigá abajo para quitarle movilidad.');
  }

  // Estilos
  if (has(r, 'Presionador')) {
    add('distancia', 'Viene para adelante: jab y salida lateral, nunca hacia atrás en línea recta.');
    add('defensa', 'No te quedes en las cuerdas ni en las esquinas: pivot y salir.');
    add('ataque', 'Contragolpe con uppercut o gancho corto cuando entra con la cabeza baja.');
  }
  if (has(r, 'Contragolpeador')) {
    add('ataque', 'No le muestres patrones: fintá y variá el primer golpe.');
    add('defensa', 'Terminá cada combinación con defensa o saliendo de línea; espera tu error.');
    add('ataque', 'Jab al cuerpo para obligarlo a tomar la iniciativa.');
  }
  if (has(r, 'Pegador') || (koRate >= 0.5 && (r.wins ?? 0) >= 3)) {
    add('defensa', `Tiene pegada${r.kos ? ` (${r.kos} KO)` : ''}: guardia alta, mentón abajo y no intercambiar parado.`);
    add('defensa', 'Después de pegar, mové la cabeza o salí de línea.');
    add('ritmo', 'No hace falta noquearlo: ganale por puntos con precisión.');
  }
  if (has(r, 'Mucho volumen')) {
    add('ataque', 'Tira mucho: contestale al final de sus combinaciones con golpes más fuertes y precisos.');
    add('ataque', 'Castigá al cuerpo para cortarle el ritmo.');
  }
  if (has(r, 'Trabaja abajo')) {
    add('defensa', 'Busca el cuerpo: codos cerrados y cuidado con el hígado.');
  }
  if (has(r, 'Se cubre bien')) {
    add('ataque', 'Abrile la guardia: cuerpo-cabeza, uppercut por el medio y ganchos alrededor de la guardia.');
  }
  if (has(r, 'Cansa rápido')) {
    add('ritmo', 'Se cansa: ritmo alto desde el primer round y apretá en el segundo y el tercero.');
  }

  // Experiencia
  if (fights >= 15) {
    add('ritmo', `Tiene mucho oficio (${fights} peleas): no le regales el primer round y cuidado con el clinch y las mañas.`);
  } else if (fights > 0 && fights <= 4) {
    add('ritmo', `Tiene poca experiencia (${fights} peleas): presionalo temprano y sacalo de su plan.`);
  }
  if ((r.losses ?? 0) >= 3) {
    add('clave', 'Perdió varias: averiguá contra qué estilo perdió y copiá esa receta.');
  }
  if ((r.level ?? 0) >= 4) {
    add('ritmo', 'Rival de nivel: pensá la pelea round por round y tené paciencia.');
  }

  if (r.strengths) add('defensa', `Neutralizá lo que hace bien: ${r.strengths}`);

  return tips;
};

export const planToText = (r: Rival, tips: PlanTip[]) =>
  `Plan vs ${r.name}:\n` + tips.map(t => `• ${AREA_LABEL[t.area].label}: ${t.text}`).join('\n');
