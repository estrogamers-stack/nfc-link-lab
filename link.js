(() => {
  const ice = [{urls:"stun:stun.l.google.com:19302"}];

  let pc = null;
  let dc = null;
  let tx = 0, rx = 0;
  const pings = new Map();

  const $ = id => document.getElementById(id);
  const log = (...x) => {
    $("log").textContent = `[${new Date().toLocaleTimeString()}] ${x.join(" ")}\n` + $("log").textContent;
  };

  function setState(s, on=false){
    $("state").textContent = s;
    $("dot").classList.toggle("on", on);
  }

  function updateCounters(){
    $("tx").textContent = tx;
    $("rx").textContent = rx;
  }

  function waitIceComplete(peer){
    if (peer.iceGatheringState === "complete") return Promise.resolve();
    return new Promise(resolve => {
      const f = () => {
        if (peer.iceGatheringState === "complete"){
          peer.removeEventListener("icegatheringstatechange", f);
          resolve();
        }
      };
      peer.addEventListener("icegatheringstatechange", f);
      setTimeout(resolve, 2500);
    });
  }

  function createPeer(){
    pc = new RTCPeerConnection({iceServers:ice});
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      setState(s.toUpperCase(), s === "connected");
      log("Peer:", s);
    };
    pc.ondatachannel = e => attachChannel(e.channel);
    return pc;
  }

  function attachChannel(ch){
    dc = ch;
    dc.binaryType = "arraybuffer";
    dc.onopen = () => {
      setState("CONECTADO", true);
      log("DataChannel abierto.");
      window.NFCLinkAdapter?.attachTransport(sendBinary);
    };
    dc.onclose = () => setState("DESCONECTADO", false);
    dc.onerror = e => log("DataChannel error", e.message || "");
    dc.onmessage = onMessage;
  }

  function sendBinary(bytes){
    if (!dc || dc.readyState !== "open") throw new Error("No conectado");
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    dc.send(u8);
    tx++;
    updateCounters();
  }

  function sendJSON(obj){
    if (!dc || dc.readyState !== "open") throw new Error("No conectado");
    dc.send(JSON.stringify(obj));
    tx++;
    updateCounters();
  }

  function onMessage(e){
    rx++;
    updateCounters();

    if (typeof e.data === "string"){
      try {
        const m = JSON.parse(e.data);
        if (m.t === "ping") {
          sendJSON({t:"pong", id:m.id, ts:m.ts});
          return;
        }
        if (m.t === "pong") {
          const started = pings.get(m.id);
          if (started) {
            $("rtt").textContent = Math.round(performance.now() - started);
            pings.delete(m.id);
          }
          return;
        }
      } catch {}
      log("Texto RX:", e.data);
      return;
    }

    const bytes = new Uint8Array(e.data);
    log("LINK RX:", [...bytes].map(b=>b.toString(16).padStart(2,"0")).join(" "));
    window.NFCLinkAdapter?.receiveFromNetwork(bytes);
  }

  $("createOffer").onclick = async () => {
    createPeer();
    attachChannel(pc.createDataChannel("nfc-link", {ordered:true}));
    await pc.setLocalDescription(await pc.createOffer());
    await waitIceComplete(pc);
    $("offerOut").value = btoa(unescape(encodeURIComponent(JSON.stringify(pc.localDescription))));
    log("Oferta creada.");
  };

  $("acceptOffer").onclick = async () => {
    createPeer();
    const offer = JSON.parse(decodeURIComponent(escape(atob($("offerIn").value.trim()))));
    await pc.setRemoteDescription(offer);
    await pc.setLocalDescription(await pc.createAnswer());
    await waitIceComplete(pc);
    $("answerOut").value = btoa(unescape(encodeURIComponent(JSON.stringify(pc.localDescription))));
    log("Respuesta creada.");
  };

  $("applyAnswer").onclick = async () => {
    const answer = JSON.parse(decodeURIComponent(escape(atob($("answerIn").value.trim()))));
    await pc.setRemoteDescription(answer);
    log("Respuesta aplicada.");
  };

  $("ping").onclick = () => {
    const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    pings.set(id, performance.now());
    sendJSON({t:"ping", id, ts:Date.now()});
  };

  $("packet").onclick = () => {
    const bytes = $("payload").value.trim().split(/\s+/).map(x => parseInt(x,16) & 255);
    sendBinary(new Uint8Array(bytes));
    log("LINK TX:", bytes.map(b=>b.toString(16).padStart(2,"0")).join(" "));
  };

  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.onclick = async () => {
      const el = $(btn.dataset.copy);
      await navigator.clipboard.writeText(el.value);
      const old = btn.textContent;
      btn.textContent = "COPIADO ✓";
      setTimeout(()=>btn.textContent=old, 900);
    };
  });
})();
