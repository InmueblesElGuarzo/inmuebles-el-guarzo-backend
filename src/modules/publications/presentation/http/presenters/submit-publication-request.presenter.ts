import { ApiProperty } from '@nestjs/swagger';
import { SubmitPublicationRequestOutput } from '../../../application/use-cases/submit-publication-request/dtos/submit-publication-request-output.dto';

export class SubmitPublicationRequestHttpResponse {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty({ example: 'PUB-2026-00001' })
  public referenceNumber!: string;

  @ApiProperty({ example: 'PENDING_REVIEW' })
  public status!: string;

  @ApiProperty({ format: 'date-time' })
  public createdAt!: string;
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
