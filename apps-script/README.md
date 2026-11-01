# Conexión de confirmaciones con Google Sheets

El formulario publica una respuesta por cada envío en la pestaña `Confirmaciones` de la hoja de respuestas. El ID de la hoja se guarda en las propiedades privadas del proyecto de Apps Script y no se incluye en el sitio público.

## Publicar el receptor

1. Iniciá sesión con la cuenta propietaria de la hoja y abrí [script.new](https://script.new).
2. Reemplazá el contenido de `Code.gs` por el archivo de esta carpeta y guardá el proyecto.
3. En **Configuración del proyecto → Propiedades del script**, agregá `SPREADSHEET_ID` y como valor pegá el ID que aparece entre `/d/` y `/edit` en el enlace de la hoja.
4. Elegí **Implementar → Nueva implementación → Aplicación web**.
5. Configurá **Ejecutar como: Yo** y el acceso para que puedan enviar respuestas las personas invitadas sin iniciar sesión.
6. Implementá el servicio, autorizá el acceso a Sheets y copiá la URL que termina en `/exec`.
7. Pegame esa URL para agregarla a `RSVP_WEB_APP_URL` en `script.js` y publicar la conexión.

Hasta que se agregue esa URL, el formulario avisa que la hoja no está conectada y no muestra una confirmación falsa de guardado.
