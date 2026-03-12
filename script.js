/* =========================================
   CONTE TASCA D'ALMERITA
   Report di Sostenibilità — Script
   File JavaScript che gestisce:
   - animazione decorativa di sfondo su canvas
   - logica di download dei PDF
   - notifiche toast all'utente
   - animazione delle card allo scroll
   - accessibilità da tastiera
   ========================================= */

(function () {
  'use strict';

  /* ───────────────────────────────────────
     Canvas di sfondo: animazione decorativa
     con pattern ispirato a foglie / tralci
     
     Questa sezione crea un effetto visivo in
     background usando l'elemento <canvas>.
     L'idea è simulare piccole foglie o nodi
     vegetali che si muovono lentamente nello
     spazio, per rafforzare l'identità naturale
     e agricola del sito senza interferire con
     i contenuti principali.
     ─────────────────────────────────────── */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* 
     Crea un insieme di "particelle" che in realtà
     rappresentano piccoli elementi grafici simili
     a foglie sospese o frammenti vegetali.

     Ogni particella possiede:
     - x, y: posizione iniziale sul canvas
     - size: dimensione della foglia
     - speedX: velocità orizzontale lieve
     - speedY: velocità verticale verso l'alto
     - angle: rotazione iniziale
     - spin: velocità di rotazione
     - alpha: trasparenza, per dare profondità
     
     Il risultato è un movimento leggero, organico
     e non uniforme, più naturale rispetto a una
     semplice animazione rigida o ripetitiva.
  */
  function createParticles(count) {
    return Array.from({ length: count }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      size:  4 + Math.random() * 8,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: -0.05 - Math.random() * 0.12,
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.008,
      alpha: 0.3 + Math.random() * 0.5,
    }));
  }

  /*
     Disegna una singola foglia sul canvas.

     La funzione:
     - salva lo stato corrente del contesto grafico
     - sposta il punto di disegno nelle coordinate x, y
     - ruota il sistema in base all'angolo fornito
     - disegna la forma della foglia con curve Bézier
     - riempie la foglia con il colore corrente
     - disegna poi una nervatura centrale per aggiungere dettaglio
     - ripristina infine lo stato precedente del canvas

     In questo modo ogni foglia può essere disegnata
     in posizione, dimensione e inclinazione diverse,
     pur mantenendo una forma coerente.
  */
  function drawLeaf(x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.8, -size * 0.5, size * 0.8, size * 0.5, 0, size);
    ctx.bezierCurveTo(-size * 0.8, size * 0.5, -size * 0.8, -size * 0.5, 0, -size);
    ctx.fill();
    // nervatura centrale della foglia, disegnata come una linea sottile
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.8);
    ctx.lineTo(0, size * 0.8);
    ctx.strokeStyle = 'rgba(26,20,16,0.25)';
    ctx.lineWidth = 0.4;
    ctx.stroke();
    ctx.restore();
  }

  /*
     Funzione principale di animazione del canvas.

     Ad ogni frame:
     - cancella l'intera area del canvas
     - imposta il colore di riempimento delle foglie
     - scorre tutte le particelle
     - disegna ogni foglia
     - aggiorna posizione e rotazione
     - se una foglia esce dalla parte alta dello schermo,
       la riposiziona in basso con una nuova coordinata orizzontale

     requestAnimationFrame richiama questa funzione
     in modo continuo, sincronizzando l'animazione
     con il refresh del browser per ottenere fluidità.
  */
  function animateCanvas() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#3a2a1a';

    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      drawLeaf(p.x, p.y, p.size, p.angle);
      p.x += p.speedX;
      p.y += p.speedY;
      p.angle += p.spin;
      if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateCanvas);
  }

  /*
     Quando la finestra cambia dimensione:
     - il canvas viene ridimensionato per coprire
       sempre tutta l'area visibile
     - le particelle vengono rigenerate per adattarsi
       correttamente al nuovo spazio disponibile

     Questo evita problemi grafici su resize della finestra
     o su cambi di orientamento dei dispositivi mobili.
  */
  window.addEventListener('resize', () => { resize(); particles = createParticles(40); });

  /*
     Inizializzazione del canvas:
     - imposta dimensioni iniziali
     - genera 40 particelle decorative
     - avvia il ciclo continuo di animazione
  */
  resize();
  particles = createParticles(40);
  animateCanvas();


  /* ───────────────────────────────────────
     Logica di download dei report PDF
     
     Questa sezione gestisce:
     - il recupero degli elementi toast
     - la visualizzazione di un messaggio di conferma
     - l'avvio del download del file associato a ciascun report
     ─────────────────────────────────────── */
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  let toastTimer = null;

  /*
     Mostra una notifica toast temporanea.

     La funzione:
     - aggiorna il testo del messaggio
     - rende visibile il toast aggiungendo la classe "show"
     - annulla un eventuale timer precedente
     - imposta un nuovo timer che nasconde il toast dopo 3,2 secondi

     In questo modo, se l'utente avvia più azioni in rapida successione,
     la notifica viene aggiornata correttamente senza sovrapporsi male.
  */
  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  /*
     Avvia il download di un file PDF.

     La funzione crea dinamicamente un link <a>,
     imposta:
     - href con il percorso del file
     - download con un nome file personalizzato

     Poi:
     - inserisce temporaneamente il link nel DOM
     - simula un click per far partire il download
     - rimuove il link dal DOM
     - mostra un toast di conferma all'utente

     Questa tecnica è utile per forzare il download
     senza richiedere che il link sia già presente
     staticamente nell'HTML.
  */
  function triggerDownload(filePath, year) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = `Conte-Tasca-dAlmerita_Report-Sostenibilita_${year}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Download avviato: Report di Sostenibilità ${year}`);
  }

  /* 
     Collega un listener di click a tutti i pulsanti di download.

     Per ogni pulsante:
     - individua la card del report più vicina
     - legge gli attributi data-year e data-file
     - avvia il download del PDF corretto
     - disattiva temporaneamente il pulsante per 1 secondo

     La disattivazione breve tramite pointer-events serve
     a evitare click ripetuti involontari che potrebbero
     generare download multipli consecutivi.
  */
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = this.closest('.report-card');
      const year = card.dataset.year;
      const file = card.dataset.file;
      triggerDownload(file, year);
      // piccolo feedback temporaneo: blocca i click ripetuti subito dopo l'attivazione
      this.style.pointerEvents = 'none';
      setTimeout(() => { this.style.pointerEvents = ''; }, 1000);
    });
  });


  /* ───────────────────────────────────────
     Animazione delle card quando entrano in viewport
     
     Questa parte usa IntersectionObserver per rilevare
     quando le card dei report diventano visibili
     durante lo scroll della pagina.
     ─────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const cards = document.querySelectorAll('.report-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach(card => {
      card.style.animationPlayState = 'paused';
      observer.observe(card);
    });
  }

  /*
     Come funziona questo blocco:
     - verifica prima che il browser supporti IntersectionObserver
     - seleziona tutte le card dei report
     - mette in pausa l'animazione iniziale di ciascuna card
     - osserva quando ogni card entra nell'area visibile della finestra
     - quando almeno il 15% della card è visibile (threshold: 0.15),
       l'animazione viene fatta partire
     - dopo l'attivazione, la card non viene più osservata

     Questo approccio migliora la percezione visiva
     e rende la comparsa degli elementi più elegante,
     evitando che tutte le animazioni partano subito al caricamento.
  */


  /* ───────────────────────────────────────
     Accessibilità da tastiera
     
     Questa sezione rende i pulsanti di download
     più accessibili anche per utenti che navigano
     senza mouse, usando tastiera o tecnologie assistive.
     ─────────────────────────────────────── */
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  /*
     In dettaglio:
     - role="button" rafforza il significato semantico dell'elemento
     - tabindex="0" permette di raggiungerlo tramite il tasto Tab
     - il listener keydown intercetta:
       * Enter
       * Barra spaziatrice
     - in entrambi i casi, viene simulato il click

     Questo garantisce un'esperienza più inclusiva
     e coerente con i comportamenti attesi nei componenti interattivi del web.
  */

})();
