import { Module } from '@nestjs/common';

import { PUBLICATION_REQUEST_REPOSITORY } from './application/ports/output/publication-request.repository.port';
import { APPROVE_PUBLICATION_REQUEST_INPUT_PORT } from './application/use-cases/approve-publication-request/dtos/approve-publication-request.input-port';
import { ApprovePublicationRequestInteractor } from './application/use-cases/approve-publication-request/approve-publication-request.interactor';
import { GET_PUBLICATION_REQUEST_DETAIL_INPUT_PORT } from './application/use-cases/get-publication-request-detail/dtos/get-publication-request-detail.input-port';
import { GetPublicationRequestDetailInteractor } from './application/use-cases/get-publication-request-detail/get-publication-request-detail.interactor';
import { LIST_PUBLICATION_REQUESTS_INPUT_PORT } from './application/use-cases/list-publication-requests/dtos/list-publication-requests.input-port';
import { ListPublicationRequestsInteractor } from './application/use-cases/list-publication-requests/list-publication-requests.interactor';
import { REJECT_PUBLICATION_REQUEST_INPUT_PORT } from './application/use-cases/reject-publication-request/dtos/reject-publication-request.input-port';
import { RejectPublicationRequestInteractor } from './application/use-cases/reject-publication-request/reject-publication-request.interactor';
import { SUBMIT_PUBLICATION_REQUEST_INPUT_PORT } from './application/use-cases/submit-publication-request/dtos/submit-publication-request.input-port';
import { SubmitPublicationRequestInteractor } from './application/use-cases/submit-publication-request/submit-publication-request.interactor';
import { PublicationRequestPrismaRepositoryAdapter } from './infrastructure/persistence/prisma/publication-request.prisma.repository.adapter';
import { PublicationsController } from './presentation/http/controllers/publications.controller';

@Module({
  controllers: [PublicationsController],
  providers: [
    {
      provide: PUBLICATION_REQUEST_REPOSITORY,
      useClass: PublicationRequestPrismaRepositoryAdapter,
    },
    {
      provide: SUBMIT_PUBLICATION_REQUEST_INPUT_PORT,
      useClass: SubmitPublicationRequestInteractor,
    },
    { provide: LIST_PUBLICATION_REQUESTS_INPUT_PORT, useClass: ListPublicationRequestsInteractor },
    {
      provide: GET_PUBLICATION_REQUEST_DETAIL_INPUT_PORT,
      useClass: GetPublicationRequestDetailInteractor,
    },
    {
      provide: APPROVE_PUBLICATION_REQUEST_INPUT_PORT,
      useClass: ApprovePublicationRequestInteractor,
    },
    {
      provide: REJECT_PUBLICATION_REQUEST_INPUT_PORT,
      useClass: RejectPublicationRequestInteractor,
    },
  ],
})
export class PublicationsModule {}
