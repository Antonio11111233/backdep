import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'

//Создаем функцию, которая принимается configService,
//отдает JwtModuleOptions и в самом конце отдает secret, который мы забираем из .env
//Теперь можно использовать эту функцию

export const getJwtConfig = async (
    configService: ConfigService
): Promise<JwtModuleOptions> => ({
    secret: configService.get('JWT_SECRET'), 
})