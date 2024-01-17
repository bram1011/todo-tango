import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import TodoList from './TodoList'

@Entity()
export default class Todo {
    @PrimaryGeneratedColumn('uuid')
        id: string

    @Column()
        name: string

    @Column()
        description: string

    @Column()
        completed: boolean

    @ManyToOne(() => TodoList, (todoList) => todoList.todos, { cascade: true })
        todoList: Relation<TodoList>
}
