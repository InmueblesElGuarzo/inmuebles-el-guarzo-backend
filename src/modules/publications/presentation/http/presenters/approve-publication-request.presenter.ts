import { ApiProperty } from '@nestjs/swagger';
import { ApprovePublicationRequestOutput } from '../../../application/use-cases/approve-publication-request/dtos/approve-publication-request-output.dto';

export class ApprovePublicationRequestHttpResponse {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty({ example: 'PUB-2026-00001' })
  public referenceNumber!: string;

  @ApiProperty({ example: 'APPROVED' })
  public status!: string;

  @ApiProperty({ format: 'date-time' })
  public decisionAt!: string;
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
