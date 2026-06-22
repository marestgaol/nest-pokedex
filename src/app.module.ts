import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { EnvConfiguration } from './config/app.config';

import Joi from 'joi';
import { JoiValidationSchema } from './config/joi.validation';

import { join } from 'path';

import { PokemonModule } from './pokemon/pokemon.module';
import { CommonModule } from './common/common.module';

import { SeedModule } from './seed/seed.module';

/*
Aquí me deja de funcionar la aplicación cuando hago un llamado al servidor Error:connect ECONNREFUSED 127.0.0.1:3000, el problema es que he creado una variable de entorno con PORT=3001 y daba conflicto porque tiene que haber un uso de esa variable
*/
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [EnvConfiguration],
            validationSchema: JoiValidationSchema,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            renderPath: '/',
        }),
        MongooseModule.forRoot(process.env.MONGODB!),
        PokemonModule,
        CommonModule,
        SeedModule],
})
export class AppModule {
    constructor() {
        // console.log(process.env)
    }
}

/*
Claude me da la solución: instalar joi
*/
// @Module({
//     imports: [
//         ConfigModule.forRoot({
//             validationSchema: Joi.object({
//                 MONGODB: Joi.string().required(),
//                 PORT: Joi.number().default(3001),
//             }),
//         }),
//         ServeStaticModule.forRoot({
//             rootPath: join(__dirname, '..', 'public'),
//             renderPath: '/',
//         }),
//         MongooseModule.forRoot(process.env.MONGODB!),
//         PokemonModule,
//         CommonModule,
//         SeedModule],
// })
// export class AppModule {
//     constructor() {
//         console.log(process.env)
//     }
// }