import { openCardCreateModal } from "./modals/card-create.js";
import { openCardDeleteModal } from "./modals/card-delete.js";
import { openCardUpdateModal } from "./modals/card-update.js";
import { BASE_URL } from "./config.js";

// =============================================
// CAMBIA QUI LA TUA PASSWORD
const PASSWORD = "Mambro0004";
// =============================================

const card_create = document.getElementById("card-create");
const card_list = document.getElementById("card-list");
const modal_area = document.getElementById("modal-area");
const lock_btn = document.getElementById("lock-btn");
const lock_icon = document.getElementById("lock-icon");

// Stato filtri attivi
let activeFilters = new Set();
let allCards = [];

// Controlla se già sbloccato in questa sessione
let unlocked = sessionStorage.getItem("nc_unlocked") === "true";

document.addEventListener("DOMContentLoaded", async () => {
  // Applica stato iniziale lucchetto
  applyLockState();

  card_create.addEventListener("click", () => cardCreateModal());

  modal_area.addEventListener("click", (e) => {
    if (e.target.id === "modal-area") {
      closeAllModals();
    }
  });

  // Click lucchetto
  lock_btn.addEventListener("click", () => {
    if (unlocked) {
      // Era aperto → chiudi
      lock();
    } else {
      // Era chiuso → apri modal password
      openPasswordModal();
    }
  });

  // Conferma password con Enter
  document.getElementById("password-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("password-confirm").click();
  });

  document.getElementById("password-confirm").addEventListener("click", () => {
    const input = document.getElementById("password-input").value;
    if (input === PASSWORD) {
      unlock();
      closeAllModals();
    } else {
      document.getElementById("password-error").classList.remove("hidden");
      document.getElementById("password-input").value = "";
      document.getElementById("password-input").focus();
    }
  });

  document.getElementById("password-cancel").addEventListener("click", () => {
    closeAllModals();
  });

  setupFilterListeners();

  await cardListInit();
  await updateTotalPrice();
});

function openPasswordModal() {
  modal_area.classList.remove("hidden");
  document.getElementById("modal-password").classList.remove("hidden");
  document.getElementById("password-input").value = "";
  document.getElementById("password-error").classList.add("hidden");
  setTimeout(() => document.getElementById("password-input").focus(), 100);
}

function unlock() {
  unlocked = true;
  sessionStorage.setItem("nc_unlocked", "true");
  applyLockState();
}

function lock() {
  unlocked = false;
  sessionStorage.removeItem("nc_unlocked");
  applyLockState();
  // Ri-renderizza le carte per nascondere i bottoni
  applyFilters();
}

function applyLockState() {
  if (unlocked) {
    // Lucchetto aperto
    lock_icon.innerHTML = `
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
    `;
    lock_btn.title = "Blocca modifiche";
    lock_btn.style.color = "#48bb78";
    card_create.classList.remove("locked-hidden");
  } else {
    // Lucchetto chiuso
    lock_icon.innerHTML = `
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    `;
    lock_btn.title = "Sblocca modifiche";
    lock_btn.style.color = "#fc8181";
    card_create.classList.add("locked-hidden");
  }
}

export function isUnlocked() {
  return unlocked;
}

function setupFilterListeners() {
  const filterMap = {
    "filter-green": "owned",
    "filter-yellow": "to_replace",
    "filter-red": "missing",
  };

  for (const [id, status] of Object.entries(filterMap)) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        if (activeFilters.has(status)) {
          activeFilters.delete(status);
          el.classList.remove("active-filter");
        } else {
          activeFilters.add(status);
          el.classList.add("active-filter");
        }
        applyFilters();
      });
    }
  }
}

function applyFilters() {
  if (activeFilters.size === 0) {
    cardListRender(allCards);
  } else {
    const filtered = allCards.filter((card) => {
      const status = card.status || "owned";
      return activeFilters.has(status);
    });
    cardListRender(filtered);
  }
}

export async function cardListInit() {
  try {
    const response = await fetch(`${BASE_URL}/api/card/list`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.cards && Array.isArray(data.cards)) {
      allCards = data.cards;
      cardListRender(allCards);
      updateStatusCounters(allCards);
      await updateTotalPrice();
    } else {
      console.error("Formato dati non valido:", data);
      card_list.innerHTML = "<p>Errore nel caricamento delle carte</p>";
    }
  } catch (err) {
    console.error("Errore nel caricamento delle carte:", err);
    card_list.innerHTML =
      "<p>Impossibile caricare le carte. Verifica che il server sia attivo.</p>";
  }
}

function updateStatusCounters(cards) {
  const greenCount = cards.filter(
    (c) => !c.status || c.status === "owned",
  ).length;
  const yellowCount = cards.filter((c) => c.status === "to_replace").length;
  const redCount = cards.filter((c) => c.status === "missing").length;

  const countGreen = document.getElementById("count-green");
  const countYellow = document.getElementById("count-yellow");
  const countRed = document.getElementById("count-red");

  if (countGreen) countGreen.textContent = greenCount;
  if (countYellow) countYellow.textContent = yellowCount;
  if (countRed) countRed.textContent = redCount;
}

