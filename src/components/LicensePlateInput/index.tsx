import React, { forwardRef } from 'react';
import { Container, Input, Label } from './styles';
import { useTheme } from 'styled-components';
import { TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label: string;
}

export const LicensePlateInput = forwardRef<TextInput, Props>(({ label, ...rest }, ref) => {
  const theme = useTheme();

  return (
    <Container>
      <Label>
        {label}
      </Label>

      <Input
        ref={ref}
        maxLength={7}
        autoCapitalize='characters'
        placeholderTextColor={theme?.COLORS.GRAY_400}
        {...rest}
      />
    </Container>
  );
});