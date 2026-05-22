import {
  ListPublicationRequestsOutput,
  PublicationRequestSummary,
} from '../../../application/use-cases/list-publication-requests/dtos/list-publication-requests-output.dto';

export interface PublicationRequestSummaryHttpResponse {
  id: string;
  referenceNumber: string;
  ownerFullName: string;
  ownerEmail: string;
  status: string;
  assignedAdvisorId: string | null;
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
      status: item.status,
      assignedAdvisorId: item.assignedAdvisorId ?? null,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
