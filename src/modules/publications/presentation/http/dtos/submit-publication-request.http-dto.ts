import {
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
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public ownerFullName!: string;

  @IsEmail()
  public ownerEmail!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[+\d\s\-()]+$/)
  public ownerPhonePrimary!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[+\d\s\-()]+$/)
  public ownerPhoneSecondary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['CC', 'CE', 'TI', 'PP', 'NIT', 'RUT', 'cc', 'ce', 'ti', 'pp', 'nit', 'rut'])
  public ownerDocumentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  public ownerDocumentNumber?: string;

  @IsOptional()
  @IsUUID()
  public proposedPropertyTypeId?: string;

  @IsIn(['SALE', 'RENT', 'BOTH'])
  public proposedOfferType!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  public proposedLocation!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  public proposedAreaM2?: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(2000)
  public proposedDescription!: string;

  @IsOptional()
  @IsNumber()
  @Min(300000)
  @Max(50000000000)
  public proposedExpectedPrice?: number;

  @IsString()
  @IsNotEmpty()
  public captchaToken!: string;
}
