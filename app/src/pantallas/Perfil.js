import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import avisar from '../avisar';

export default function Perfil() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ganados, setGanados] = useState(0);
  const [perdidos, setPerdidos] = useState(0);
  const [trofeos, setTrofeos] = useState(0);
  const [equipoCampeon, setEquipoCampeon] = useState([]);
  const [cargando, setCargando] = useState(true);

  const uid = auth.currentUser.uid; // aquí siempre hay sesión
  const ref = doc(db, 'usuarios', uid);

  useEffect(() => {
    const traer = async () => {
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setNombre(d.nombre || '');
          setFecha(d.fecha || '');
          setTelefono(d.telefono || '');
          setGanados(d.ganados || 0);
          setPerdidos(d.perdidos || 0);
          setTrofeos(d.trofeos || 0);
          setEquipoCampeon(d.equipoCampeon || []);
        }
      } catch (error) {
        avisar('Error al cargar', error.message);
      }
      setCargando(false);
    };
    traer();

    // Las estadísticas se actualizan en vivo mientras juegas en la otra pestaña
    const dejarDeEscuchar = onSnapshot(ref, (snap) => {
      const d = snap.data() || {};
      setGanados(d.ganados || 0);
      setPerdidos(d.perdidos || 0);
      setTrofeos(d.trofeos || 0);
      setEquipoCampeon(d.equipoCampeon || []);
    });
    return dejarDeEscuchar;
  }, []);

  const guardar = async () => {
    try {
      await updateDoc(ref, { nombre, fecha, telefono });
      avisar('Listo', 'Datos actualizados');
    } catch (error) {
      avisar('Error al actualizar', error.message);
    }
  };

  if (cargando) return <Text style={{ marginTop: 50, textAlign: 'center' }}>Cargando...</Text>;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mi perfil</Text>
      <Text style={{ marginBottom: 6 }}>{auth.currentUser.email}</Text>
      <Text style={styles.stats}>Torneos ganados: {ganados} | Perdidos: {perdidos}</Text>
      <Text style={styles.stats}>Trofeos: {trofeos ? '🏆'.repeat(Math.min(trofeos, 10)) + ` (${trofeos})` : '0'}</Text>
      <Text style={styles.equipo}>
        Último equipo campeón: {equipoCampeon.length ? equipoCampeon.join(', ') : 'todavía ninguno'}
      </Text>
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Fecha (AAAA-MM-DD)" value={fecha} onChangeText={setFecha} />
      <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono}
        keyboardType="phone-pad" />
      <Button title="Guardar cambios" color="#f28c00" onPress={guardar} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 20, backgroundColor: '#fff8ec' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  equipo: { marginBottom: 16, color: '#333' },
  stats: { marginBottom: 6, fontWeight: 'bold', color: '#c25e00' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 10, backgroundColor: '#fff' },
});
