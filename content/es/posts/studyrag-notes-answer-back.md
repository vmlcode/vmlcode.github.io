Cuatro semestres de apuntes: la mitad a mano, la mitad tipeados, ninguno buscable, todos necesarios la noche antes de un examen. StudyRAG empezó como una caja de búsqueda sobre mi propia letra y terminó siendo lo más útil que he construido, por razones que casi no tienen que ver con la recuperación.

## El OCR es el 80% del trabajo y el 0% de la diversión

Ningún tutorial de RAG empieza con "primero, arregla tu letra". El mío tuvo que hacerlo.

Tesseract sobre fotos crudas de apuntes de clase producía texto correcto en un 60% aproximado — inusable, porque los errores se agrupan justo en los términos técnicos que importan. `eigenvalue` se volvía `eigenvatue`, `tensor` se volvía `fensor`, y cada uno de esos es un término que de verdad buscarías.

Lo que lo arregló, en orden de impacto: enderezar la imagen y aplicar umbralización adaptativa antes del OCR; una lista de palabras propia con la terminología del curso pasada a Tesseract; y una pasada de corrección difusa contra esa misma lista después. Eso subió la precisión a cerca del 94%, que alcanza — porque la recuperación es robusta al ruido de una forma en que la búsqueda exacta no lo es.

> Una caja de búsqueda necesita que el texto esté bien. Un sistema de recuperación necesita que esté cerca. En esa brecha se volvió posible este proyecto.

## Trocear por estructura, no por longitud

Mi primera versión troceaba cada 512 tokens con 50 de solapamiento, porque es lo que hace todo el mundo. Los resultados eran mediocres de una forma que no supe explicar de inmediato.

El problema es que los apuntes de clase tienen estructura, y las ventanas de tamaño fijo la destruyen. Una definición y su ejemplo resuelto caían en trozos distintos; la recuperación devolvía el ejemplo sin la definición, y la respuesta salía confiada y sin la mitad de su contexto.

Trocear según la estructura — encabezado, bloque de definición, ejemplo resuelto, cada uno su propio trozo con el encabezado padre antepuesto — mejoró la calidad de la recuperación más que cambiar el modelo de embeddings.

```
ventanas fijas de 512 tokens    respuesta útil en el top-3:  61%
+ encabezado antepuesto                                      72%
trozos estructurales                                         84%
+ número de página en metadatos                              84%  (pero citable)
```

Esa última fila es la importante. No cambió ningún número y volvió confiable al sistema.

## Las citas eran la verdadera funcionalidad

Agregué las citas de fuente como ayuda de depuración. Quería saber de qué trozo venía una respuesta para poder distinguir si la culpa era de la recuperación o de la generación.

Resultaron ser el producto. Desde que cada respuesta cargaba con "apuntes, semana 6, página 3", pasaron dos cosas. Empecé a detectar alucinaciones de inmediato, porque una respuesta equivocada suele citar una página que obviamente no la respalda. Y empecé a *usar* las respuestas de otra forma — siguiendo la cita hasta la página original y leyendo alrededor, que es lo que debí haber hecho desde el principio.

![captura: una respuesta con su página fuente citada]()

El sistema dejó de ser un oráculo y se volvió un índice con opiniones. Eso es mucho mejor de tener la noche antes de un examen.

## Reproduce mis errores, y eso sirve

Responde con las palabras de mis propios apuntes — incluidos los lugares donde mis apuntes están mal.

Así encontré tres errores genuinos en mis apuntes de álgebra lineal: el sistema me dijo con toda confianza algo incorrecto, seguí la cita, y ahí estaba, en mi propia letra de dieciocho meses antes. Un modelo de propósito general me habría dado en silencio la respuesta correcta y yo seguiría creyendo que en su momento lo había entendido.

## Qué le diría a alguien que empieza uno

Gasta tu tiempo en el corpus, no en el modelo. Toda mejora significativa que hice estaba río arriba de la recuperación: la pasada de OCR, los límites de los trozos, los metadatos. Cambié de modelo de embeddings dos veces y casi no movió nada.

Y cita tus fuentes desde el día uno, incluso en un prototipo que solo tú vas a usar. Un sistema de recuperación es tan honesto como sus citas, y no vas a notar que te miente hasta que puedas comprobarlo.
