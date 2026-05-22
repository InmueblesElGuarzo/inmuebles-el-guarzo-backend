import {
  ListPublicationRequestsOutput,
  PublicationRequestSummary,
} from '../../../application/use-cases/list-publication-requests/dtos/list-publication-requests-output.dto';

export interface PublicationRequestSummaryHttpResponse {
  id: string;
  referenceNumber: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhonePrimary: string;
  proposedOfferType: string;
  proposedLocation: string;
  status: string;
  assignedAdvisorId: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface ListPublicationRequestsHttpResponse {
  items: PublicationRequestSummaryHttpResponse[];
  total: number;
  page: number;
  limit: number;
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
