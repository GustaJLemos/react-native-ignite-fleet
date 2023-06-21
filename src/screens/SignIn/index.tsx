import { useState, useEffect } from 'react';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { Container, Title, Slogan } from "./styles";

import backgroundImg from '../../assets/background.png';
import { Button } from "../../components/Button";

import { ANDROID_CLIENT_ID, IOS_CLIENT_ID } from '@env';
import { Alert } from 'react-native';

// vai cuidar do navegador que vai abrir pra gente fazer a autenticação
WebBrowser.maybeCompleteAuthSession();

export function SignIn() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // primeiro parâmetro dessa const é a requisição em si, e n interessa pra gente
  // segunda é a resposta da requisição
  // terceira é o método de autenticação que iremos usar

  // no nosso gcp a gente já autorizou o nosso app pra acessar o scope
  const [_, response, googleSignIn] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    scopes: ['profile', 'email']
  })

  function handleGoogleSignIn() {
    setIsAuthenticating(true);

    googleSignIn().then((response) => {
      if (response?.type !== 'success') {
        setIsAuthenticating(false);
      }
    })
  }

  useEffect(() => {
    if (response?.type === 'success') {
      if (response.authentication?.idToken) {
        console.log('TOKEN DE AUTENTICAÇÃO =>', response.authentication?.idToken)
        // EndPoint batendo na google, para buscar as informações do usuário.
        // É assim q fazemos para obter o idToken do usuário do lado do nosso app, porém vamos fazer essa parte, no nosso mongoDb Atlas (justamente para n precisarmos fazer isso no app)
        fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${response.authentication.idToken}`).then(response => response.json()).then(console.log);
      } else {
        setIsAuthenticating(false);
        Alert.alert('Entrar', 'Não foi possível conectar-se a sua conta Google.')
      }
    }
  }, [response]);

  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>
      <Slogan>Gestão de uso de veículos</Slogan>
      <Button
        title="Entrar com google"
        onPress={handleGoogleSignIn}
        isLoading={isAuthenticating}
      />
    </Container>
  );
}