# Panel BLE: diagnóstico y comprobación

Firmware inspeccionado, sin modificar: `/Users/degh/Downloads/hydro_tower_chat_v2/hydro_tower_chat_v2.ino`, cabecera **Version 5.1 - pruebas sin espera tras reinicio**. El archivo llamado exactamente `hydro_tower/hydro_tower.ino` en Descargas es una versión anterior. No se ha cargado firmware ni se ha conectado hardware desde las pruebas automatizadas.

## Causa y evidencia

El panel anterior hacía una lectura inicial y después dependía de NOTIFY. Cada evento se interpretaba como un JSON completo; el `catch` descartaba tanto errores de parseo como excepciones de actualización sin informar. Al perder mensajes válidos, el contador restaba uno cada segundo y permanecía en cero mostrando el último estado ON indefinidamente. Este defecto se confirma por inspección y por simulación; el truncamiento en la conexión real sigue siendo una hipótesis pendiente de medir.

La versión 5.1 serializa 18 campos en `notifyStatus()` (líneas 460–505): `pump`, `water`, `state`, `onSec`, `offSec`, `maxOnSec`, `remainingSec`, `hourUsedSec`, `hourUsedMs`, `hourMaxSec`, `hourWindowSec`, `recoveryRemainingSec`, `protectionWaitSec`, `nextWateringSec`, `hourUsageText`, `configPending`, `boot`, `error`. `nextWateringSec` es null al regar o faltar agua. `error` se borra después de incorporarlo al estado, por lo que puede perderse si no se recibe ese estado.

El código confirma 60/120 s por defecto con conservación de NVS válida, confirmaciones de agua de 5/3 s, 1200 s de uso en ventana móvil de 3600 s, historial vacío tras reinicio, `recoveryRemainingMs()` igual a cero, y aplicación de configuración solo con bomba apagada. No hay recuperación de servidor. La web no sustituye ninguna de estas decisiones.

## Tamaño y límites de READ/NOTIFY

El fixture representativo de las pruebas ocupa **331 bytes UTF-8**, calculados con los campos del firmware y `boot=POWER_ON`; no es una captura de la placa. La prueba de estrés con un error artificial largo ocupa 529 bytes: prueba el parser web, **no** demuestra que el transporte pueda entregarlo.

Una notificación ATT admite como máximo MTU menos 3 bytes: 20 para MTU 23, 182 para 185 y 244 para 247. Por tanto, un estado de 331 bytes no cabe en esas notificaciones; necesitaría MTU de al menos 334. No se ha medido el MTU negociado de la placa actual. Web Bluetooth no ofrece una API para fijarlo. Véase la [especificación ATT, Handle Value Notification y Read Blob](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-61/out/en/host/attribute-protocol--att-.html) y la [API Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/).

Se inspeccionó también la instalación local de NimBLE-Arduino en `Documents/Arduino/libraries/NimBLE-Arduino/src/`: `NimBLECharacteristic.cpp` describe un máximo de atributo de 512 bytes para ESP32; `NimBLEServer.cpp` sirve el valor en READ y admite lecturas posteriores del atributo. `NimBLEAttValue.cpp` rechaza valores que exceden el máximo: pedir READ no puede recuperar algo que no se guardó. El firmware 5.1 usa READ | NOTIFY, `setValue(out)` y `notify()` sin fragmentación ni callback que regenere el JSON durante READ. READ recupera la última instantánea guardada, no fuerza una nueva medición.

El cliente solicita `readValue()` y valida su resultado completo. La lectura larga ATT puede recuperar valores mayores que una notificación mediante Read Blob, pero depende de la implementación del navegador/sistema y del servidor. Queda pendiente comprobarlo en Chrome del computador y Android reales. Si también READ devuelve un fragmento o falla, se conserva el último estado válido y aparece el aviso de antigüedad. No se concatenan eventos ni se interpreta un fragmento como estado.

No se requiere cambiar el firmware para probar esta corrección. Si las capturas muestran que READ no puede devolver el JSON completo, el siguiente cambio concreto sería un estado BLE compacto dentro del máximo de atributo y una notificación corta de cambio que dispare READ; si se necesita superar 512 bytes, hará falta un protocolo explícito con versión, identificador, longitud y fragmentos. Aumentar arbitrariamente el buffer o el MTU no garantiza la solución. La lógica de riego debe permanecer igual.

## Comportamiento implementado

