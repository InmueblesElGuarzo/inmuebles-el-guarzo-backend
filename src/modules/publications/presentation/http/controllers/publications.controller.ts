import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { Public } from '../../../../../shared-kernel/presentation/decorators/public.decorator';
import { AuthenticatedUser } from '../../../../iam/application/ports/output/identity-provider.port';
import { CurrentUser } from '../../../../iam/presentation/http/decorators/current-user.decorator';

import {
  APPROVE_PUBLICATION_REQUEST_INPUT_PORT,
  ApprovePublicationRequestInputPort,
} from '../../../application/use-cases/approve-publication-request/dtos/approve-publication-request.input-port';
import {
  GET_PUBLICATION_REQUEST_DETAIL_INPUT_PORT,
  GetPublicationRequestDetailInputPort,
} from '../../../application/use-cases/get-publication-request-detail/dtos/get-publication-request-detail.input-port';
import {
  LIST_PUBLICATION_REQUESTS_INPUT_PORT,
  ListPublicationRequestsInputPort,
} from '../../../application/use-cases/list-publication-requests/dtos/list-publication-requests.input-port';
import {
  REJECT_PUBLICATION_REQUEST_INPUT_PORT,
  RejectPublicationRequestInputPort,
} from '../../../application/use-cases/reject-publication-request/dtos/reject-publication-request.input-port';
import {
  START_REVIEW_PUBLICATION_REQUEST_INPUT_PORT,
  StartReviewPublicationRequestInputPort,
} from '../../../application/use-cases/start-review-publication-request/dtos/start-review-publication-request.input-port';
import {
  SUBMIT_PUBLICATION_REQUEST_INPUT_PORT,
  SubmitPublicationRequestInputPort,
} from '../../../application/use-cases/submit-publication-request/dtos/submit-publication-request.input-port';

import { ListPublicationRequestsHttpDto } from '../dtos/list-publication-requests.http-dto';
import { RejectPublicationRequestHttpDto } from '../dtos/reject-publication-request.http-dto';
import { SubmitPublicationRequestHttpDto } from '../dtos/submit-publication-request.http-dto';
import {
  ApprovePublicationRequestHttpResponse,
  ApprovePublicationRequestPresenter,
} from '../presenters/approve-publication-request.presenter';
import {
  GetPublicationRequestDetailHttpResponse,
  GetPublicationRequestDetailPresenter,
} from '../presenters/get-publication-request-detail.presenter';
import {
  ListPublicationRequestsHttpResponse,
  ListPublicationRequestsPresenter,
} from '../presenters/list-publication-requests.presenter';
import {
  RejectPublicationRequestHttpResponse,
  RejectPublicationRequestPresenter,
} from '../presenters/reject-publication-request.presenter';
import {
  StartReviewPublicationRequestHttpResponse,
  StartReviewPublicationRequestPresenter,
} from '../presenters/start-review-publication-request.presenter';
import {
  SubmitPublicationRequestHttpResponse,
  SubmitPublicationRequestPresenter,
} from '../presenters/submit-publication-request.presenter';

@ApiTags('Publications')
@Controller('publications')
export class PublicationsController {
  @Inject(START_REVIEW_PUBLICATION_REQUEST_INPUT_PORT)
  private readonly startReviewInteractor!: StartReviewPublicationRequestInputPort;

  public constructor(
    @Inject(SUBMIT_PUBLICATION_REQUEST_INPUT_PORT)
    private readonly submitInteractor: SubmitPublicationRequestInputPort,
    @Inject(LIST_PUBLICATION_REQUESTS_INPUT_PORT)
    private readonly listInteractor: ListPublicationRequestsInputPort,
    @Inject(GET_PUBLICATION_REQUEST_DETAIL_INPUT_PORT)
    private readonly getDetailInteractor: GetPublicationRequestDetailInputPort,
    @Inject(APPROVE_PUBLICATION_REQUEST_INPUT_PORT)
    private readonly approveInteractor: ApprovePublicationRequestInputPort,
    @Inject(REJECT_PUBLICATION_REQUEST_INPUT_PORT)
    private readonly rejectInteractor: RejectPublicationRequestInputPort,
  ) {}

  @Post()
  @Public()
  @HttpCode(201)
  @ApiOperation({ summary: 'Submit a new publication request' })
  @ApiCreatedResponse({ type: SubmitPublicationRequestHttpResponse })
  public async submit(
    @Body() dto: SubmitPublicationRequestHttpDto,
    @Req() req: Request,
  ): Promise<SubmitPublicationRequestHttpResponse> {
    const ua = req.headers['user-agent'];
    const submittedFromUserAgent: string | undefined = typeof ua === 'string' ? ua : undefined;
    const result = await this.submitInteractor.execute({
      ...dto,
      submittedFromIp: req.ip,
      submittedFromUserAgent,
    });
    if (result.isFailure) {
      throw result.error;
    }
    return SubmitPublicationRequestPresenter.toHttp(result.value);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List publication requests (ADMIN)' })
  @ApiOkResponse({ type: ListPublicationRequestsHttpResponse })
  public async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPublicationRequestsHttpDto,
  ): Promise<ListPublicationRequestsHttpResponse> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const result = await this.listInteractor.execute(query);
    if (result.isFailure) {
      throw result.error;
    }
    return ListPublicationRequestsPresenter.toHttp(result.value);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get publication request detail (ADMIN)' })
  @ApiOkResponse({ type: GetPublicationRequestDetailHttpResponse })
  public async getDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<GetPublicationRequestDetailHttpResponse> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const result = await this.getDetailInteractor.execute({ publicationRequestId: id });
    if (result.isFailure) {
      throw result.error;
    }
    return GetPublicationRequestDetailPresenter.toHttp(result.value);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a publication request (ADMIN)' })
  @ApiOkResponse({ type: ApprovePublicationRequestHttpResponse })
  public async approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApprovePublicationRequestHttpResponse> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const result = await this.approveInteractor.execute({
      publicationRequestId: id,
      decidedByAdminId: user.id.value,
    });
    if (result.isFailure) {
      throw result.error;
    }
    return ApprovePublicationRequestPresenter.toHttp(result.value);
  }

  @Post(':id/start-review')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start review of a publication request (ADMIN)' })
  @ApiOkResponse({ type: StartReviewPublicationRequestHttpResponse })
  public async startReview(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<StartReviewPublicationRequestHttpResponse> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const result = await this.startReviewInteractor.execute({
      publicationRequestId: id,
      startedByAdminId: user.id.value,
    });
    if (result.isFailure) {
      throw result.error;
    }
    return StartReviewPublicationRequestPresenter.toHttp(result.value);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a publication request (ADMIN)' })
  @ApiOkResponse({ type: RejectPublicationRequestHttpResponse })
  public async reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RejectPublicationRequestHttpDto,
  ): Promise<RejectPublicationRequestHttpResponse> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const result = await this.rejectInteractor.execute({
      publicationRequestId: id,
      decidedByAdminId: user.id.value,
      decisionMotive: dto.decisionMotive,
    });
    if (result.isFailure) {
      throw result.error;
    }
    return RejectPublicationRequestPresenter.toHttp(result.value);
  }
}
