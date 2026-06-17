import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PokemonModule } from '@/pokemon/pokemon.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  // Importamos el PokemonModule para poder insertarlo en la base de datos, previamente exportado
  imports: [
    PokemonModule
  ]
})
export class SeedModule { }