function cardListRender(cards) {
  card_list.innerHTML = "";

  if (cards.length === 0) {
    card_list.innerHTML = "<p>Nessuna carta trovata</p>";
    return;
  }

  for (const card of cards) {
    const container = document.createElement("div");
    container.className = "card-element";

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "card-image-wrapper";

    const imageContainer = document.createElement("div");
    imageContainer.className = "card-image-container";

    if (
      card["image_url"] &&
      card["image_url"].trim() !== "" &&
      card["image_url"].startsWith("http")
    ) {
      const image = document.createElement("img");

      if (card["image_url"].includes("cardmarket.com")) {
        image.src = `https://corsproxy.io/?${encodeURIComponent(card["image_url"])}`;
      } else {
        image.src = card["image_url"];
      }

      image.alt = card["name"] || "Carta";
      image.className = "card-image";

      image.onerror = function () {
        imageContainer.innerHTML =
          "<div class='no-image'>Immagine non disponibile</div>";
      };

      imageContainer.appendChild(image);
    } else {
      imageContainer.innerHTML = "<div class='no-image'>Nessuna immagine</div>";
    }

    const cardStatus = card["status"] || "owned";
    const statusDot = document.createElement("span");
    statusDot.className = `card-status-dot ${cardStatus}`;
    const statusTitles = {
      owned: "Presente",
      to_replace: "Da cambiare",
      missing: "Mancante",
    };
    statusDot.title = statusTitles[cardStatus] || "Presente";

    imageWrapper.appendChild(imageContainer);
    imageWrapper.appendChild(statusDot);

    const content = document.createElement("div");
    content.className = "card-content";

    const titleContainer = document.createElement("div");
    titleContainer.className = "card-title-container";

    const name = document.createElement("h1");
    name.innerText = card["name"] || "Nome non disponibile";
    titleContainer.appendChild(name);

    const detailsContainer = document.createElement("div");
    detailsContainer.className = "card-details-container";

    const code = document.createElement("div");
    code.className = "card-element-field";
    code.innerHTML = "<p>CODICE</p><b>" + (card["code"] || "N/A") + "</b>";

    const rarity = document.createElement("div");
    rarity.className = "card-element-field";
    const rarityText = card["rarity"] || "N/A";
    if (rarityText.length > 20) rarity.classList.add("long-rarity");
    rarity.innerHTML = "<p>Rarità:</p><b>" + rarityText + "</b>";

    const condition = document.createElement("div");
    condition.className = "card-element-field";
    condition.innerHTML =
      "<p>Condizione:</p><b>" + (card["condition"] || "N/A") + "</b>";

    const lang = document.createElement("div");
    lang.className = "card-element-field";
    lang.innerHTML = "<p>Lingua:</p><b>" + (card["lang"] || "N/A") + "</b>";

    const price = document.createElement("div");
    price.className = "card-element-field";
    const priceValue = parseFloat(card["price"]) || 0;
    price.innerHTML = "<p>Prezzo:</p><b>" + priceValue.toFixed(2) + " €</b>";

    detailsContainer.appendChild(code);
    detailsContainer.appendChild(rarity);
    detailsContainer.appendChild(condition);
    detailsContainer.appendChild(lang);
    detailsContainer.appendChild(price);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className =
      "card-buttons" + (unlocked ? "" : " locked-hidden");

    const btn_update = document.createElement("button");
    btn_update.className = "btn-update";
    btn_update.innerText = "Aggiorna";
    btn_update.onclick = () => openCardUpdateModal(card);

    const btn_delete = document.createElement("button");
    btn_delete.className = "btn-delete";
    btn_delete.innerText = "Rimuovi";
    btn_delete.onclick = () => openCardDeleteModal(card);

    buttonsContainer.appendChild(btn_update);
    buttonsContainer.appendChild(btn_delete);
    detailsContainer.appendChild(buttonsContainer);

    content.appendChild(titleContainer);
    content.appendChild(detailsContainer);

    container.appendChild(imageWrapper);
    container.appendChild(content);
    card_list.appendChild(container);
  }
}

function cardCreateModal() {
  if (!unlocked) return;
  openCardCreateModal();
}

export function closeAllModals() {
  const modalArea = document.getElementById("modal-area");
  const allModals = document.querySelectorAll(".modal");
  modalArea.classList.add("hidden");
  allModals.forEach((modal) => modal.classList.add("hidden"));
}

async function fetchTotalPrice() {
  try {
    const response = await fetch(`${BASE_URL}/api/card/total`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return parseFloat(data.total_price) || 0;
  } catch (error) {
    console.error("Errore nel recupero del prezzo totale:", error);
    return 0;
  }
}

export async function updateTotalPrice() {
  const total = await fetchTotalPrice();
  const totalElement = document.getElementById("total-price");
  if (totalElement) {
    totalElement.textContent = `PREZZO COLLEZIONE ${total.toFixed(2)} €`;
  }
}
