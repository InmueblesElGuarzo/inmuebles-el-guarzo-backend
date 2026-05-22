import { SubmitPublicationRequestOutput } from '../../../application/use-cases/submit-publication-request/dtos/submit-publication-request-output.dto';

export interface SubmitPublicationRequestHttpResponse {
  id: string;
  referenceNumber: string;
  status: string;
  createdAt: string;
}

export class SubmitPublicationRequestPresenter {
  public static toHttp(
    output: SubmitPublicationRequestOutput,
  ): SubmitPublicationRequestHttpResponse {
    return {
      id: output.id,
      referenceNumber: output.referenceNumber,
      status: output.status,
      createdAt: output.createdAt.toISOString(),
    };
  }
}
