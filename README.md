# 🐉 Dragon Ball App: React Native + Firebase

Actividad individual "API con Firebase" (guía versión 2).
**API asignada:** Dragon Ball API → https://dragonball-api.com

| Pestaña | Qué hace |
|---|---|
| Login / Registro | Firebase Authentication (correo y contraseña). El registro guarda nombre, correo, fecha, teléfono, ganados y perdidos en `usuarios/{uid}` de Firestore. |
| Inicio | Lista de personajes de la Dragon Ball API (imagen, raza, ki, afiliación) con buscador, usando `FlatList`. |
| Torneo 🏆 | **Función original: Torneo de las Artes Marciales.** Eliges 3 guerreros entre 8 al azar y compites en Cuartos, Semifinal y Gran Final contra equipos rivales. Cada ronda son 3 duelos; la probabilidad de ganar sale del ki máximo de cada guerrero (`src/ki.js` convierte textos como "90 Septillion" en un poder). Si ganas la final recibes un trofeo. Se guardan en Firestore `trofeos`, `ganados`/`perdidos` (`increment`), `equipoCampeon` y cada torneo en `resultados` (`addDoc`). |
| Perfil | Lee y edita los datos del usuario con `getDoc` / `updateDoc` y muestra en vivo (`onSnapshot`) torneos ganados y perdidos, trofeos y el último equipo campeón. |
| Salir | Cierra sesión con `signOut`. |

## Ejecutar

```bash
cd app
npm install
npx expo start --web      # en el navegador
npx expo start --tunnel   # en el celular con Expo Go
```
