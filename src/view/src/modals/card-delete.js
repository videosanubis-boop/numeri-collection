import { cardListInit, updateTotalPrice, closeAllModals } from "../script.js";
import { BASE_URL } from "../config.js";

const modal_area = document.getElementById("modal-area");
const modal = document.getElementById("modal-card-delete");
const confirm = document.getElementById("card-delete-confirm");
const cancel = document.getElementById("card-delete-cancel");

let controller;

export function openCardDeleteModal(card) {
  modal_area.classList.remove("hidden");
  modal.classList.remove("hidden");

  controller = new AbortController();
  const { signal } = controller;

  confirm.addEventListener("click", () => cardDelete(card["id"]), { signal });
  cancel.addEventListener("click", () => close(), { signal });
}

async function cardDelete(id) {
  try {
    const response = await fetch(`${BASE_URL}/api/card/delete/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await cardListInit();
      await updateTotalPrice();
      close();
    } else {
      console.error("Errore nell'eliminazione della carta:", response.status);
      alert("Errore nell'eliminazione della carta");
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
