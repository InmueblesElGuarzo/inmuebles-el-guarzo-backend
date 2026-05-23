import { ApprovePublicationRequestOutput } from '../../../application/use-cases/approve-publication-request/dtos/approve-publication-request-output.dto';

export interface ApprovePublicationRequestHttpResponse {
  id: string;
  referenceNumber: string;
  status: string;
  decisionAt: string;
}

export class ApprovePublicationRequestPresenter {
  public static toHttp(
    output: ApprovePublicationRequestOutput,
  ): ApprovePublicationRequestHttpResponse {
    return {
      id: output.id,
      referenceNumber: output.referenceNumber,
      status: output.status,
      decisionAt: output.decisionAt.toISOString(),
    };
  }
}
