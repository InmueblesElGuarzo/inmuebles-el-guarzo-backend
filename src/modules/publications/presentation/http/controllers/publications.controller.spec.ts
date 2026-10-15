import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { Result } from '../../../../../shared-kernel/domain/result';
import { UPSTASH_REDIS } from '../../../../../shared-kernel/infrastructure/cache/cache.module';
import { APPROVE_PUBLICATION_REQUEST_INPUT_PORT } from '../../../application/use-cases/approve-publication-request/dtos/approve-publication-request.input-port';
import { GET_PUBLICATION_REQUEST_DETAIL_INPUT_PORT } from '../../../application/use-cases/get-publication-request-detail/dtos/get-publication-request-detail.input-port';
import { LIST_PUBLICATION_REQUESTS_INPUT_PORT } from '../../../application/use-cases/list-publication-requests/dtos/list-publication-requests.input-port';
import { REJECT_PUBLICATION_REQUEST_INPUT_PORT } from '../../../application/use-cases/reject-publication-request/dtos/reject-publication-request.input-port';
import { START_REVIEW_PUBLICATION_REQUEST_INPUT_PORT } from '../../../application/use-cases/start-review-publication-request/dtos/start-review-publication-request.input-port';
import { SUBMIT_PUBLICATION_REQUEST_INPUT_PORT } from '../../../application/use-cases/submit-publication-request/dtos/submit-publication-request.input-port';

import { PublicationsController } from './publications.controller';

const SUBMIT_OUTPUT = {
  id: 'b3f1c2d4-0000-4000-8000-000000000001',
  referenceNumber: 'PUB-2026-00001',
  status: 'PENDING_REVIEW',
  createdAt: new Date('2026-10-14T00:00:00Z'),
};

describe('PublicationsController', () => {
  let app: INestApplication<App>;
  const submitInteractor = { execute: jest.fn().mockResolvedValue(Result.ok(SUBMIT_OUTPUT)) };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PublicationsController],
      providers: [
        { provide: SUBMIT_PUBLICATION_REQUEST_INPUT_PORT, useValue: submitInteractor },
        { provide: LIST_PUBLICATION_REQUESTS_INPUT_PORT, useValue: {} },
        { provide: GET_PUBLICATION_REQUEST_DETAIL_INPUT_PORT, useValue: {} },
        { provide: APPROVE_PUBLICATION_REQUEST_INPUT_PORT, useValue: {} },
        { provide: REJECT_PUBLICATION_REQUEST_INPUT_PORT, useValue: {} },
        { provide: START_REVIEW_PUBLICATION_REQUEST_INPUT_PORT, useValue: {} },
        { provide: UPSTASH_REDIS, useValue: {} },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('submit', () => {
    it('should pass X-Original-Client-IP to the use case as submittedFromIp', async () => {
      await request(app.getHttpServer())
        .post('/publications')
        .set('X-Original-Client-IP', '1.2.3.4')
        .set('CF-Connecting-IP', '5.6.7.8')
        .send({})
        .expect(201);

      expect(submitInteractor.execute).toHaveBeenCalledWith(
        expect.objectContaining({ submittedFromIp: '1.2.3.4' }),
      );
    });

    it('should pass submittedFromIp undefined when X-Original-Client-IP is missing', async () => {
      await request(app.getHttpServer()).post('/publications').send({}).expect(201);

      expect(submitInteractor.execute).toHaveBeenLastCalledWith(
        expect.objectContaining({ submittedFromIp: undefined }),
      );
    });
  });
});
