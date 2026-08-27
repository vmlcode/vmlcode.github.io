El modelo estaba terminado. Noventa y uno por ciento en el conjunto de validación, una matriz de confusión limpia, una demo que hizo asentir a mi tutor. Después lo pasé, por diversión, sobre tres años de mis propios tuits — y marcó dos tercios como sarcásticos con alta confianza. Mi primera reacción fue que el modelo estaba roto. La segunda, que llegó cerca de las 2 de la madrugada, fue peor.

## El bug que no era

Depurar un clasificador que no está de acuerdo contigo es una forma muy específica de humildad. Revisé primero lo obvio: desajuste del tokenizador entre entrenamiento e inferencia, un mapeo de etiquetas invertido en la exportación, la cabeza de sarcasmo leyendo logits de la capa equivocada. Todo limpio. El modelo hacía exactamente lo que le habían enseñado a hacer.

Así que hice lo que se hace cuando el código está bien: leí los datos. Doscientos ejemplos míos, uno al lado del otro con la confianza por token del modelo, en un notebook a una hora que prefiero no reportar.

![captura: mapa de calor de confianza por token]()

Los picos no estaban donde yo esperaba. No estaban en las construcciones obviamente irónicas que había pasado semanas curando. Estaban en los diminutivos — *-ito*, *-ita*, los sufijos suavizantes que en mi región significan cariño más o menos el noventa por ciento de las veces.

## Lo que decían las etiquetas en realidad

El subconjunto de sarcasmo lo habían etiquetado seis personas, todas amigas mías, casi todas de la misma ciudad. Cuando marcaban algo como sarcástico estaban, sin querer, marcando un registro: la exageración afectuosa que todos usamos a cada rato — los diminutivos, el trato falsamente formal, los halagos dos tallas más grandes de lo necesario.

Ese registro es la mayor parte de cómo escribo en internet. El modelo no había aprendido a detectar sarcasmo. Había aprendido a detectarnos a nosotros.

> Un dataset es un grupo de personas poniéndose de acuerdo, por escrito, sobre lo que significa una palabra. El mío se puso de acuerdo un poquito de más.

Lo incómodo es que nada en mis métricas podía haber atrapado esto. El conjunto de validación salía del mismo pozo que el de entrenamiento, etiquetado por las mismas seis personas. Por supuesto que sacó 91%. Lo estaban calificando quienes escribieron la hoja de respuestas.

## El arreglo, en tres partes

Primero, volví a reclutar: doce anotadores de cuatro regiones, ninguno conocido de otro, con la instrucción explícita de que el cariño no es sarcasmo. Segundo, medí el acuerdo entre anotadores **por fenómeno** en vez de globalmente, lo que expuso de inmediato a los diminutivos como la línea de falla. Tercero — y esta es la parte que repetiría en cualquier proyecto — mantuve un conjunto reservado escrito por gente cuyo habla los anotadores originales habrían clasificado mal.

```
>>> acuerdo(subconjunto="diminutivos")
kappa 0.31 — por debajo del piso; marcado para reetiquetar
>>> acuerdo(subconjunto="ironia_explicita")
kappa 0.78 — se queda
```

Esa sola tabla hizo más por el modelo que cualquier cambio de arquitectura que probé. Un kappa de 0.31 significa que los anotadores apenas estaban de acuerdo entre ellos; promediado en un puntaje global de 0.68 se veía perfectamente sano.

El recall de la cabeza de sarcasmo bajó de un halagador 91% a un creíble 82%. La demo se volvió más callada y bastante más útil. Ya no cree que estoy siendo cruel con mi propia mamá.

## Lo que costó, lo que compró

Seis semanas y nueve puntos de recall, a cambio de un modelo honesto sobre un idioma por el que siempre iba a ser juzgado. Los volvería a gastar.

Si te llevas una sola cosa operativa de esto: calcula el acuerdo por fenómeno, no por dataset. El kappa global es un promedio, y los promedios son exactamente donde este tipo de problema se va a esconder.

La conclusión incómoda que prometí en el subtítulo no es sobre mis tuits — es que la versión más confiada de un modelo suele ser la que aprendió el cuarto más pequeño.
