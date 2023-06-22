import React from 'react';
import { Power } from 'phosphor-react-native';
import { TouchableOpacity } from 'react-native';
import { Container, Greeting, Message, Name, Picture } from './styles';
import { useUser, useApp } from '@realm/react';
import theme from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function HomeHeader() {
  const user = useUser();
  const app = useApp();
  const insets = useSafeAreaInsets();

  // 32 pq é o espaçamento do padding no protótipo
  // usamos esse insets pq ele sabe exatamente qual área da nossa tela é segura, ai a gente pega a nossa área segura e adiciona 32
  const paddingTop = insets.top + 32;

  function handleLogout() {
    app.currentUser?.logOut();
  }

  return (
    <Container style={{ paddingTop }}>
      <Picture
        source={{ uri: user?.profile.pictureUrl }}
      // vai aparecer o placeholder enquando a imagem está carregando
      // placeholder="L05q|wfRF}s:00j[w[WCxakCRPjZ"
      />

      <Greeting>
        <Message>
          Olá
        </Message>

        <Name numberOfLines={1}>
          {user?.profile.name}
        </Name>
      </Greeting>

      <TouchableOpacity activeOpacity={0.7} onPress={handleLogout}>
        <Power size={32} color={theme.COLORS.GRAY_400} />
      </TouchableOpacity>
    </Container>
  );
}