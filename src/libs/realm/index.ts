import { createRealmContext } from "@realm/react";
import { Historic } from "./schemas/Historic";

export const {
  // compartilhar o acesso ao banco com nossa aplicação
  RealmProvider,
  // usar de fato a instância no nosso banco (cadastrar, atualizar)
  useRealm,
  // implementar consultas no banco
  useQuery,
  // obter um objeto específico
  useObject
} = createRealmContext({
  schema: [Historic]
});