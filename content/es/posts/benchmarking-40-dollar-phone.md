Costó cuarenta dólares, tiene 2 GB de RAM, la pantalla está partida en el tercio superior y es el equipo más valioso que tengo. Todo modelo que publico tiene que sobrevivirlo primero.

## La mentira de la máquina de desarrollo

Mi laptop corre el modelo en 40 ms. La estación de trabajo del laboratorio lo corre en 12. Los dos números son ciertos y ninguno ha predicho jamás nada útil sobre cómo se comporta la app en un cafetal.

La brecha no es solo velocidad bruta. Es el throttling térmico después de la cuarta inferencia seguida. Es el sistema operativo matando tu proceso porque otra cosa quería memoria. Es un pipeline de cámara que entrega frames en un formato que no planeaste, en un dispositivo donde la conversión cuesta más que la inferencia. Nada de eso aparece en un benchmark corrido sobre hardware con ventilador.

> Si tu dispositivo de prueba más lento es una MacBook, no has probado. Has ensayado.

## Lo que atrapó y el profiling no

**Throttling térmico.** Primera inferencia: 380 ms. Décima inferencia seguida: 1.240 ms. El teléfono se calienta, el SoC baja de frecuencia, y la app que se sentía responsiva en una demo de treinta segundos se vuelve inusable en la sesión de cuatro minutos que tiene un usuario real. Ahora mido la *décima* corrida, nunca la primera.

**Presión de memoria, no uso de memoria.** El modelo cabía en RAM con holgura. Aun así lo mataron, porque el usuario tenía WhatsApp abierto y el sistema tomó una decisión razonable. El pico de uso estaba bien; el pico de uso *mientras un teléfono real hace cosas reales de teléfono* no lo estaba.

**Arranque en frío.** 2,8 segundos hasta la primera inferencia después de que la app fuera descargada de memoria, casi todo en cargar el intérprete y el archivo del modelo desde un almacenamiento flash lento. En mi laptop eso eran 200 ms e invisible. Mapear el archivo en memoria lo bajó a 900 ms.

```
                          laptop     teléfono $40
inferencia (1ª corrida)    40 ms         380 ms
inferencia (10ª corrida)   41 ms       1.240 ms   ← throttling
arranque en frío          200 ms       2.800 ms
tras el arreglo con mmap  200 ms         900 ms
```

![foto: el teléfono de pruebas, con pantalla partida y todo]()

## Cómo lo uso en la práctica

Vive en mi escritorio, enchufado, con la app instalada desde el mismo artefacto que le llegaría a un usuario — nunca un build de depuración, nunca desde el IDE. Tres reglas que mantengo:

**Medir en caliente, no en frío.** Diez corridas seguidas, reportar la décima. La primera corrida es publicidad.

**Nunca cerrar las otras apps.** La condición realista es un teléfono con catorce cosas abiertas y 200 MB libres. Probar sobre un dispositivo recién reiniciado mide una situación en la que ningún usuario está.

**Probar con batería, por debajo del 20%.** Android limita agresivamente en modo ahorro, y un agricultor al final de la jornada no está al 100%. Esta regla atrapó una regresión de 2× que todas las demás pruebas dejaron pasar.

## Por qué cuarenta dólares es el número correcto

Pude haber comprado un teléfono de gama media y sentirme más cómodo. El punto no es la comodidad. El dispositivo fija un piso: si corre aquí, corre en todas partes donde están mis usuarios, y nunca tengo que preguntármelo.

También ha mejorado los modelos en silencio. Cada optimización que hice para satisfacer a este teléfono — el mapeo en memoria, la cuantización int8, la descarga reanudable — mejoró también la experiencia en hardware bueno. Las restricciones se propagan hacia arriba. Rara vez se propagan hacia abajo.

La grieta de la pantalla es de cuando se me cayó en un estacionamiento. No lo he reemplazado, en parte porque todavía funciona y sobre todo porque un teléfono algo roto es más representativo que uno impecable.
