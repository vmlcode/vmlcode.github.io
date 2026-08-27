Sesenta compañeros, ocho semanas, una pizarra y un salón donde más o menos la mitad ya había decidido que "no era gente de programación" antes de que yo abriera la boca. Esa última parte resultó ser el verdadero programa del curso.

## Los bucles nunca fueron el problema

Perdí las dos primeras semanas enseñando sintaxis. `for`, `while`, `range`, indentación, lo de siempre. Para la segunda semana la gente podía escribir un bucle y todavía no sabía decirme *por qué* querría uno. Habían aprendido una forma, no una idea.

Lo que finalmente funcionó fue negarme a escribir código durante una sesión entera. En cambio: describe, en voz alta, cómo le explicarías a tu abuela los pasos para hacer sesenta arepas cuando ya sabes hacer una. Alguien dijo "haces lo mismo sesenta veces pero cambias lo que tienes en la mano cada vez". Eso es un bucle. Lo escribimos en la pizarra con palabras, y solo después en Python.

> No había que enseñarles bucles. Había que darles permiso de notar que ya pensaban en bucles.

## Tres cosas que ayudaron de forma medible

**Errores a propósito, temprano.** En la primera semana hice que todos escribieran código roto deliberadamente y leyeran el traceback en voz alta. Los principiantes tratan un error como un veredicto sobre sí mismos; para la tercera semana el salón trataba un traceback como una oración con un número de línea. La asistencia dejó de caer después de esa semana, y no creo que sea coincidencia.

**Sin diapositivas después de la semana tres.** Tecleaba todo en vivo, incluidos los errores. Verme sacar un `IndentationError` y arreglarlo en ocho segundos enseñó más que cualquier ejemplo correcto. La competencia que la gente necesitaba ver no era "escribe código perfecto" — era "se traba y se destraba rutinariamente".

**Parejas, rebarajadas cada semana.** Las parejas fijas se calcifican en un conductor y un pasajero. Rebarajar significaba que a todos les tocaba ser el confundido en algún momento, lo que mató casi toda la ansiedad de estatus del salón para la semana cinco.

## La parte que hice mal

Califiqué las dos primeras asignaciones por corrección. Fue un error y me costó casi toda la semana cuatro.

La gente dejó de experimentar. Escribían lo mínimo que pasara la prueba y lo entregaban. Cuando cambié a calificar por *intentos documentados* — muéstrame qué probaste y qué decía el error — las entregas se volvieron más largas, peores y muchísimo más interesantes. Una persona entregó cuatro enfoques rotos y un párrafo sobre por qué el tercero casi funcionaba. Fue la mejor asignación que recibí en todo el semestre.

```
semana 1   asistencia 60   "yo no soy de código"        × 11 veces escuchado
semana 4   asistencia 41   calificando por corrección   ← culpa mía
semana 5   asistencia 52   calificando por intentos
semana 8   asistencia 57   proyectos finales, 6 extensiones espontáneas
```

Guardo esa tabla porque la caída es mía. Es fácil leer una baja en la asistencia como un hecho sobre los estudiantes.

## Lo que aprendí de verdad

Explicar algo es la forma más rápida de encontrar los huecos en tu propio mapa. Creía que entendía el alcance de las variables hasta que alguien preguntó por qué una variable dentro de una función "desaparece", y me escuché dar una respuesta que era cierta, inútil y claramente memorizada en vez de entendida. Esa noche me fui a la casa a leer sobre frames como se debe.

Para la semana ocho navegaban sin mí, que es el único resultado que cuenta. Seis de ellos extendieron su proyecto final más allá de los requisitos sin que nadie se los pidiera. Uno está ahora en el laboratorio de visión conmigo.
