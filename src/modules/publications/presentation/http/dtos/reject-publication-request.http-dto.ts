import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectPublicationRequestHttpDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  public decisionMotive!: string;
}