- Listener instalado antes de habilitar NOTIFY y retirado al cerrar la sesión. Se descartan eventos de características anteriores y respuestas READ de sesiones terminadas.
- Cola GATT compartida para suscripción, lecturas y escrituras; una sola lectura pendiente. Un evento inválido solicita un READ, sin reintento recursivo. Separación mínima de 1,5 s entre solicitudes; respaldo cada 5 s, sin acumular solicitudes si una lectura sigue pendiente.
- El evento `characteristicvaluechanged` también puede originarse en READ. La lectura en curso impide que un evento inválido generado por ella provoque un bucle.
- Estado validado antes de reemplazar el anterior. Referencia monotónica para la cuenta local, resincronizada con cada estado válido y al volver a la pestaña. Cero solicita confirmación y muestra «Actualizando estado…»; nunca cambia ON/OFF por predicción.
- Sin datos válidos durante más de 8 s: «Datos desactualizados», manteniendo los valores anteriores como referencia. Una desconexión GATT muestra «Sin conexión». Los datos numéricos no se inventan ni se incrementa el uso localmente.
- ON, OFF, NO_WATER y HOUR_LIMIT tienen textos distintos. La espera de protección no afirma que el consumo ya sea exactamente 20 minutos. Recuperación cero no muestra espera inicial; un valor futuro positivo muestra esa espera incluso junto con falta de agua.
- Uso en minutos y segundos, sobre 20:00, con explicación de ventana móvil. Null en `nextWateringSec` oculta el próximo riego.
- Se valida la conversión de minutos a segundos enteros: riego 5–900, descanso 5–86400 y descanso >= 2 × riego. Se preserva la edición, incluso si la persona escribe otra configuración mientras la anterior se aplica.
- «Enviando» precede a la escritura. Su éxito solo pasa a «Pendiente de aplicar». «Aplicada» requiere coincidencia de ambos valores y `configPending=false`; `error` produce «Rechazada». Tras 15 s sin confirmación inicial se informa incertidumbre; una confirmación explícita de pendiente permite esperar hasta el fin del riego. El protocolo actual no tiene identificadores de solicitud para correlacionar cambios hechos por varios clientes.

## Diagnóstico de desarrollo

En la consola del navegador, consultar `window.growaBleDiagnostics`:

- `lastValidAt`, `validUpdates`, `lastValidBytes`: fecha ISO, contador y tamaño del último estado aceptado.
- `lastValueChangedBytes`: tamaño del último evento de característica (incluye los generados por READ).
- `lastReadBytes`: tamaño del último resultado de READ; `lastMessageBytes`: último tamaño recibido por cualquier vía.
- `parseErrors`, `readErrors`, `lastParseError`, `lastReadError`: contadores y metadatos de errores con fecha. Los avisos `[BLE]` no incluyen el contenido del JSON ni identificadores del dispositivo.

Para comprobar truncamiento: observar errores de parseo junto a tamaños de eventos cortos y READ válidos mayores. Si solo READ actualiza `validUpdates`, la conexión existe pero las notificaciones no están entregando estados completos. Si READ tampoco devuelve datos válidos, registrar tamaños y errores antes de considerar una modificación de protocolo. No hay diagnóstico del MTU en la API web; puede observarse por trazas BLE o instrumentación `onMTUChange` en firmware, sin modificar el riego.

## Pruebas y ejecución local

`npm test` usa `node:test`, sin dependencias adicionales, y ejecuta el script real del panel en un DOM y GATT simulados con reloj controlado. Cubre ciclo ON/OFF/ON, deriva, cero, antigüedad, JSON grande/truncado/inválido, READ fallido/recuperado, ausencia de concatenación y reintentos recursivos, cola GATT, reconexión y respuestas antiguas, vuelta a la pestaña, agua, protección, recuperación cero/positiva, null, uso 1199 s y configuración. No solicita dispositivos ni escribe en una placa.

Resultado local: 10/10 pruebas aprobadas; `npm run build` correcto; `ASTRO_TELEMETRY_DISABLED=1 npx astro check` con 0 errores, 0 advertencias y 0 hints. El intento de iniciar el servidor en este entorno falló con `listen EPERM ::1:4321`; no se realizó una prueba HTTP ni Bluetooth real.

Para desarrollo: `npm ci`, luego `ASTRO_TELEMETRY_DISABLED=1 npm run dev -- --background`. Abrir `http://localhost:4321/control` en Chrome o Edge con Bluetooth disponible y pulsar «Conectar con la torre». Gestionar el servidor con `npx astro dev status`, `npx astro dev logs` y `npx astro dev stop`. Si el entorno impide abrir puertos, iniciar el comando desde una terminal normal. Para usar Android con la web servida desde otro equipo se necesita HTTPS; la IP LAN por HTTP no equivale a localhost.

Comprobación manual pendiente, sin cambiar la configuración:

1. Conectar a TorreHidroponica y consultar los diagnósticos; comprobar que `lastValidAt` sigue avanzando.
2. Observar un ciclo completo con los tiempos reportados por la placa (pueden ser distintos de 60/120 por NVS). Verificar ON → OFF → ON junto con el comportamiento físico y la resincronización de contadores.
3. Cambiar de pestaña y regresar; comprobar actualización. Desconectar y reconectar desde la página; comprobar que las actualizaciones continúan.
4. Registrar los tamaños por evento y READ y los errores. Confirmar una lectura de más de un paquete en los navegadores reales. No hace falta encender la bomba mediante comandos de prueba.
