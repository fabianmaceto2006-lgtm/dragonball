// Función original: "Torneo de las Artes Marciales" 🏆
// 1. Eliges 3 guerreros de la Dragon Ball API para tu equipo.
// 2. Compites en 3 rondas (Cuartos, Semifinal y Final) contra equipos al azar.
//    Cada ronda son 3 duelos; la probabilidad de ganar un duelo depende del ki máximo de cada guerrero.
// 3. Si ganas la final te llevas un trofeo. Todo queda guardado en Firestore.
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { doc, getDoc, updateDoc, addDoc, collection, increment } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { traerPersonajes } from '../api';
import { poderDeKi } from '../ki';

const RONDAS = ['Cuartos de final', 'Semifinal', 'Gran Final'];
const TAMANO_EQUIPO = 3;
const ATAQUES = ['Kamehameha', 'Final Flash', 'Makankosappo', 'Big Bang Attack', 'Kienzan', 'Galick Ho',
  'Puño del Dragón', 'Genkidama', 'Masenko', 'Death Beam', 'Kaioken x10', 'Tri-Beam'];

const mezclar = (arr) => {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};
const alAzar = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function Juego() {
  const [personajes, setPersonajes] = useState([]);
  const [fase, setFase] = useState('elegir'); // 'elegir' | 'torneo' | 'fin'
  const [candidatos, setCandidatos] = useState([]);
  const [equipo, setEquipo] = useState([]);
  const [ronda, setRonda] = useState(0);
  const [rival, setRival] = useState([]);
  const [duelos, setDuelos] = useState(null); // resultado de la ronda actual
  const [campeon, setCampeon] = useState(false);
  const [trofeos, setTrofeos] = useState(0);

  const uid = auth.currentUser.uid;
  const refUsuario = doc(db, 'usuarios', uid);

  useEffect(() => {
    const iniciar = async () => {
      const snap = await getDoc(refUsuario);
      if (snap.exists()) setTrofeos(snap.data().trofeos || 0);
      const lista = (await traerPersonajes()).map((p) => ({ ...p, poder: poderDeKi(p.maxKi || p.ki) }));
      setPersonajes(lista);
      nuevoTorneo(lista);
    };
    iniciar();
  }, []);

  const nuevoTorneo = (lista = personajes) => {
    setCandidatos(mezclar(lista).slice(0, 8)); // 8 guerreros para escoger
    setEquipo([]);
    setRonda(0);
    setDuelos(null);
    setCampeon(false);
    setFase('elegir');
  };

  const alternarGuerrero = (g) => {
    if (equipo.find((e) => e.id === g.id)) setEquipo(equipo.filter((e) => e.id !== g.id));
    else if (equipo.length < TAMANO_EQUIPO) setEquipo([...equipo, g]);
  };

  const rivalNuevo = (miEquipo = equipo) => {
    const libres = personajes.filter((p) => !miEquipo.find((e) => e.id === p.id));
    setRival(mezclar(libres).slice(0, TAMANO_EQUIPO));
    setDuelos(null);
  };

  const comenzar = () => {
    setFase('torneo');
    rivalNuevo(equipo);
  };

  // Un duelo: gana con probabilidad proporcional a su poder (los débiles también pueden sorprender)
  const pelear = () => {
    const resultados = equipo.map((mio, i) => {
      const otro = rival[i];
      const prob = mio.poder / (mio.poder + otro.poder);
      const gano = Math.random() < prob;
      const ganador = gano ? mio : otro;
      return { mio, otro, gano, prob, ataque: alAzar(ATAQUES), ganador: ganador.name };
    });
    const victorias = resultados.filter((r) => r.gano).length;
    setDuelos({ resultados, gano: victorias >= 2, victorias });
  };

  const terminarTorneo = async (esCampeon, rondaAlcanzada) => {
    setCampeon(esCampeon);
    setFase('fin');
    if (esCampeon) setTrofeos(trofeos + 1);
    await updateDoc(refUsuario, {
      ...(esCampeon ? { ganados: increment(1), trofeos: increment(1), equipoCampeon: equipo.map((g) => g.name) }
        : { perdidos: increment(1) }),
    });
    await addDoc(collection(db, 'resultados'), {
      uid, equipo: equipo.map((g) => g.name), rondaAlcanzada, campeon: esCampeon, gano: esCampeon,
      fecha: new Date().toISOString(),
    });
  };

  const continuar = () => {
    if (!duelos.gano) return terminarTorneo(false, RONDAS[ronda]);
    if (ronda === RONDAS.length - 1) return terminarTorneo(true, RONDAS[ronda]);
    setRonda(ronda + 1);
    rivalNuevo();
  };

  if (!personajes.length) return <ActivityIndicator size="large" color="#f28c00" style={{ marginTop: 50 }} />;

  // ---------- 1. Elegir equipo ----------
  if (fase === 'elegir') {
    return (
      <ScrollView contentContainerStyle={styles.contenedor}>
        <Text style={styles.titulo}>🏟️ Torneo de las Artes Marciales</Text>
        <Text style={styles.sub}>Trofeos: {'🏆'.repeat(Math.min(trofeos, 10)) || '0'}</Text>
        <Text style={styles.sub}>Elige {TAMANO_EQUIPO} guerreros para tu equipo ({equipo.length}/{TAMANO_EQUIPO})</Text>
        <View style={styles.grilla}>
          {candidatos.map((g) => {
            const elegido = equipo.find((e) => e.id === g.id);
            return (
              <TouchableOpacity key={g.id} onPress={() => alternarGuerrero(g)}
                style={[styles.carta, elegido && styles.cartaElegida]}>
                <Image source={{ uri: g.image }} style={styles.imgCarta} />
                <Text style={styles.nombre}>{g.name}</Text>
                <Text style={styles.dato}>Ki máx: {g.maxKi}</Text>
                <Text style={styles.poder}>Poder {g.poder.toFixed(0)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={[styles.boton, equipo.length < TAMANO_EQUIPO && styles.botonOff]}
          disabled={equipo.length < TAMANO_EQUIPO} onPress={comenzar}>
          <Text style={styles.textoBoton}>¡Comenzar torneo!</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nuevoTorneo()} style={{ marginTop: 10 }}>
          <Text style={{ color: '#2563eb' }}>🔄 Ver otros guerreros</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ---------- 3. Fin del torneo ----------
  if (fase === 'fin') {
    return (
      <ScrollView contentContainerStyle={styles.contenedor}>
        <Text style={{ fontSize: 80 }}>{campeon ? '🏆' : '💥'}</Text>
        <Text style={styles.titulo}>{campeon ? '¡Campeones del torneo!' : `Eliminados en ${RONDAS[ronda]}`}</Text>
        <Text style={styles.sub}>Tu equipo: {equipo.map((g) => g.name).join(', ')}</Text>
        <Text style={styles.sub}>Trofeos totales: {trofeos}</Text>
        <TouchableOpacity style={styles.boton} onPress={() => nuevoTorneo()}>
          <Text style={styles.textoBoton}>Nuevo torneo</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ---------- 2. Rondas del torneo ----------
  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>{RONDAS[ronda]}</Text>
      <View style={styles.progreso}>
        {RONDAS.map((r, i) => (
          <Text key={r} style={[styles.paso, i < ronda && styles.pasoOk, i === ronda && styles.pasoActual]}>{r}</Text>
        ))}
      </View>

      {equipo.map((mio, i) => {
        const otro = rival[i];
        const r = duelos?.resultados[i];
        return (
          <View key={mio.id} style={styles.duelo}>
            <View style={[styles.lado, r && (r.gano ? styles.ladoGana : styles.ladoPierde)]}>
              <Image source={{ uri: mio.image }} style={styles.imgDuelo} />
              <Text style={styles.nombre}>{mio.name}</Text>
            </View>
            <View style={{ alignItems: 'center', width: 90 }}>
              <Text style={styles.vs}>VS</Text>
              {r && <Text style={styles.ataque}>{r.ganador} usó {r.ataque}</Text>}
              {!r && otro && <Text style={styles.dato}>{Math.round((mio.poder / (mio.poder + otro.poder)) * 100)}% de ganar</Text>}
            </View>
            <View style={[styles.lado, r && (!r.gano ? styles.ladoGana : styles.ladoPierde)]}>
              {otro && <Image source={{ uri: otro.image }} style={styles.imgDuelo} />}
              <Text style={styles.nombre}>{otro?.name}</Text>
            </View>
          </View>
        );
      })}

      {!duelos ? (
        <TouchableOpacity style={styles.boton} onPress={pelear}>
          <Text style={styles.textoBoton}>⚔️ ¡Pelear!</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={duelos.gano ? styles.gano : styles.perdio}>
            {duelos.gano ? `¡Ganaste la ronda ${duelos.victorias}-${3 - duelos.victorias}!` : `Perdiste la ronda ${duelos.victorias}-${3 - duelos.victorias}`}
          </Text>
          <TouchableOpacity style={styles.boton} onPress={continuar}>
            <Text style={styles.textoBoton}>
              {!duelos.gano ? 'Ver resultado' : ronda === RONDAS.length - 1 ? '🏆 Recibir trofeo' : 'Siguiente ronda'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 16, alignItems: 'center', backgroundColor: '#fff8ec', flexGrow: 1 },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  sub: { color: '#555', marginBottom: 6, textAlign: 'center' },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  carta: { width: 140, margin: 5, padding: 8, alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 2, borderColor: '#eee' },
  cartaElegida: { borderColor: '#f28c00', backgroundColor: '#ffe2b3' },
  imgCarta: { width: 90, height: 120, resizeMode: 'contain' },
  nombre: { fontWeight: 'bold', textAlign: 'center' },
  dato: { fontSize: 11, color: '#555', textAlign: 'center' },
  poder: { fontSize: 12, color: '#c25e00', fontWeight: 'bold' },
  boton: { marginTop: 14, paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#2563eb', borderRadius: 6 },
  botonOff: { backgroundColor: '#9ab0e0' },
  textoBoton: { color: 'white', fontWeight: 'bold' },
  progreso: { flexDirection: 'row', marginBottom: 10 },
  paso: { fontSize: 11, marginHorizontal: 4, padding: 4, borderRadius: 4, backgroundColor: '#eee', color: '#777' },
  pasoOk: { backgroundColor: '#a6e3a1', color: '#000' },
  pasoActual: { backgroundColor: '#f28c00', color: '#fff' },
  duelo: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, width: '100%', maxWidth: 420, justifyContent: 'space-between' },
  lado: { width: 120, alignItems: 'center', padding: 6, borderRadius: 10, backgroundColor: '#fff' },
  ladoGana: { backgroundColor: '#a6e3a1' },
  ladoPierde: { backgroundColor: '#f5a3a3', opacity: 0.7 },
  imgDuelo: { width: 70, height: 90, resizeMode: 'contain' },
  vs: { fontSize: 22, fontWeight: 'bold', color: '#c00' },
  ataque: { fontSize: 11, textAlign: 'center', color: '#333' },
  gano: { color: 'green', fontSize: 18, marginTop: 8, fontWeight: 'bold' },
  perdio: { color: 'red', fontSize: 18, marginTop: 8, fontWeight: 'bold' },
});
