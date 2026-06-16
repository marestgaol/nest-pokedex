import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {
    // Contruir un modelo para inyectarlo en la base de datos y guardarlo
    constructor(
        @InjectModel(Pokemon.name)
        private readonly pokemonModel: Model<Pokemon>
    ) { }

    async create(createPokemonDto: CreatePokemonDto) {
        createPokemonDto.name = createPokemonDto.name.toLowerCase();

        // Como tenía un error de tipado de ts, ClaudeCode me recomendó esto
        // interface MongoError {
        //     code: number;
        //     keyPattern: Record<string, unknown>;
        //     keyValue: Record<string, unknown>;
        // }

        // function isMongoError(error: unknown): error is MongoError {
        //     return (
        //         typeof error === 'object' &&
        //         error !== null &&
        //         'code' in error
        //     );
        // }

        try {
            // Guardar en la base de datos
            const pokemon = await this.pokemonModel.create(createPokemonDto);

            return pokemon;
        } catch (error) {
            // Dos formas de hacerlo
            /*
                if (error.code === 11000)

                    throw new ConflictException(

                        `Pokemon with ${Object.keys(error.keyPattern)}: ${Object.values(

                            error.keyValue,

                        )} already exists`,

                    );
                console.log(error)
                throw new InternalServerErrorException(`Can´t create Pokemon - Check server logs`)
            */
            this.handleExceptions(error);

            // Y añado más de ClaudeCode para el error de tipado de error
            // if (isMongoError(error) && error.code === 11000)
            //     throw new ConflictException(
            //         `Pokemon with ${Object.keys(error.keyPattern)}: ${Object.values(
            //             error.keyValue,
            //         )} already exists`,
            //     );

            // console.log(error);
            // throw new InternalServerErrorException(`Can´t create Pokemon - Check server logs`);
        }
    }

    findAll() {
        return `This action returns all pokemon`;
    }

    async findOne(term: string) {
        let pokemon: Pokemon | null = null;

        if (!isNaN(+term)) {
            pokemon = await this.pokemonModel.findOne({ no: +term })
        }

        // MongoID
        if (!pokemon && isValidObjectId(term)) {
            pokemon = await this.pokemonModel.findById(term)
        }

        // Name
        if (!pokemon) {
            pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
        }

        if (!pokemon) {
            throw new NotFoundException(`Pokemon with id, name or no "${term}" not found.`)
        }

        return pokemon;
    }

    async update(term: string, updatePokemonDto: UpdatePokemonDto) {
        const pokemon = await this.findOne(term);

        if (updatePokemonDto.name) {
            updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
        }

        // const updatedPokemon = await pokemon.updateOne(updatePokemonDto, { new: true });

        // return { ...pokemon.toJSON(), ...updatePokemonDto };



        // Solución a la tarea por mi parte de que si existe un id, marque un error
        // interface MongoError {
        //     code: number;
        //     keyPattern: Record<string, unknown>;
        //     keyValue: Record<string, unknown>;
        // }

        // function isMongoError(error: unknown): error is MongoError {
        //     return (
        //         typeof error === 'object' &&
        //         error !== null &&
        //         'code' in error
        //     );
        // }

        // try {
        //     // Guardar en la base de datos
        //     const updatedPokemon = await pokemon.updateOne(updatePokemonDto, { new: true });

        //     return { ...pokemon.toJSON(), ...updatePokemonDto };
        // } catch (error) {
        //     if (isMongoError(error) && error.code === 11000)
        //         throw new ConflictException(
        //             `Pokemon with ${Object.keys(error.keyPattern)}: ${Object.values(
        //                 error.keyValue,
        //             )} already exists`,
        //         );

        //     console.log(error);
        //     throw new InternalServerErrorException(`Can´t create Pokemon - Check server logs`);
        // }



        // Solución a la tarea de que si existe un id, marque un error
        try {
            const updatedPokemon = await pokemon.updateOne(updatePokemonDto, { new: true });
            return { ...pokemon.toJSON(), ...updatePokemonDto };
        } catch (error) {
            this.handleExceptions(error);
        }
    }

    async remove(id: string) {
        // Borra por id de mongo, si no es un id de mongo da error, si no encuentra id da error
        const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
        if (deletedCount === 0) {
            throw new NotFoundException(`Pokemon with id ${id} not found`);
        }
        return;
    }

    private handleExceptions(error: any) {
        if (error.code === 11000) {
            throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
        }
        console.log(error)
        throw new InternalServerErrorException(`Can´t create Pokemon - Check server logs`);
    }
}
