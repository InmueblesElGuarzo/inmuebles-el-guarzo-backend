import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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
  public ownerPhonePrimary!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  public ownerPhoneSecondary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
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
  public proposedAreaM2?: number;

  @IsString()
  @MinLength(20)
  public proposedDescription!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public proposedExpectedPrice?: number;

  @IsString()
  @IsNotEmpty()
  public captchaToken!: string;
}
