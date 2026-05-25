import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectPublicationRequestHttpDto {
  @ApiProperty({
    example: 'El inmueble no cumple con los requisitos mínimos de publicación.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  public decisionMotive!: string;
}
