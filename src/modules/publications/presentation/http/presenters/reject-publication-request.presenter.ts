import { RejectPublicationRequestOutput } from '../../../application/use-cases/reject-publication-request/dtos/reject-publication-request-output.dto';

export interface RejectPublicationRequestHttpResponse {
  id: string;
  referenceNumber: string;
  status: string;
  decisionAt: string;
}

export class RejectPublicationRequestPresenter {
  public static toHttp(
    output: RejectPublicationRequestOutput,
  ): RejectPublicationRequestHttpResponse {
    return {
      id: output.id,
      referenceNumber: output.referenceNumber,
      status: output.status,
      decisionAt: output.decisionAt.toISOString(),
    };
  }
}
