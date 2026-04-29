import { cardListInit, updateTotalPrice, closeAllModals } from "../script.js";

const modal_area = document.getElementById("modal-area");
const modal = document.getElementById("modal-card-swap");
const message = document.getElementById("swap-message");
const confirm = document.getElementById("card-swap-confirm");
const cancel = document.getElementById("card-swap-cancel");

let controller;
let swapCallback = null;
let cancelCallback = null;

export function openCardSwapModal(
  existingCardName,
  onConfirm,
  onCancel = null,
) {
  modal_area.classList.remove("hidden");
  modal.classList.remove("hidden");

  controller = new AbortController();
  const { signal } = controller;

  message.innerText = "Sicuro di voler scambiare queste due carte?";

  swapCallback = onConfirm;
  cancelCallback = onCancel;

  confirm.addEventListener("click", () => handleConfirm(), { signal });
  cancel.addEventListener("click", () => handleCancel(), { signal });
}

function handleConfirm() {
  if (swapCallback) swapCallback();
  close();
}

function handleCancel() {
  // Chiudi solo il modal swap, NON il modal-area
  modal.classList.add("hidden");
  if (controller) controller.abort();
  const cb = cancelCallback;
  swapCallback = null;
  cancelCallback = null;
  // Riapre il modal di aggiornamento
  if (cb) cb();
}

function close() {
  // Chiudi tutto (usato solo dopo conferma)
  modal.classList.add("hidden");
  modal_area.classList.add("hidden");
  if (controller) controller.abort();
  swapCallback = null;
  cancelCallback = null;
}
