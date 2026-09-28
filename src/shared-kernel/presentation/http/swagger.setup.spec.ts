import { INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { setupSwagger } from './swagger.setup';

describe('setupSwagger', () => {
  const app = {} as INestApplication;
  const document = {} as OpenAPIObject;

  let createDocumentSpy: jest.SpyInstance;
  let setupSpy: jest.SpyInstance;

  beforeEach(() => {
    createDocumentSpy = jest.spyOn(SwaggerModule, 'createDocument').mockReturnValue(document);
    setupSpy = jest.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('no registra Swagger en production', () => {
    setupSwagger(app, 'production');

    expect(createDocumentSpy).not.toHaveBeenCalled();
    expect(setupSpy).not.toHaveBeenCalled();
  });

  it.each(['development', 'test'] as const)('registra Swagger en /api/docs en %s', (nodeEnv) => {
    setupSwagger(app, nodeEnv);

    expect(createDocumentSpy).toHaveBeenCalledWith(app, expect.any(Object));
    expect(setupSpy).toHaveBeenCalledWith('api/docs', app, document);
  });
});
