/**
 * PersonalDataAuthorizationPrismaRepositoryAdapter — Implementación del puerto
 * de salida para persistir autorizaciones de datos personales usando Prisma.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { Injectable } from '@nestjs/common';

import { TransactionContext } from '../../../../../shared-kernel/infrastructure/event-bus/event-handler.port';
import { PrismaService } from '../../../../../shared-kernel/infrastructure/prisma/prisma.service';

import {
  CreatePersonalDataAuthorizationInput,
  PersonalDataAuthorizationRepositoryPort,
} from '../../../application/ports/output/personal-data-authorization.repository.port';

@Injectable()
export class PersonalDataAuthorizationPrismaRepositoryAdapter implements PersonalDataAuthorizationRepositoryPort {
  public constructor(private readonly prisma: PrismaService) {}

  public async save(
    input: CreatePersonalDataAuthorizationInput,
    tx?: TransactionContext,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.personalDataAuthorization.create({
      data: {
        id: input.id,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        titularFullName: input.titularFullName,
        titularDocumentType: input.titularDocumentType,
        titularDocumentNumber: input.titularDocumentNumber,
        authorizedPurposes: input.authorizedPurposes,
        privacyNoticeVersion: input.privacyNoticeVersion,
        consentIp: input.consentIp ?? null,
        consentUserAgent: input.consentUserAgent ?? null,
      },
    });
  }
}
