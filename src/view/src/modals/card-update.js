import { cardListInit, updateTotalPrice, closeAllModals } from "../script.js";
import { openCardSwapModal } from "./card-swap.js";
import { BASE_URL } from "../config.js";

const modal_area = document.getElementById("modal-area");
const modal = document.getElementById("modal-card-update");
const select_rarity = document.getElementById("card-update-select-rarity");
const select_condition = document.getElementById(
  "card-update-select-condition",
);
const input_name = document.getElementById("card-update-input-name");
const input_code = document.getElementById("card-update-input-code");
const input_lang = document.getElementById("card-update-input-lang");
const input_price = document.getElementById("card-update-input-price");
const input_image = document.getElementById("card-update-input-image");
const input_order = document.getElementById("card-update-input-order");
const select_status = document.getElementById("card-update-select-status");
const confirm = document.getElementById("card-update-confirm");
const cancel = document.getElementById("card-update-cancel");

let controller;
let currentCard = null;

export function openCardUpdateModal(card) {
  modal_area.classList.remove("hidden");
  modal.classList.remove("hidden");

  controller = new AbortController();
  const { signal } = controller;

  currentCard = card;

  confirm.addEventListener("click", () => cardUpdate(), { signal });
  cancel.addEventListener("click", () => close(), { signal });

  init(card);
}

function init(card) {
  raritiesInit(card);
  conditionsInit(card);
  input_name.value = card["name"];
  input_code.value = card["code"] || "";
  input_lang.value = card["lang"];
  input_price.value = card["price"];
  input_image.value = card["image_url"] || "";
  input_order.value = card["order"];
  if (select_status) select_status.value = card["status"] || "owned";
}

async function raritiesInit(card) {
  try {
    const response = await fetch(`${BASE_URL}/api/values/list/rarities`);
    const data = await response.json();
    raritiesRender(data["rarities"], card["rarity"]);
  } catch (err) {
    console.error("Errore caricamento rarità:", err);
  }
}

function raritiesRender(rarities, default_rarity) {
  select_rarity.innerHTML = "";
  for (const rarity of rarities) {
    const option = document.createElement("option");
    option.value = rarity;
    option.innerText = rarity;
    if (rarity === default_rarity) option.selected = true;
    select_rarity.appendChild(option);
  }
}

async function conditionsInit(card) {
  try {
    const response = await fetch(`${BASE_URL}/api/values/list/conditions`);
    const data = await response.json();
    conditionsRender(data["conditions"], card["condition"]);
  } catch (err) {
    console.error("Errore caricamento condizioni:", err);
  }
}

function conditionsRender(conditions, default_condition) {
  select_condition.innerHTML = "";
  for (const condition of conditions) {
    const option = document.createElement("option");
    option.value = condition;
    option.innerText = condition;
    if (condition === default_condition) option.selected = true;
    select_condition.appendChild(option);
  }
}

async function cardUpdate(confirmed = false) {
  const new_name = input_name.value;
  const new_code = input_code.value;
  const new_rarity = select_rarity.value;
  const new_condition = select_condition.value;
  const new_lang = input_lang.value;
  const new_price = parseFloat(input_price.value);
  const new_image_url = input_image.value;
  const new_order = parseInt(input_order.value);
  const new_status = select_status ? select_status.value : null;

  if (!new_name || new_name.trim() === "") {
    alert("Inserisci un nome per la carta");
    return;
  }
  if (!new_rarity || new_rarity === "-") {
    alert("Seleziona una rarità valida");
    return;
  }
  if (!new_condition || new_condition === "-") {
    alert("Seleziona una condizione valida");
    return;
  }
  if (isNaN(new_price) || new_price <= 0) {
    alert("Inserisci un prezzo valido");
    return;
  }

  // Se order è cambiato, nascondi questo modal e apri lo swap
  if (new_order !== currentCard["order"] && !confirmed) {
    modal.classList.add("hidden");
    openCardSwapModal(
      "",
      () => {
        cardUpdate(true);
      },
      () => {
        modal.classList.remove("hidden");
      },
    );
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/card/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id: currentCard["id"],
        new_name,
        new_code,
        new_rarity,
        new_condition,
        new_lang,
        new_price,
        new_image_url,
        new_status,
        new_order,
      }),
    });

    if (response.ok) {
      await cardListInit();
      await updateTotalPrice();
      close();
    } else {
      console.error("Errore nell'aggiornamento della carta:", response.status);
      alert("Errore nell'aggiornamento della carta");
    }
  } catch (err) {
    console.error("Errore:", err);
    alert("Errore di connessione al server");
  }
}

function close() {
  closeAllModals();
  if (controller) controller.abort();
  currentCard = null;
}
