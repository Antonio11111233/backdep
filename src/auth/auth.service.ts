import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service'
import { AuthDto } from './dto/auth.dto';
import { verify } from 'argon2';
import { Response } from 'express'

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN= 1
	REFRESH_TOKEN_NAME = 'refreshToken'
	
    constructor(
        private jwt: JwtService, // расшифровываем токен
        private userService: UserService // обращаемя к юзеру
    ) {}

    async login(dto: AuthDto) { // создаем асинхронный логин
		//нужно отдать юзера отдельно от пароля (зачем при отдаче логина, отдавать заштфрованный пароль обратно?)

		const { password, ...user } = await this.validateUser(dto) // подключил метод validateUser и передал dto

		const tokens = this.issueTokens(user.id)//содаем токен и передаем ему юзера issueTokens

		return {
			user,
			...tokens,
		}
    }


	async register(dto: AuthDto) { // создаем асинхронную регистрацию
        
		const oldUser = await this.userService.getByEmail(dto.email)//проверяем уникальность email

		if (oldUser) throw new BadRequestException('Пользователь уже существует')

		const { password, ...user } = await this.userService.create(dto)//обращаемся к userService и создаем дтошку, которую нужно описать в userService
		 
		
		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens,
		}
    }


//т.к каждый метод должен отвечать за свою функциональность, я создаю метод,
//который будет отвечать за создание токенов

	private issueTokens(userId: string) {
		
		const data = { id: userId } //записываем id как userId, обЪект, который будет внутри токена
//генерация accesToken(отвечает за запрос к серверу где нам нужна будет авторизация), а refreshToken нужен, чтобы переобновить accesToken. Прописываем и указываем дату, которую закидываем (в данном случае id)
		
		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h' // информация о токене (expiresIn-опция когда токен бы заканчивался)
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		})

		return { accessToken, refreshToken }
	}



//прописываем метод для валидации user (сравнение паролей и т.д)
	private async validateUser(dto: AuthDto) {
		const user = await this.userService.getByEmail(dto.email)// берем юзера по email и смотрим есть ли такой или нет
//нужно будет создать getByEmail в user.service
		if (!user) throw new NotFoundException('Пользователь не найден')

		const isValid = await verify(user.password, dto.password) //смотрим чтобы пароль юзера совпадал с приходящим из dto
	//пароль я буду хранить в хеш виде и в БД никогда не будет виден пароль

		if (!isValid) throw new UnauthorizedException('Неверный пароль')

		return user
	}


	addRefreshTokenToResponse(res: Response, refreshToken: string) { //взяли response(ответ сервера) и refreshToken
		const expiresIn = new Date()//берем текущую дату
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)// с помощью setDate добавляем определенную дату
		//EXPIRE_DAY_REFRESH_TOKEN кол-во дней когда будет заканчиваться токен

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, { //REFRESH_TOKEN_NAME название куки, refreshToken(что будет лежать в ней)
			httpOnly: true, //указываем, что это серверная кука
			domain: '31.129.59.224',
			expires: expiresIn,//дата окончания токена
			secure: true,//https кука
			// lax
			sameSite: 'none'
		})
	}
	
	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: '31.129.59.224',
			expires: new Date(0),
			secure: true,
			// lax
			sameSite: 'none'
		})
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)//с помощью jwt верифицируем, что этио верный токен
		if (!result) throw new UnauthorizedException('Недопустимый токен обновления')

		const { password, ...user } = await this.userService.getById(result.id)//{ password, ...user } пароль не нужен т.е пропускаем

		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}
}