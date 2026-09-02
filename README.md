# Proyecto HuertoHogar

Proyecto para la primera evaluación de la asignatura Fullstack 2. Hay que hacer una página web (meramente frontend) completa con el caso que nos dieron. Los archivos de la evaluación se encuentran en `/docs`.

## Por qué TS

Personalmente prefiero usar TS en vez de JS. No creo que haya problemas para el profesor si al fin al cabo son el mismo lenguaje, solo que TS proporciona tipado estricto para evitar errores a la hora de programar.

## Cómo correr el proyecto

Al no usar un framework como React o Angular, no hay un comando para correr un servidor local que transpila el código TS a JS y copie los archivos html y css a `/dist` a de forma automática. Hay que ejecutar el comando `pnpm run build` para transpilarlo y copiar de forma automática. En el `tsconfig.json` dice que el código TS debe ir en la carpeta `/src` y el código resultante irá en la carpeta `/dist`
