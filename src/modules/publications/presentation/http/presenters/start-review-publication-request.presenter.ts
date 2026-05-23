import { StartReviewPublicationRequestOutput } from '../../../application/use-cases/start-review-publication-request/dtos/start-review-publication-request-output.dto';

export interface StartReviewPublicationRequestHttpResponse {
  id: string;
  referenceNumber: string;
  status: string;
  updatedAt: string;
}

export class StartReviewPublicationRequestPresenter {
  public static toHttp(
    output: StartReviewPublicationRequestOutput,
  ): StartReviewPublicationRequestHttpResponse {
    return {
      id: output.id,
      referenceNumber: output.referenceNumber,
      status: output.status,
      updatedAt: output.updatedAt.toISOString(),
    };
  }
}
