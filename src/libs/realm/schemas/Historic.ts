import { Realm } from '@realm/react';

type GenerateProps = {
  user_id: string;
  description: string;
  license_plate: string;
}

// Na classe utilizo o mesmo nome q quero utilizar na collections
export class Historic extends Realm.Object<Historic> {
  _id!: string;
  user_id!: string;
  license_plate!: string;
  description!: string;
  status!: string;
  created_at!: Date;
  updated_at!: Date;

  // método q vai ser chamado no momento q formos utilizar nosso schema
  // quais campos são necessários no momento de usar nosso schema
  // ele vai retornar um objeto com os dados q a gente quer guardar no banco
  static generate({ user_id, description, license_plate }: GenerateProps) {
    // aq por ex, podemos dizer quais campos vão ser informados no momento de utilizar o nosso schema, quais campos vão ter valor padrão, quai campos vão gerar valor automâtico, e assim vai
    // return tenq ser o objeto q a gente quer cadastrar
    return {
      _id: new Realm.BSON.UUID(),
      user_id,
      description,
      license_plate,
      status: 'departure',
      created_at: new Date(),
      updated_at: new Date(),
    }
  }

  // aq vamos definir de fato a estrutura que iremos armazenas no banco
  static schema = {
    name: 'Historic',
    primaryKey: '_id',

    // properties = dados da nossa collection
    properties: {
      // esses tipos q definimos são tipos do realmDB
      _id: 'uuid',
      user_id: {
        type: 'string',
        // indexed = campo q vai ser usado como filtro de pesquisa no nosso app, ai ele define dentro do banco, para que seja um campo com pesquisa otimizado, quando temos indexes, faz com q as pesquisas sejas mais performáticas
        indexed: true
      },
      license_plate: 'string',
      description: 'string',
      status: 'string',
      created_at: 'date',
      updated_at: 'date',
    }
  }
}
