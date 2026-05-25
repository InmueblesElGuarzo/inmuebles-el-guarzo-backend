import { ApiProperty } from '@nestjs/swagger';
import { StartReviewPublicationRequestOutput } from '../../../application/use-cases/start-review-publication-request/dtos/start-review-publication-request-output.dto';

export class StartReviewPublicationRequestHttpResponse {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty({ example: 'PUB-2026-00001' })
  public referenceNumber!: string;

  @ApiProperty({ example: 'UNDER_REVIEW' })
  public status!: string;

  @ApiProperty({ format: 'date-time' })
  public updatedAt!: string;
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
