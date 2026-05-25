import { ApiProperty } from '@nestjs/swagger';
import { GetPublicationRequestDetailOutput } from '../../../application/use-cases/get-publication-request-detail/dtos/get-publication-request-detail-output.dto';

export class GetPublicationRequestDetailHttpResponse {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty({ example: 'PUB-2026-00001' })
  public referenceNumber!: string;

  @ApiProperty({ example: 'Juan Carlos Pérez Gómez' })
  public ownerFullName!: string;

  @ApiProperty({ example: 'juan@correo.com' })
  public ownerEmail!: string;

  @ApiProperty({ example: '+57 300 123 4567' })
  public ownerPhonePrimary!: string;

  @ApiProperty({ nullable: true, example: '+57 301 987 6543' })
  public ownerPhoneSecondary!: string | null;

  @ApiProperty({ nullable: true, enum: ['CC', 'CE', 'TI', 'PP', 'NIT', 'RUT'], example: 'CC' })
  public ownerDocumentType!: string | null;

  @ApiProperty({ nullable: true, example: '1234567890' })
  public ownerDocumentNumber!: string | null;

  @ApiProperty({ nullable: true, format: 'uuid' })
  public proposedPropertyTypeId!: string | null;

  @ApiProperty({ enum: ['SALE', 'RENT', 'BOTH'], example: 'SALE' })
  public proposedOfferType!: string;

  @ApiProperty({ example: 'Barrio El Poblado, Medellín, Antioquia' })
  public proposedLocation!: string;

  @ApiProperty({ nullable: true, example: 85 })
  public proposedAreaM2!: number | null;

  @ApiProperty({ example: 'Casa de dos pisos con jardín y garaje doble.' })
  public proposedDescription!: string;

  @ApiProperty({ nullable: true, example: 250000000 })
  public proposedExpectedPrice!: number | null;

  @ApiProperty({ enum: ['PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'] })
  public status!: string;

  @ApiProperty({ nullable: true, format: 'uuid' })
  public assignedAdvisorId!: string | null;

  @ApiProperty({ nullable: true, format: 'date-time' })
  public decisionAt!: string | null;

  @ApiProperty({ nullable: true, format: 'uuid' })
  public decisionByAdminId!: string | null;

  @ApiProperty({ nullable: true, example: 'El inmueble no cumple los requisitos.' })
  public decisionMotive!: string | null;

  @ApiProperty({ example: true })
  public captchaValidated!: boolean;

  @ApiProperty({ nullable: true, example: '192.0.2.1' })
  public submittedFromIp!: string | null;

  @ApiProperty({ nullable: true, example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' })
  public submittedFromUserAgent!: string | null;

  @ApiProperty({ format: 'date-time' })
  public createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  public updatedAt!: string;
}

export class GetPublicationRequestDetailPresenter {
  public static toHttp(
    output: GetPublicationRequestDetailOutput,
  ): GetPublicationRequestDetailHttpResponse {
    return {
      id: output.id,
      referenceNumber: output.referenceNumber,
      ...GetPublicationRequestDetailPresenter.mapOwner(output),
      ...GetPublicationRequestDetailPresenter.mapProposal(output),
      status: output.status,
      ...GetPublicationRequestDetailPresenter.mapDecision(output),
      captchaValidated: output.captchaValidated,
      createdAt: output.createdAt.toISOString(),
      updatedAt: output.updatedAt.toISOString(),
    };
  }

  private static mapOwner(output: GetPublicationRequestDetailOutput): {
    ownerFullName: string;
    ownerEmail: string;
    ownerPhonePrimary: string;
    ownerPhoneSecondary: string | null;
    ownerDocumentType: string | null;
    ownerDocumentNumber: string | null;
  } {
    return {
      ownerFullName: output.ownerFullName,
      ownerEmail: output.ownerEmail,
      ownerPhonePrimary: output.ownerPhonePrimary,
      ownerPhoneSecondary: output.ownerPhoneSecondary ?? null,
      ownerDocumentType: output.ownerDocumentType ?? null,
      ownerDocumentNumber: output.ownerDocumentNumber ?? null,
    };
  }

  private static mapProposal(output: GetPublicationRequestDetailOutput): {
    proposedPropertyTypeId: string | null;
    proposedOfferType: string;
    proposedLocation: string;
    proposedAreaM2: number | null;
    proposedDescription: string;
    proposedExpectedPrice: number | null;
  } {
    return {
      proposedPropertyTypeId: output.proposedPropertyTypeId ?? null,
      proposedOfferType: output.proposedOfferType,
      proposedLocation: output.proposedLocation,
      proposedAreaM2: output.proposedAreaM2 ?? null,
      proposedDescription: output.proposedDescription,
      proposedExpectedPrice: output.proposedExpectedPrice ?? null,
    };
  }

  private static mapDecision(output: GetPublicationRequestDetailOutput): {
    assignedAdvisorId: string | null;
    decisionAt: string | null;
    decisionByAdminId: string | null;
    decisionMotive: string | null;
    submittedFromIp: string | null;
    submittedFromUserAgent: string | null;
  } {
    return {
      assignedAdvisorId: output.assignedAdvisorId ?? null,
      decisionAt: output.decisionAt?.toISOString() ?? null,
      decisionByAdminId: output.decisionByAdminId ?? null,
      decisionMotive: output.decisionMotive ?? null,
      submittedFromIp: output.submittedFromIp ?? null,
      submittedFromUserAgent: output.submittedFromUserAgent ?? null,
    };
  }
}
