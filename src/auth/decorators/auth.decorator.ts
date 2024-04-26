import { UseGuards } from "@nestjs/common";
import { JwtAuthProtection } from '../protection/jwt.protection'

export const Auth = () => UseGuards(JwtAuthProtection)

//там где указывается декоратор, проверяется авторизация