import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SubmitPublicationRequestHttpDto {
  @ApiProperty({ example: 'Juan Carlos Pérez Gómez', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public ownerFullName!: string;

  @ApiProperty({ example: 'juan@correo.com' })
  @IsEmail()
  public ownerEmail!: string;

  @ApiProperty({ example: '+57 300 123 4567', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[+\d\s\-()]+$/)
  public ownerPhonePrimary!: string;

  @ApiPropertyOptional({ example: '+57 301 987 6543', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[+\d\s\-()]+$/)
  public ownerPhoneSecondary?: string;

  @ApiPropertyOptional({ enum: ['CC', 'CE', 'TI', 'PP', 'NIT', 'RUT'], example: 'CC' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['CC', 'CE', 'TI', 'PP', 'NIT', 'RUT', 'cc', 'ce', 'ti', 'pp', 'nit', 'rut'])
  public ownerDocumentType?: string;

  @ApiPropertyOptional({ example: '1234567890', maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  public ownerDocumentNumber?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  public proposedPropertyTypeId?: string;

  @ApiProperty({ enum: ['SALE', 'RENT', 'BOTH'], example: 'SALE' })
  @IsIn(['SALE', 'RENT', 'BOTH'])
  public proposedOfferType!: string;

  @ApiProperty({ example: 'Barrio El Poblado, Medellín, Antioquia', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  public proposedLocation!: string;

  @ApiPropertyOptional({ example: 85, minimum: 1, maximum: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  public proposedAreaM2?: number;

  @ApiProperty({
    example: 'Casa de dos pisos con jardín y garaje doble.',
    minLength: 20,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(2000)
  public proposedDescription!: string;

  @ApiPropertyOptional({ example: 250000000, minimum: 300000, maximum: 50000000000 })
  @IsOptional()
  @IsNumber()
  @Min(300000)
  @Max(50000000000)
  public proposedExpectedPrice?: number;

  @ApiProperty({ example: 'token-de-turnstile' })
  @IsString()
  @IsNotEmpty()
  public captchaToken!: string;

  @ApiProperty({ example: true, description: 'Consentimiento Ley 1581 de 2012. Debe ser true.' })
  @IsBoolean()
  @Equals(true, { message: 'El consentimiento de tratamiento de datos personales es obligatorio.' })
  public consentAccepted!: boolean;
}
