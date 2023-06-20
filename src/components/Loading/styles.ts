import styled from 'styled-components/native';
import theme from '../../theme';

// chamamos o nosso theme "na mão" pq provavelmente esse nosso componente vai ser chamado
// antes mesmo de nosso ThemeProvider ser criado
export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;

  background-color: ${theme.COLORS.GRAY_800};
`;

export const LoadIndicator = styled.ActivityIndicator.attrs(() => ({
  color: theme.COLORS.BRAND_LIGHT
}))``;