import * as TaskManager from 'expo-task-manager';
import { startLocationUpdatesAsync, Accuracy, hasStartedLocationUpdatesAsync, stopLocationUpdatesAsync } from 'expo-location';
import { removeStorageLocations, saveStorageLocation } from '../libs/asyncStorage/locationStorage';

export const BACKGROUND_TASK_NAME = 'location-tracking';

// Criando nossa task para usar em background, e dai passamos a nossa "data" que seria nossa localização.
// definições do que a nossa task tenq fazer
// quem vai passar pra gente esse data é o nosso próprio startLocationUpdatesAsync
TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }: any) => {
  try {
    if (error) {
      throw error;
    }

    if (data) {
      // pegando a primeira coordenada
      const { coords, timestamp } = data.locations[0];

      const currentLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: timestamp
      }

      // quando estamos em background ele n mostra mais os consoles, pq nosso app está em back, porém ele continua executando essa task
      // podemos por ex usar o async storage pra salvar essas coords em background e etc...
      console.log('currentLocation', currentLocation);
      await saveStorageLocation(currentLocation);
    }
  } catch (error) {
    console.log(error);
    stopLocationTask();
  }
})

// iniciando a nossa task em background
export async function startLocationTask() {
  try {
    const hasStarted = await hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME);

    if (hasStarted) {
      await stopLocationTask();
    }

    // vai pegar a coordenada a cada 1 seg
    await startLocationUpdatesAsync(BACKGROUND_TASK_NAME, {
      accuracy: Accuracy.Highest,
      distanceInterval: 1,
      timeInterval: 1000
    });
  } catch (error) {
    console.log(error);
  }
}

// parando a nossa task em background
export async function stopLocationTask() {
  try {
    // verificando se a nossa localização já está sendo obtida, ou seja, se a task já está em andamento.
    const hasStarted = await hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME);

    if (hasStarted) {
      await stopLocationUpdatesAsync(BACKGROUND_TASK_NAME);
      await removeStorageLocations();
    }
  } catch (error) {
    console.log(error);
  }
}