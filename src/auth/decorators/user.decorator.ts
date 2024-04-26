//файл нужен, чтобы забирать нашего юзера из запроса

import type { User } from '@/../prisma/generated/client'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator( //создаем декоратор
    (data: keyof User, ctx: ExecutionContext) => { //получаем дату, получаем контекст текущий
        const request = ctx.switchToHttp().getRequest() //из контекста получаем сам запрос
        const user = request.user //из запроса получаем юзера

        return data ? user[data] : user //если дата есть отдаем, если нет, то просто без даты (не полностью понял)
    }
)
 
// прокидываем дату чтобы получить конкретное поле или все поля. В данном случае получили все поля, но можно прописать @CurrentUser("email") и мы получим только почту