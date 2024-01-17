import { DataSource, type DataSourceOptions } from 'typeorm'
import Todo from './entity/Todo'
import TodoList from './entity/TodoList'
import { AccountEntity, SessionEntity, UserEntity, VerificationTokenEntity } from './entity/userEntities'

export let dbInitialized = false

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DB_CONNECTION_STRING ?? '',
    synchronize: (process.env.DATA_SOURCE_SYNC != null) ? Boolean(process.env.DATA_SOURCE_SYNC).valueOf() : false,
    logging: true,
    subscribers: [],
    entities: [Todo, TodoList, UserEntity, SessionEntity, AccountEntity, VerificationTokenEntity],
    migrations: []
}

export const AppDataSource = new DataSource(dataSourceOptions)

export async function initializeDataSource (): Promise<void> {
    if (!dbInitialized) {
        dbInitialized = true
        await AppDataSource.initialize()
    }
}
