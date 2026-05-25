import { ApiProperty } from '@nestjs/swagger';
import { RejectPublicationRequestOutput } from '../../../application/use-cases/reject-publication-request/dtos/reject-publication-request-output.dto';

export class RejectPublicationRequestHttpResponse {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty({ example: 'PUB-2026-00001' })
  public referenceNumber!: string;

  @ApiProperty({ example: 'REJECTED' })
  public status!: string;

  @ApiProperty({ format: 'date-time' })
  public decisionAt!: string;
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
