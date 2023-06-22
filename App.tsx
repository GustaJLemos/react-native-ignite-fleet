import { ThemeProvider } from 'styled-components';
import { SignIn } from './src/screens/SignIn';
import theme from './src/theme';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Loading } from './src/components/Loading';
import { StatusBar } from 'react-native';

import { AppProvider, UserProvider } from '@realm/react'
import { REAL_APP_ID } from '@env';
import { Home } from './src/screens/Home';

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  if (!fontsLoaded) {
    return (
      <Loading />
    );
  }

  return (
    <AppProvider id={REAL_APP_ID}>
      <ThemeProvider theme={theme}>
        <StatusBar
          barStyle='light-content'
          backgroundColor='transparent'
          translucent
        />
        {/* UserProvider vai ser responsável pela parte de autenticação mesmo */}
        {/* O fallback basicamente fala se não tiver nenhum usuário autenticado, então a gente chama esse método (componente SignIn) para autenticar */}
        <UserProvider fallback={<SignIn />}>
          {/* Se o usuário já estiver autenticado ele renderiza esse cara dentro do UserProvider */}
          <Home />
          {/* Ou seja, oq vai rolar aq? se o usuário não estiver autenticado ele vai ser levado pra nossa fallback, e vai ser levado pra nossa tela de login, e se 
          o usuário já estiver autenticado vai ser levado para o nossa home */}
        </UserProvider>
      </ThemeProvider>
    </AppProvider>
  );
}


