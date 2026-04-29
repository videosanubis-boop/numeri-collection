import { cardListInit, updateTotalPrice, closeAllModals } from "../script.js";
import { BASE_URL } from "../config.js";

const modal_area = document.getElementById("modal-area");
const modal = document.getElementById("modal-card-create");
const select_rarity = document.getElementById("card-create-select-rarity");
const select_condition = document.getElementById(
  "card-create-select-condition",
);
const input_name = document.getElementById("card-create-input-name");
const input_lang = document.getElementById("card-create-input-lang");
const input_price = document.getElementById("card-create-input-price");
const input_code = document.getElementById("card-create-input-code");
const input_image = document.getElementById("card-create-input-image");
const select_status = document.getElementById("card-create-select-status");
const confirm = document.getElementById("card-create-confirm");
const cancel = document.getElementById("card-create-cancel");

let controller;

export function openCardCreateModal() {
  modal_area.classList.remove("hidden");
  modal.classList.remove("hidden");

  controller = new AbortController();
  const { signal } = controller;

  confirm.addEventListener("click", () => cardCreate(), { signal });
  cancel.addEventListener("click", () => close(), { signal });

  init();
}

function init() {
  raritiesInit();
  conditionsInit();
  input_name.value = "";
  input_code.value = "";
  input_lang.value = "IT";
  input_price.value = "";
  input_image.value = "";
  if (select_status) select_status.value = "owned";
}

async function raritiesInit() {
  await fetch(`${BASE_URL}/api/values/list/rarities`)
    .then((res) => res.json())
    .then((data) => raritiesRender(data["rarities"]))
    .catch((err) => console.error(err));
}

function raritiesRender(rarities) {
  select_rarity.innerHTML = "";

  const default_option = document.createElement("option");
  default_option.disabled = true;
  default_option.selected = true;
  default_option.value = "-";
  default_option.innerText = "Seleziona una rarità";
  select_rarity.appendChild(default_option);

  for (const rarity of rarities) {
    const option = document.createElement("option");
    option.value = rarity;
    option.innerText = rarity;
    select_rarity.appendChild(option);
  }
}

async function conditionsInit() {
  await fetch(`${BASE_URL}/api/values/list/conditions`)
    .then((res) => res.json())
    .then((data) => conditionsRender(data["conditions"]))
    .catch((err) => console.error(err));
}

function conditionsRender(conditions) {
  select_condition.innerHTML = "";

  const default_option = document.createElement("option");
  default_option.disabled = true;
  default_option.selected = true;
  default_option.value = "-";
  default_option.innerText = "Seleziona una condizione";
  select_condition.appendChild(default_option);

  for (const condition of conditions) {
    const option = document.createElement("option");
    option.value = condition;
    option.innerText = condition;
    select_condition.appendChild(option);
  }
}

async function cardCreate() {
  const name = input_name.value;
  const code = input_code.value;
  const rarity = select_rarity.value;
  const condition = select_condition.value;
  const lang = input_lang.value;
  const price = parseFloat(input_price.value);
  const image_url = input_image.value;
  const status = select_status ? select_status.value : "owned";

  if (!name || name.trim() === "") {
    alert("Inserisci un nome per la carta");
    return;
  }
  if (rarity === "-") {
    alert("Seleziona una rarità");
    return;
  }
  if (condition === "-") {
    alert("Seleziona una condizione");
    return;
  }
  if (isNaN(price) || price <= 0) {
    alert("Inserisci un prezzo valido");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/card/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        code,
        rarity,
        condition,
        lang,
        price,
        image_url,
        status,
        // order: AUTOMATICO nel backend
      }),
    });

    if (response.ok) {
      await cardListInit();
      await updateTotalPrice();
      close();
    } else {
      console.error("Errore nella creazione della carta:", response.status);
      alert("Errore nella creazione della carta");
    }
  } catch (err) {
    console.error("Errore:", err);
    alert("Errore di connessione al server");
  }
}

function close() {
  closeAllModals();
  if (controller) {
    controller.abort();
  }
}
