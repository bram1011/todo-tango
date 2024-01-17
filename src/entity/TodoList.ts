import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import Todo from './Todo'
import { UserEntity } from './userEntities'

@Entity()
export default class TodoList {
    @PrimaryGeneratedColumn('uuid')
        id: string

    @Column()
        name: string

    @OneToMany(() => Todo, (todo) => todo.todoList)
        todos: Relation<Todo[]>

    @ManyToMany(() => UserEntity)
    @JoinTable()
        users: Relation<UserEntity[]>
}
