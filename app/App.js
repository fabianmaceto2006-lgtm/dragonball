import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

import Login from './src/pantallas/Login';
import Registro from './src/pantallas/Registro';
import Home from './src/pantallas/Home';
import Juego from './src/pantallas/Juego';
import Perfil from './src/pantallas/Perfil';
import Salir from './src/pantallas/Salir';

const Tab = createBottomTabNavigator();

const iconos = { Inicio: '🐉', Juego: '🏆', Perfil: '👤', Salir: '🚪', Login: '🔑', Registro: '📝' };

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Firebase avisa cada vez que alguien entra o sale
  useEffect(() => {
    const dejarDeEscuchar = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return dejarDeEscuchar;
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f28c00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#f28c00',
          headerStyle: { backgroundColor: '#f28c00' },
          headerTintColor: '#fff',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{iconos[route.name]}</Text>,
        })}
      >
        {usuario ? (
          <>
            <Tab.Screen name="Inicio" component={Home} options={{ title: 'Guerreros Z' }} />
            <Tab.Screen name="Juego" component={Juego} options={{ title: 'Torneo' }} />
            <Tab.Screen name="Perfil" component={Perfil} />
            <Tab.Screen name="Salir" component={Salir} />
          </>
        ) : (
          <>
            <Tab.Screen name="Login" component={Login} />
            <Tab.Screen name="Registro" component={Registro} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
