No existe un corpus de español venezolano. Existen corpus del español — excelentes, en su mayoría peninsulares, algunos mexicanos y argentinos — y todos leen el habla de mi país como ligeramente equivocada. Así que construí uno. Doce mil comentarios, cuatro meses, y más discusiones sobre la palabra *vale* de las que esperaba tener en toda mi vida.

## Por qué fallan aquí los corpus existentes

No es el vocabulario. El vocabulario es la parte fácil y la que todo el mundo arregla primero.

Es que el español regional difiere en la *pragmática* — lo que una construcción hace, no lo que significa. Un modelo peninsular lee `¿me haces el favor?` como una petición cortés. Aquí, según el tono y el contexto, puede ser una petición genuina, una exasperación leve o una amenaza abierta. Ninguna cantidad de aumento de vocabulario enseña eso, porque las palabras son idénticas.

![captura: la misma frase, tres lecturas regionales]()

## La recolección y el problema del consentimiento

No scrapeé nada. Fue una decisión que tomé temprano y que me costó tal vez tres meses.

Los comentarios públicos están técnicamente disponibles, pero "técnicamente disponible" no es consentimiento, y yo estaba construyendo un dataset sobre cómo hablan comunidades específicas. En vez de eso recluté: grupos locales de Facebook, mi universidad, dos grupos de WhatsApp del vecindario, una cooperativa cafetalera. Todos sabían a qué estaban contribuyendo y todos podían retirar su texto después. Cuatro personas lo hicieron.

> Doce mil ejemplos con consentimiento tomaron cuatro meses. Doscientos mil scrapeados habrían tomado un fin de semana y no podría publicar ni el dataset ni mi conciencia.

El reclutamiento también arregló un problema de muestreo que no habría detectado de otra forma. Mis primeros mil ejemplos venían casi por completo de estudiantes universitarios de 19 a 24 años. Eso es un dialecto, no el dialecto.

## La guía de anotación es el verdadero artefacto

La reescribí once veces. El modelo va río abajo de ella; cada ambigüedad en la guía se convierte en ruido en las etiquetas y luego en un error confiado en inferencia.

La mejora más grande fue reemplazar categorías abstractas por **árboles de decisión sobre preguntas concretas**. No "¿esto es sarcástico?" — que produjo un kappa de 0.31 y muchísimos gritos — sino una secuencia: ¿es plausible la lectura literal? ¿el hablante marca distancia frente a ella? ¿se ofendería el destinatario si la lectura literal fuera cierta?

```
guía v3     "¿esto es sarcástico?"              kappa 0.31
guía v7     árbol de decisión de 3 preguntas    kappa 0.59
guía v11    + ejemplos resueltos por rama       kappa 0.74
            + "cariño ≠ sarcasmo" explícito
```

Once versiones de un documento movieron el acuerdo más que cualquier decisión de modelado que tomé ese año. Eso nadie lo pone en un paper.

## Tres desacuerdos de etiquetado por almuerzo familiar

Recluté en cuatro regiones precisamente para que los anotadores *no* se conocieran entre sí. Los anotadores homogéneos se ponen de acuerdo de maravilla y le enseñan al modelo su propio cuarto pequeño — eso ya lo había aprendido por la vía cara.

Los desacuerdos eran la señal útil. Donde los anotadores del Táchira y del Zulia se dividían de forma consistente sobre la misma construcción, esa construcción iba a un subconjunto aparte de variación regional en vez de resolverse por mayoría. La mayoría habría borrado en silencio un rasgo dialectal real y lo habría reemplazado por el promedio confiado de dos cosas que no son la misma.

El corpus se publica con puntajes de acuerdo por ítem. Si lo usas, puedes ver exactamente dónde no estábamos seguros, que parece lo mínimo honesto que se puede hacer.

## Lo que existe ahora

12.438 comentarios, cuatro regiones, tres capas de anotación, acuerdo por ítem y una guía que llevó once borradores. Es pequeño para los estándares del área y es lo único de su tipo que conozco.

Lo siguiente: alojarlo en algún lugar permanente, con una licencia que permita a otros estudiantes venezolanos usarlo sin pedirme permiso. Esa parte es administrativa y llevo dos meses evitándola.
