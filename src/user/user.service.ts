import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.serv';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { UserDto } from './user.dto';

import { startOfDay, subDays } from 'date-fns'

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

        getById(id: string) {
            return this.prisma.user.findUnique({
                where: {
                    id
                },
                include: {
                  tasks: true 
                }
                
            })
        }

        getByEmail(email:string){
                return this.prisma.user.findUnique({
                    where: {
                        email
                    }
                })
            }

            //dto в себе хранит пароль, нужно его захешировать
            async create(dto: AuthDto) {
                const user = {
                    email: dto.email,
                    name: '',
                    password: await hash(dto.password),//указываем пароль и hash для хеширования
                }
//теперь указываем сам метод
                return this.prisma.user.create({
                    data: user,
                })
            }
            async update(id: string, dto: UserDto) {
                let data = dto
        
                if (dto.password) {
                    data = { ...dto, password: await hash(dto.password) }
                }
        
                return this.prisma.user.update({
                    where: {
                        id
                    },
                    data,
                    select: {
                        name: true,
                        email: true
                    }
                })
            }

            async getProfile(id: string) {
                const profile = await this.getById(id)
        
                const totalTasks = profile.tasks.length
                const completedTasks = await this.prisma.task.count({
                    where: {
                        userId: id,
                        isCompleted: true
                    }
                })
        
                const todayStart = startOfDay(new Date())
                const weekStart = startOfDay(subDays(new Date(), 7))
        
                const todayTasks = await this.prisma.task.count({
                    where: {
                        userId: id,
                        createdAt: {
                            gte: todayStart.toISOString()
                        }
                    }
                })
        
                const weekTasks = await this.prisma.task.count({
                    where: {
                        userId: id,
                        createdAt: {
                            gte: weekStart.toISOString()
                        }
                    }
                })

                const { password, ...rest } = profile

                return {
                    user: rest,
                    statistics: [
                        { label: 'Всего задач', value: totalTasks },
                        { label: 'Выполненные задачи', value: completedTasks },
                        { label: 'Составлено задач сегодня', value: todayTasks },
                        { label: 'Составлено задач за неделю', value: weekTasks }
                    ]
                }
            }
}


    

//PrismaService является частью провайдера. поэтому нужно прописать или же подключить его в обоих источниках для обмена данными