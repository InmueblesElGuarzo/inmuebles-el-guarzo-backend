import { ApiProperty } from '@nestjs/swagger';
import {
  ListPublicationRequestsOutput,
  PublicationRequestSummary,
} from '../../../application/use-cases/list-publication-requests/dtos/list-publication-requests-output.dto';

export class PublicationRequestSummaryHttpResponse {
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

  @ApiProperty({ enum: ['SALE', 'RENT', 'BOTH'], example: 'SALE' })
  public proposedOfferType!: string;

  @ApiProperty({ example: 'Barrio El Poblado, Medellín, Antioquia' })
  public proposedLocation!: string;

  @ApiProperty({ enum: ['PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'] })
  public status!: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  public assignedAdvisorId!: string | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  public decidedAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  public createdAt!: string;
}

export class ListPublicationRequestsHttpResponse {
  @ApiProperty({ type: [PublicationRequestSummaryHttpResponse] })
  public items!: PublicationRequestSummaryHttpResponse[];

  @ApiProperty({ example: 42 })
  public total!: number;

  @ApiProperty({ example: 1 })
  public page!: number;

  @ApiProperty({ example: 20 })
  public limit!: number;
}

export class ListPublicationRequestsPresenter {
  public static toHttp(output: ListPublicationRequestsOutput): ListPublicationRequestsHttpResponse {
    return {
      items: output.items.map((item) => ListPublicationRequestsPresenter.mapItem(item)),
      total: output.total,
      page: output.page,
      limit: output.limit,
    };
  }

  private static mapItem(item: PublicationRequestSummary): PublicationRequestSummaryHttpResponse {
    return {
      id: item.id,
      referenceNumber: item.referenceNumber,
      ownerFullName: item.ownerFullName,
      ownerEmail: item.ownerEmail,
      ownerPhonePrimary: item.ownerPhonePrimary,
      proposedOfferType: item.proposedOfferType,
      proposedLocation: item.proposedLocation,
      status: item.status,
      assignedAdvisorId: item.assignedAdvisorId ?? null,
      decidedAt: item.decidedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
