import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from '../user/user.service'


//Экспортируем класс JwtStrategy (как будет происходить валидация токена)
//Открываем конструктор. configService нужен чтобыы из env достать токен
//Далее мы обращаемся к сущности юзера, чтобы он отдал то, что нам нужно
//Вызываем super и передаем нуда нужные переменные внутри объекта
//extends-наследуем
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private userService: UserService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: configService.get('JWT_SECRET')
		})
	}

	async validate({ id }: { id: string }) {
		return this.userService.getById(id)
	}
}

//в нашем токене лежит id. Расшифровываем токен только мы благодаря ключу, после мы получаем user id
// с помощью валидации обращаемя в userservice, чтобы он отдал нам  все данные пользователя по id