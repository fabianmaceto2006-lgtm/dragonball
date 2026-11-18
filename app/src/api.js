// src/api.js: API asignada → Dragon Ball API (https://dragonball-api.com)
export const API_PERSONAJES = 'https://dragonball-api.com/api/characters?limit=100';

export async function traerPersonajes() {
  const res = await fetch(API_PERSONAJES);
  const json = await res.json();
  return json.items; // esta API devuelve los personajes dentro de "items"
}
