import React, { useEffect, useRef, useState } from 'react';
import { TextInput, ScrollView, Alert } from 'react-native';
import { Container, Content, Message } from './styles';
import { Header } from '../../components/Header';
import { LicensePlateInput } from '../../components/LicensePlateInput';
import { TextAreaInput } from '../../components/TextAreaInput';
import { Button } from '../../components/Button';
import { licensePlateValidate } from '../../utils/licensePlateValidate';
import { getAddressLocation } from '../../utils/getAddressLocation';
import { useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';
import { useUser } from '@realm/react';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { LocationAccuracy, useForegroundPermissions, watchPositionAsync, LocationSubscription } from 'expo-location';
import { Loading } from '../../components/Loading';
import { LocationInfo } from '../../components/LocationInfo';
import { Car } from 'phosphor-react-native';

export function Departure() {
  const [licensePlate, setLicensePlate] = useState('');
  const [description, setDescription] = useState('');
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const [locationForegroundPermission, requestLocationForegroundPermission] = useForegroundPermissions();

  const licensePlateRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  const realm = useRealm();
  const user = useUser();
  const { goBack } = useNavigation();

  function handleDepartureRegister() {
    try {
      if (!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus();
        return Alert.alert('Placa inválida', 'A placa é inválida. Por favor, informe a placa correta do veículo.');
      }

      if (description.trim().length === 0) {
        descriptionRef.current?.focus();
        return Alert.alert('Finalidade', 'Por favor, informe a finalidade da utilização do veículo');
      }

      setIsRegistering(true);

      // write é baseado em transações, tudo q a gente quiser fazer de alteração e etc, fazemos no write, pq se der merda em algum lugar, ele reseta tudo
      // qualquer operação diferente de ler o banco, a gente usa write
      realm.write(() => {
        realm.create('Historic', Historic.generate({
          user_id: user!.id,
          description,
          license_plate: licensePlate.toUpperCase()
        }));
      });

      Alert.alert('Saída', 'Saída do veículo registrada com sucesso!');

      goBack();
    } catch (err) {
      console.log(err)
      Alert.alert('Erro', 'Não foi possível registrar a saída do veículo')
      setIsRegistering(false);
    }
  }

  useEffect(() => {
    requestLocationForegroundPermission();
  }, [])

  useEffect(() => {
    if (!locationForegroundPermission?.granted) {
      return;
    }
    let subscription: LocationSubscription;

    // "Escuta" a posição do usuário e avisa quando ela muda, se não mudar, ela não avisa para mim
    watchPositionAsync({
      accuracy: LocationAccuracy.High,
      timeInterval: 1000
    }, (location) => {
      getAddressLocation(location.coords)
        .then((address) => {
          console.log(address)
          if (address) {
            setCurrentAddress(address);
          }
        })
        .finally(() => setIsLoadingLocation(false))
    }).then((response) => subscription = response);

    return () => {
      if (subscription) {
        subscription.remove();
      }
    }
  }, [locationForegroundPermission])

  if (!locationForegroundPermission?.granted) {
    return (
      <Container>
        <Header title='Saída' />
        <Message>
          Você precisa permitir que o aplicativo tenha acesso a localização para utilizar essa funcionalidade.
          Por favor, acesse as configurações do seu dispositivo para conceder essa permissão ao aplicativo.
        </Message>
      </Container>
    )
  }

  if (isLoadingLocation) {
    return (
      <Loading />
    )
  }

  return (
    <Container>
      <Header title='Saída' />

      <KeyboardAwareScrollView extraHeight={100}>
        <ScrollView>
          <Content>
            {
              currentAddress &&
              <LocationInfo
                label='Localização atual'
                description={currentAddress}
                icon={Car}
              />
            }

            <LicensePlateInput
              ref={licensePlateRef}
              label='Placa do veículo'
              placeholder='BRA1234'
              onSubmitEditing={() => descriptionRef.current?.focus()}
              returnKeyType='next'
              onChangeText={setLicensePlate}
            />

            <TextAreaInput
              ref={descriptionRef}
              label='Finalidade'
              placeholder='Vou utilizar o veículo para...'
              onSubmitEditing={handleDepartureRegister}
              returnKeyType='send'
              blurOnSubmit
              onChangeText={setDescription}
            />

            <Button
              title='Registrar saída'
              onPress={handleDepartureRegister}
              isLoading={isRegistering}
            />
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>
    </Container>
  );
}