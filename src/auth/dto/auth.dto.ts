import { IsEmail, IsString, MinLength } from 'class-validator'

export class AuthDto {
	@IsEmail()
	email: string

	@MinLength(6, {
		message: 'Длина пароля должна составлять не менее 6 символов'
	})
	@IsString()
	password: string
}
