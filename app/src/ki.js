// src/ki.js: convierte el texto de ki de la API ("60.000.000", "90 Septillion", "500 Googolplex")
// en un "poder" numérico usable para las peleas (escala logarítmica, así no todo es tan desigual).
const UNIDADES = {
  thousand: 3, million: 6, billion: 9, trillion: 12, quadrillion: 15, quintillion: 18,
  sextillion: 21, septillion: 24, octillion: 27, nonillion: 30, decillion: 33,
  googol: 100, googolplex: 120,
};

export function poderDeKi(texto) {
  if (!texto) return 1;
  const t = String(texto).toLowerCase().trim();
  if (t.includes('infinit')) return 130;
  const unidad = Object.keys(UNIDADES).sort((a, b) => b.length - a.length).find((u) => t.includes(u));
  const numTexto = t.replace(/[^0-9.,]/g, '');
  let n = unidad
    ? parseFloat(numTexto.replace(',', '.'))      // "11.7 Septillion" → 11.7
    : parseFloat(numTexto.replace(/[.,]/g, ''));  // "60.000.000" → 60000000
  if (!n || isNaN(n)) n = 1;
  const exponente = unidad ? UNIDADES[unidad] : 0;
  return Math.max(1, Math.log10(n) + exponente); // ej: Goku ≈ 26, Krilin ≈ 6
}
