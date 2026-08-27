Casi todos los tutoriales de cuantización abren con una gráfica de throughput. El mío abre con una barra de descarga, porque ahí es donde empieza el problema de verdad. Un modelo de 96 MB no es lento de ejecutar en un Android de gama media — es lento de *llegar*. Con la conexión que tiene la mayoría de mis usuarios, 96 MB están entre once minutos y nunca.

## La restricción de la que nadie escribe

La literatura optimiza la latencia. La latencia importa, pero es el segundo problema. El primero es que el modelo tiene que llegar al dispositivo, sobre una conexión que se cae, con un plan de datos medido en cientos de megabytes al mes, a un teléfono con 2 GB de RAM y 16 GB de almacenamiento que ya está lleno al 90%.

Fijé un presupuesto duro antes de escribir una línea de código: **menos de 12 MB, instalado**. No "lo más pequeño que podamos" — un número, decidido de antemano, contra el cual un build pudiera fallar. Todo lo demás salió de esa decisión.

> Un presupuesto de tamaño no es una limitación del modelo. Es una especificación de quién puede usarlo.

## Qué compró realmente cada técnica

Las probé más o menos en orden de esfuerzo, midiendo después de cada paso en lugar de apilarlas a ciegas.

**Float16 post-entrenamiento.** Gratis, una línea, reduce el archivo a la mitad. La pérdida de precisión fue menor a 0.2 puntos. No hay razón para no hacerlo; es lo más parecido a un almuerzo gratis en todo el stack.

**Int8 post-entrenamiento con un dataset representativo.** Aquí vive la compresión de verdad — otro 2× encima de float16, o sea 4× en total. La trampa está en el conjunto de calibración. Mi primer intento usó 100 imágenes limpias de estudio y perdió seis puntos de precisión en campo. Reconstruir la calibración con 500 fotos tomadas en los teléfonos objetivo reales, con la luz real del campo, recuperó todo menos 1.4 puntos.

```
base        fp32     96.4 MB    94.8% top-1
float16              48.2 MB    94.6% top-1
int8  (cal. estudio) 12.3 MB    88.9% top-1   ← calibración desalineada
int8  (cal. campo)   12.3 MB    93.4% top-1
+ pruning 30%        10.9 MB    93.1% top-1
```

**Pruning estructurado.** Vale la pena solo después de cuantizar, y vale menos de lo que sugieren los tutoriales. Podar el 30% de los canales me compró 1.4 MB a cambio de 0.3 puntos. Lo mantuve porque entraba en el presupuesto; si no, lo habría descartado.

**Entrenamiento consciente de la cuantización (QAT).** La respuesta de manual, y la que me salté. QAT exige reentrenar completo, y en el hardware al que tenía acceso eso eran cuatro días de GPU que no tenía. La cuantización post-entrenamiento con buena calibración me dejó a un punto de donde habría aterrizado QAT. Hay que saber cuándo la técnica cara no vale la pena.

![captura: tamaño vs. precisión en cada paso de cuantización]()

## El conjunto de calibración lo es todo

Si hay una sola cosa que llevarse de aquí: tus datos de calibración tienen que venir de la distribución de despliegue, no de la de entrenamiento. Son cosas distintas y nadie lo dice en voz alta.

Mi conjunto de entrenamiento era de fotos limpias, bien iluminadas y centradas, porque eso es lo que hace que un modelo entrene bien. Mi realidad de despliegue era un agricultor sosteniendo un teléfono con la pantalla rota a un brazo de distancia bajo un cielo nublado. Calibrar los rangos int8 con la primera distribución y desplegar en la segunda es como se pierden seis puntos y se pasa una semana culpando al cuantizador.

Quinientas fotos de campo tomaron una tarde y valieron más que todos los experimentos de arquitectura que corrí ese mes.

## Dónde aterrizó

10.9 MB, 93.1% top-1, 380 ms en el dispositivo objetivo, totalmente offline. Se descarga en menos de dos minutos con mala conexión y sobrevive a que la interrumpan, porque además partí la descarga en trozos reanudables — lo que resultó importar tanto como todo lo anterior.

El modelo es 8.8× más pequeño que la línea base y 1.7 puntos peor. Sobre el papel es un mal trato. En el campo es la diferencia entre una herramienta que la gente usa y una que la gente no puede instalar.
