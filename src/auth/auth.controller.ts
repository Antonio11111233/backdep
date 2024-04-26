import { Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Request, Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())       //чтобы срабатывала валидация, указанная в auth.dto
  @HttpCode(200)
  @Post('login')                        // указываем сам адрес(auth/login)
  async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {  //подключаем дто
    const {refreshToken, ...response} = await this.authService.login(dto)
    this.authService.addRefreshTokenToResponse(res, refreshToken) 
     
    return response  //
  }

  @UsePipes(new ValidationPipe())       //чтобы срабатывала валидация, указанная в auth.dto
  @HttpCode(200)
  @Post('register')                        // указываем сам адрес(auth/login)
  async register(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {

    const {refreshToken, ...response} = await this.authService.register(dto)

    this.authService.addRefreshTokenToResponse(res, refreshToken)

    return response
  }

  @HttpCode(200)
	@Post('login/access-token')
	async getNewTokens(
		@Req() req: Request, //в аргументе получаем request(работа с запросом)
		@Res({ passthrough: true }) res: Response
	) {
		const refreshTokenFromCookies =
			req.cookies[this.authService.REFRESH_TOKEN_NAME] //подучаем куки и проверяем есть ли в них REFRESH_TOKEN_NAME

		if (!refreshTokenFromCookies) { //если токена нет в запросе, то мы его очищяем
			this.authService.removeRefreshTokenFromResponse(res)// очистка токена
			throw new UnauthorizedException('Токен обновления не передан')
		}
//если токен есть в запросе, то мы его обновляем
		const { refreshToken, ...response } = await this.authService.getNewTokens(
			refreshTokenFromCookies
		)
//сдесь идет добавление нового токена в запросе
		this.authService.addRefreshTokenToResponse(res, refreshToken)

		return response
	}

  @HttpCode(200)
	@Post('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		this.authService.removeRefreshTokenFromResponse(res)
		return true
	}
}
