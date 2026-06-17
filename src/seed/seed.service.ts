import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import axios, { AxiosInstance } from 'axios';

import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon } from '@/pokemon/entities/pokemon.entity';

interface PokemonToInsert {
    name: string;
    no: number;
}

@Injectable()
export class SeedService {
    constructor(
        @InjectModel(Pokemon.name)
        private readonly pokemonModel: Model<Pokemon>
    ) { }

    private readonly axios: AxiosInstance = axios;

    // Primera forma de insertar multiples registros
    /*
    async executedSeed() {
        // Primero borramos toda la base de datos
        await this.pokemonModel.deleteMany({});

        // Petición http
        const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

        const insertPromiseArray: any = [];

        data.results.forEach(({ name, url }) => {
            const segments = url.split('/');
            const no: number = +segments[segments.length - 2];
            // const pokemon = await this.pokemonModel.create({ name, no });
            insertPromiseArray.push(
                this.pokemonModel.create({ name, no })
            )
        })

        await Promise.all(insertPromiseArray)

        return 'Seed executed';
    }
    */

    // Forma óptima de insertar múltiples registros
    async executedSeed() {
        // Primero borramos toda la base de datos
        await this.pokemonModel.deleteMany({});

        // Petición http
        const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

        const pokemonToInsert: PokemonToInsert[] = [];

        data.results.forEach(({ name, url }) => {
            const segments = url.split('/');
            const no: number = +segments[segments.length - 2];
            // const pokemon = await this.pokemonModel.create({ name, no });
            pokemonToInsert.push({ name, no })
        })

        await this.pokemonModel.insertMany(pokemonToInsert);

        return 'Seed executed';
    }
}
