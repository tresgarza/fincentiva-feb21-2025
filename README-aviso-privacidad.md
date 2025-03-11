# Instrucciones para agregar el Aviso de Privacidad

Para que el enlace al Aviso de Privacidad funcione correctamente, sigue estos pasos:

## Ubicación del archivo

1. El archivo del Aviso de Privacidad debe nombrarse exactamente como `aviso-privacidad.pdf`
2. Debes colocarlo en la carpeta `public/docs/` del proyecto

## Pasos para agregar el archivo

1. Asegúrate de que existe la carpeta `public/docs/` en tu proyecto (ya ha sido creada)
2. Copia tu archivo PDF del Aviso de Privacidad en esa carpeta
3. Verifica que el nombre del archivo sea exactamente `aviso-privacidad.pdf`

## Verificación

Una vez desplegada la aplicación, podrás acceder al Aviso de Privacidad desde el enlace en el footer de cualquier página. Al hacer clic en "Aviso de Privacidad", se abrirá el documento en una nueva pestaña del navegador.

## Solución de problemas

Si el enlace no funciona, verifica:

1. Que el archivo esté correctamente ubicado en `public/docs/aviso-privacidad.pdf`
2. Que el nombre del archivo sea exactamente `aviso-privacidad.pdf` (respetando mayúsculas/minúsculas)
3. Que la carpeta `public` esté correctamente configurada en tu servicio de hosting

Si necesitas modificar la ruta o el nombre del archivo, deberás editar el componente `Footer.jsx` y cambiar la ruta del enlace. 