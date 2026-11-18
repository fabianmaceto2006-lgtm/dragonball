import { useEffect, useState } from 'react';
import { FlatList, Text, View, Image, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { traerPersonajes } from '../api';

export default function Home() {
  const [personajes, setPersonajes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const traer = async () => {
      try {
        setPersonajes(await traerPersonajes());
      } catch (error) {
        console.error('Error al traer personajes:', error);
      }
      setCargando(false);
    };
    traer();
  }, []);

  const filtrados = personajes.filter((p) => p.name.toLowerCase().includes(busqueda.toLowerCase()));

  if (cargando) return <ActivityIndicator size="large" color="#f28c00" style={{ marginTop: 50 }} />;

  // FlatList solo dibuja lo que se ve en pantalla
  return (
    <FlatList
      style={{ backgroundColor: '#fff8ec' }}
      data={filtrados}
      keyExtractor={(p) => String(p.id)}
      numColumns={2}
      contentContainerStyle={{ padding: 8 }}
      ListHeaderComponent={
        <TextInput style={styles.buscador} placeholder="Buscar guerrero..." value={busqueda} onChangeText={setBusqueda} />
      }
      renderItem={({ item }) => (
        <View style={styles.tarjeta}>
          <Image source={{ uri: item.image }} style={styles.imagen} />
          <Text style={styles.nombre}>{item.id} - {item.name}</Text>
          <Text style={styles.dato}>Raza: {item.race}</Text>
          <Text style={styles.dato}>Ki: {item.ki}</Text>
          <Text style={styles.dato}>{item.affiliation}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  buscador: { margin: 4, marginBottom: 8, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, backgroundColor: '#fff' },
  tarjeta: { flex: 1, margin: 4, padding: 10, alignItems: 'center', backgroundColor: '#ffe2b3', borderRadius: 10 },
  imagen: { width: 100, height: 150, resizeMode: 'contain' },
  nombre: { fontWeight: 'bold', marginTop: 6, textAlign: 'center' },
  dato: { fontSize: 12, color: '#555', textAlign: 'center' },
});
