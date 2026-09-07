# NFC LINK LAB V0.1

Objetivo: demostrar el transporte que después usará el cable Link virtual de Pokémon.

## Qué funciona ya
- WebRTC DataChannel entre dos navegadores.
- Paquetes binarios ordenados y fiables.
- Medición de RTT.
- Interfaz `core-adapter.js` preparada para conectar un core libretro/WASM.

## Qué NO hace todavía
Todavía no conecta Pokémon al canal WebRTC. Para ello necesitamos compilar
DoubleCherryGB como core WebAssembly y adaptar su `netpacket` al transporte web.

## Probar la conexión
Puedes subir estos archivos a GitHub Pages.

Jugador A:
1. CREAR OFERTA.
2. Copia la oferta y envíala al Jugador B.

Jugador B:
1. Pega la oferta.
2. ACEPTAR OFERTA.
3. Copia la respuesta y envíala a A.

Jugador A:
1. Pega la respuesta.
2. APLICAR RESPUESTA.

Cuando ponga CONECTADO:
- pulsa PING;
- prueba ENVIAR PAQUETE LINK DE PRUEBA.

La otra pantalla debe mostrar exactamente los mismos bytes.

## Compilar DoubleCherryGB
Este repo incluye:

`.github/workflows/build-doublecherry.yml`

En GitHub:
Actions -> Build DoubleCherryGB WASM experiment -> Run workflow.

El workflow:
1. instala Emscripten;
2. clona DoubleCherryGB;
3. intenta `emmake make platform=emscripten`;
4. guarda siempre los logs y cualquier `.bc/.wasm/.a` como Artifact.

Ese resultado nos dirá si podemos entrar directamente en el empaquetado
EmulatorJS o si hay que parchear el Makefile/core.

## Por qué DoubleCherryGB
El core documenta intercambio online Pokémon R/B/Y/G/S/C mediante la
`netpacket API` de RetroArch, transfiriendo solo los datos del Link Cable.

Nuestra adaptación objetivo es:

DoubleCherryGB netpacket
        ↓
core-adapter.js
        ↓
WebRTC DataChannel
        ↓
core-adapter.js
        ↓
DoubleCherryGB netpacket

## ROMs
Este laboratorio no incluye ROMs comerciales.
