/*
  NFC LINK CORE ADAPTER
  ---------------------
  Objetivo final:
  DoubleCherryGB netpacket <-> WebRTC DataChannel

  En este laboratorio todavía no hay core WASM conectado. Este archivo deja
  establecida la interfaz para no acoplar la red al emulador.

  Cuando compilemos DoubleCherryGB:
  - El core llamará a sendFromCore(bytes) cuando tenga datos Link.
  - receiveFromNetwork(bytes) inyectará datos recibidos al callback netpacket.
*/
(() => {
  let transport = null;
  let coreReceiveCallback = null;

  window.NFCLinkAdapter = {
    attachTransport(fn) {
      transport = fn;
      console.log("[NFC LINK] transporte WebRTC conectado");
    },

    attachCoreReceiver(fn) {
      coreReceiveCallback = fn;
      console.log("[NFC LINK] receptor del core conectado");
    },

    sendFromCore(bytes) {
      if (!transport) throw new Error("Transporte no disponible");
      transport(bytes);
    },

    receiveFromNetwork(bytes) {
      if (coreReceiveCallback) {
        coreReceiveCallback(bytes);
      } else {
        console.log("[NFC LINK] RX de red (core aún no conectado)", bytes);
      }
    }
  };
})();
