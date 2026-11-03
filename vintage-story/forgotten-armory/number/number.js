"use strict";

// All arithmetic stays integer-exact. Model counts and state counts are
// separate, so a collection can be extended without changing the pool logic.
const RULES = Object.freeze({
  materials: 7n * 7n + 7n * 7n + 15n * 15n,
  head: (8n + 4n) * 16n + 4n * 1n + 2n * 3n + 1n,
  body: 3n * 16n + 2n * 3n + 1n,
  legs: 1n * 16n + 2n * 3n + 1n
});
const COLLECTIONS = [
  { id: "greenwich", name: "Greenwich", version: "2.2.0", helmet: "1 Armet", body: "1 Noble", legs: "1 Noble", logo: "images/greenwich.png", headModels: 1n, bodyModels: 1n, legsModels: 1n },
  { id: "gothic", name: "Gothic", version: "2.2.0", helmet: "1 Sallet", body: "1 Noble", legs: "1 Noble", logo: "images/gothic.png", headModels: 1n, bodyModels: 1n, legsModels: 1n },
  { id: "chinese-dynasties", name: "Chinese Dynasties", version: "2.3.0", helmet: "4 scale + 16 Royal", body: "3 scale + 16 Royal", legs: "3 scale + 16 Royal", logo: "images/chinese-dynasties.png", headModels: 20n, bodyModels: 19n, legsModels: 19n, qing: true },
  { id: "varangian", name: "Varangian", version: "2.1.0", helmet: "4 models", body: "4 models", legs: "2 models", logo: "images/varangian.png", headModels: 4n, bodyModels: 4n, legsModels: 2n, modelNote: "Head: Guard, Guardmasked, Captain, Captainmasked. Body: Guard, Captain, Myrmidon, Veteran. Legs: Guard, Captain." },
  { id: "viking", name: "Viking", version: "2.1.0", helmet: "2 models", body: "2 models", legs: "2 models", logo: "images/viking.png", headModels: 2n, bodyModels: 2n, legsModels: 2n, modelNote: "Bjarnholdr plate + Ragnbjorn chain: one head, body and legs model each." },
  { id: "jousting", name: "Jousting", version: "2.0.0", helmet: "2 models", body: "1 Stechzeug", legs: "1 Stechzeug", logo: "images/jousting.png", headModels: 2n, bodyModels: 1n, legsModels: 1n, modelNote: "Head: Frogmouth + Kolben. Body and legs: Stechzeug." },
  { id: "hussar", name: "Hussar", version: "2.0.0", helmet: "6 models", body: "2 models", legs: "2 models", logo: "images/hussar.png", headModels: 6n, bodyModels: 2n, legsModels: 2n, modelNote: "Head: Szyszak + Kapalin, each base/masked/covered. Body and legs: Dragoon + Cavalier." }
];
const selected = new Set();
const fmt = value => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
const counts = mod => ({
  head: mod.headModels * RULES.materials * RULES.head + (mod.qing ? 3n * 16n ** 3n : 0n),
  body: mod.bodyModels * RULES.materials * RULES.body + (mod.qing ? 3n * 16n ** 3n : 0n),
  legs: mod.legsModels * RULES.materials * RULES.legs + (mod.qing ? 3n * 16n ** 3n : 0n)
});
const line = (label, formula) => `<span class="calc-line"><span>${label}</span><b>${formula}</b></span>`;
const slotFormula = (mod, slot) => `${mod[slot + "Models"]} × ${RULES[slot]} × 323${mod.qing ? " + 12 288" : ""}`;

