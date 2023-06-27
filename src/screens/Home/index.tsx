import React, { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import { Container, Content, Label, Title } from './styles';
import { HomeHeader } from '../../components/HomeHeader';
import { CarStatus } from '../../components/CarStatus';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';
import { HistoricCard, HistoricCardProps } from '../../components/HistoricCard';
import dayjs from 'dayjs';
import { useUser } from '@realm/react';
import { getLastAsyncTimestamp, saveLastSyncTimestamp } from '../../libs/asyncStorage/asyncStorage';
import Toast from 'react-native-toast-message';
import { TopMessage } from '../../components/TopMessage';
import { CloudArrowUp } from 'phosphor-react-native';

export function Home() {
  const [vehicleInUse, setVehicleInUse] = useState<Historic | null>(null);
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>([]);
  const [percentageToSync, setPercentageToSync] = useState<string | null>(null);

  const { navigate } = useNavigation();

  const historic = useQuery(Historic);
  const realm = useRealm();
  const user = useUser();

  function handleRegisterMovement() {
    if (vehicleInUse?._id) {
      navigate('arrival', { id: vehicleInUse?._id.toString() });
    } else {
      navigate('departure');
    }
  }

  function fetchVehicleInUse() {
    try {
      // filtrando pelo status
      const filteredVehicle = historic.filtered("status = 'departure'")[0]
      setVehicleInUse(filteredVehicle);
    } catch (error) {
      Alert.alert('Veículo em uso', 'Não foi possível carregar o veículo em uso.');
      console.log(error);
    }
  }

  async function fetchHistoric() {
    try {
      const response = historic.filtered("status = 'arrival' SORT(created_at DESC)");

      const lastSync = await getLastAsyncTimestamp();

      const formattedHistoric = response.map((item) => {
        return ({
          id: item._id!.toString(),
          licensePlate: item.license_plate,
          isSync: lastSync > item.updated_at!.getTime(),
          created: dayjs(item.created_at).format('[Saída em] DD/MM/YYYY [às] HH:mm')
        })
      })

      setVehicleHistoric(formattedHistoric);

    } catch (error) {
      console.log(error);
      Alert.alert('Histórico', 'Não foi possível carregar o histórico.')
    }
  }

  function handleHistoricDetails(id: string) {
    navigate('arrival', { id })
  }

  // recebe quantos já foi transferido, e quantos ainda precisa
  async function progressNotification(transferred: number, transferable: number) {
    // mostra essas info em bytes
    const percentage = (transferred / transferred) * 100;

    if (percentage === 100) {
      await saveLastSyncTimestamp();
      await fetchHistoric();
      setPercentageToSync(null);

      Toast.show({
        type: 'info',
        text1: 'Todos os dados estão sincronizados'
      })
    }

    if (percentage < 100) {
      setPercentageToSync(`${percentage.toFixed(0)}% sincronizado.`)
    }
  }

  useEffect(() => {
    fetchVehicleInUse();
  }, [])

  useEffect(() => {
    realm.addListener('change', () => fetchVehicleInUse());
    // sempre q implementamos um listener no useEffect, é bom utilizarmos a função de limpeza
    // pra sempre remover esse listener da memória

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener('change', fetchVehicleInUse);
      }
    }
  }, [])

  useEffect(() => {
    fetchHistoric();
  }, [historic])

  // quando estamos utilizando o modelo de sync flexible no realm, precisamos adicionar essa subscription para sincronizar os dados
  useEffect(() => {
    realm.subscriptions.update((mutableSubs, realm) => {
      const historicByUserQuery = realm.objects('Historic').filtered(`user_id = '${user!.id}'`);

      mutableSubs.add(historicByUserQuery, { name: 'historic_by_user' });
    })
  }, [realm])

  // Aqui estamos vendo quantos dados ainda faltam para ser sincronizados
  useEffect(() => {
    const syncSession = realm.syncSession;

    if (!syncSession) {
      return;
    }

    // parametros dessa função
    // 1 direção que queremos obter = quero obter quantos ainda preciso enviar pro back
    // 2 como quero que me reportem essa notificação
    // 3 criamos uma função para receber essa informações
    syncSession.addProgressNotification(
      Realm.ProgressDirection.Upload,
      Realm.ProgressMode.ReportIndefinitely,
      progressNotification
    )

    return () => syncSession.removeProgressNotification(progressNotification);
  }, [])

  return (
    <Container>
      {
        percentageToSync && <TopMessage title={percentageToSync} icon={CloudArrowUp} />
      }

      <HomeHeader />

      <Content>
        <CarStatus
          licensePlate={vehicleInUse?.license_plate}
          onPress={handleRegisterMovement}
        />

        <Title>
          Histórico
        </Title>

        <FlatList
          data={vehicleHistoric}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <HistoricCard
              onPress={() => handleHistoricDetails(item.id)}
              data={item}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={(
            <Label>
              Nenhum registro de utilização de veículo.
            </Label>
          )}
        />

      </Content>
    </Container>
  );
}