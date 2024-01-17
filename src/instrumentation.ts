import { initializeDataSource } from './data-source'

export async function register (): Promise<void> {
    await initializeDataSource()
}