function createCard(mod) {
  const totals = counts(mod);
  const card = document.createElement("article");
  card.className = `mod-card mod-card--${mod.id}`;
  card.dataset.mod = mod.id;
  card.dataset.selected = "false";
  card.innerHTML = `
    <button type="button" class="mod-select" aria-pressed="false" aria-label="Include ${mod.name} in the outfit pool">
    <span class="mod-card-top">
      <img src="${mod.logo}" alt="" width="48" height="48">
      <span class="mod-name">${mod.name}</span>
      <span class="selection-mark" aria-hidden="true">+</span>
    </span>
    <strong class="mod-total">${fmt(totals.head * totals.body * totals.legs)}</strong>
    <span class="mod-product">${fmt(totals.head)} × ${fmt(totals.body)} × ${fmt(totals.legs)}</span>
    </button>
    <details class="mod-calculation">
    <summary>Calculation</summary>
    <span class="mod-version">${mod.version} · 3 base metals · 16 colors</span>
    ${mod.modelNote ? `<span class="calc-hint model-note">${mod.modelNote}</span>` : ""}
    ${mod.qing ? `<span class="calc-section">
      <span class="calc-heading">THE FIVE SETS</span>
      ${line("Shānwén (Song)", "2 head / 1 body / 1 legs")}
      ${line("Tiefutu (Jin)", "1 / 1 / 1")}
      ${line("Sùwèi (Yuan)", "1 / 1 / 1")}
      ${line("Shìwèi Qīnjūn (Royal Qing)", "16 / 16 / 16")}
      <span class="calc-hint">Royal Qing: 16 base colors, independent of decoration color. Standard decorated counts: 20 head / 19 body / 19 legs.</span>
      <span class="calc-heading qing-heading">Bāqíjūn Buī (Qing)</span>
      <span class="calc-hint">3 independent color layers × 3 base metals, per slot. No cover, trim or separate decoration choice.</span>
      <span class="calc-subtotal">16³ × 3 = <b>12 288 per slot</b></span>
      <span class="calc-hint">Includes plain/plain/plain once. Add this separately to each slot below.</span>
    </span>` : ""}
    <span class="calc-section">
      <span class="calc-heading">THE MATERIALS</span>
      ${line("Iron", "7 × 7 = 49")}
      ${line("Meteoric Iron", "7 × 7 = 49")}
      ${line("Steel", "15 × 15 = 225")}
      <span class="calc-hint">Cover × trim, including “none”.</span>
      <span class="calc-subtotal">49 + 49 + 225 = <b>323</b></span>
    </span>

    <span class="calc-section">
      <span class="calc-heading">HEAD <span>${mod.helmet}</span></span>
      ${line("Communis + Regalis", "(8 + 4) × 16 = 192")}
      ${line("Metallicus", "4 × 1 = 4")}
      ${line("Bear + Wolf", "2 × 3 = 6")}
      <span class="calc-hint">+1 undecorated · Animal: black/brown/white.<br>Metallicus: plain only.</span>
      <span class="calc-subtotal">${slotFormula(mod, "head")} = <b>${fmt(totals.head)}</b></span>
    </span>

    <span class="calc-section">
      <span class="calc-heading">BODY <span>${mod.body}</span></span>
      ${line("3 brackets × colors", "3 × 16 = 48")}
      ${line("Bear + Wolf", "2 × 3 = 6")}
      <span class="calc-hint">+1 undecorated<br>Insignia · Mantellum · Vexilium</span>
      <span class="calc-subtotal">${slotFormula(mod, "body")} = <b>${fmt(totals.body)}</b></span>
    </span>

    <span class="calc-section">
      <span class="calc-heading">LEGS <span>${mod.legs}</span></span>
      ${line("Lacinia × colors", "1 × 16 = 16")}
      ${line("Bear + Wolf", "2 × 3 = 6")}
      <span class="calc-hint">+1 undecorated</span>
      <span class="calc-subtotal">${slotFormula(mod, "legs")} = <b>${fmt(totals.legs)}</b></span>
    </span>

    </details>`;
  card.querySelector(".mod-select").addEventListener("click", () => {
    if (selected.has(mod.id)) selected.delete(mod.id);
    else selected.add(mod.id);
    update();
  });
  return card;
}

function update() {
  const active = COLLECTIONS.filter(mod => selected.has(mod.id));
  const pool = { head: 0n, body: 0n, legs: 0n };
  for (const mod of active) {
    const value = counts(mod);
    for (const slot of ["head", "body", "legs"]) pool[slot] += value[slot];
  }
  const total = pool.head * pool.body * pool.legs;
  // Group whole thousands so very large future results can wrap without
  // dropping digits, truncating, rounding, or switching to scientific notation.
  const output = document.getElementById("outfit-total");
  output.replaceChildren(...fmt(total).split("\u202f").flatMap((group, index) => {
    const span = document.createElement("span");
    span.textContent = group;
    return index ? [document.createTextNode("\u202f"), span] : [span];
  }));
  for (const slot of ["head", "body", "legs"]) {
    document.getElementById(`${slot}-total`).textContent = fmt(pool[slot]);
    const addition = document.getElementById(`${slot}-addition`);
    addition.textContent = active.length > 1 ? active.map(mod => fmt(counts(mod)[slot])).join(" + ") : "";
    addition.hidden = active.length < 2;
  }
  document.getElementById("selection-caption").textContent = active.length
    ? active.map(mod => mod.name).join(" + ")
    : "Choose a collection.";
  document.getElementById("clear-selection").disabled = !active.length;
  for (const card of document.querySelectorAll(".mod-card")) {
    const on = selected.has(card.dataset.mod);
    const mod = COLLECTIONS.find(item => item.id === card.dataset.mod);
    card.dataset.selected = String(on);
    const toggle = card.querySelector(".mod-select");
    toggle.setAttribute("aria-pressed", String(on));
    toggle.setAttribute("aria-label", `${on ? "Remove" : "Include"} ${mod.name} ${on ? "from" : "in"} the outfit pool`);
    card.querySelector(".selection-mark").textContent = on ? "✓" : "+";
  }
}

COLLECTIONS.forEach((mod, index) => {
  document.getElementById(index % 2 ? "right-collections" : "left-collections").append(createCard(mod));
});
document.getElementById("clear-selection").addEventListener("click", () => { selected.clear(); update(); });
update();
