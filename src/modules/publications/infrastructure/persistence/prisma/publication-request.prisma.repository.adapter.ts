/**
 * PublicationRequestPrismaRepositoryAdapter — Implementacion de PublicationRequestRepositoryPort
 * usando Prisma como ORM contra Postgres (Neon).
 *
 * Responsabilidad unica: traducir entre el modelo Prisma y el aggregate de dominio
 * usando PublicationRequestMapper. La logica de negocio no vive aqui.
 *
 * El parametro opcional tx permite operar dentro de una $transaction de Prisma
 * o directamente sobre el pool para lecturas standalone.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob)
 */

import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { TransactionContext } from '../../../../../shared-kernel/infrastructure/event-bus/event-handler.port';
import { PrismaService } from '../../../../../shared-kernel/infrastructure/prisma/prisma.service';

import {
  ListPublicationRequestsFilters,
  PublicationRequestRepositoryPort,
} from '../../../application/ports/output/publication-request.repository.port';
import { PublicationRequest } from '../../../domain/aggregates/publication-request.aggregate';
import { PublicationRequestMapper } from './mappers/publication-request.mapper';

@Injectable()
export class PublicationRequestPrismaRepositoryAdapter implements PublicationRequestRepositoryPort {
  private readonly logger = new Logger(PublicationRequestPrismaRepositoryAdapter.name);

  public constructor(private readonly prisma: PrismaService) {}

  public async findById(id: UniqueId, tx?: TransactionContext): Promise<Maybe<PublicationRequest>> {
    const client = tx ?? this.prisma;
    const model = await client.publicationRequest.findUnique({ where: { id: id.value } });
    return model
      ? Maybe.some(PublicationRequestMapper.toDomain(model))
      : Maybe.none<PublicationRequest>();
  }

  public async findByDedupHash(
    hash: string,
    tx?: TransactionContext,
  ): Promise<Maybe<PublicationRequest>> {
    const client = tx ?? this.prisma;
    const model = await client.publicationRequest.findUnique({ where: { dedupHash: hash } });
    return model
      ? Maybe.some(PublicationRequestMapper.toDomain(model))
      : Maybe.none<PublicationRequest>();
  }

  public async save(request: PublicationRequest, tx?: TransactionContext): Promise<void> {
    const client = tx ?? this.prisma;
    const data = PublicationRequestMapper.toPersistence(request);
    await client.publicationRequest.upsert({
      where: { id: request.id.value },
      create: data,
      update: data,
    });
  }

  public async findAll(
    filters: ListPublicationRequestsFilters,
    tx?: TransactionContext,
  ): Promise<[PublicationRequest[], number]> {
    const client = tx ?? this.prisma;
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 50);
    const where = PublicationRequestPrismaRepositoryAdapter.buildWhere(filters);
    const items = await client.publicationRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await client.publicationRequest.count({ where });
    const mapped = items.reduce<PublicationRequest[]>((acc, m) => {
      try {
        acc.push(PublicationRequestMapper.toDomain(m));
      } catch {
        this.logger.warn(`Skipping invalid publication request ${m.id}: failed domain mapping`);
      }
      return acc;
    }, []);
    return [mapped, total];
  }

  public async nextReferenceNumber(year: number, tx?: TransactionContext): Promise<number> {
    const client = tx ?? this.prisma;
    const count = await client.publicationRequest.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    });
    return count + 1;
  }

  private static buildWhere(
    filters: ListPublicationRequestsFilters,
  ): Prisma.PublicationRequestWhereInput {
    const where: Prisma.PublicationRequestWhereInput = {};
    if (filters.status !== undefined) {
      where.status = filters.status;
    }
    if (filters.assignedAdvisorId !== undefined) {
      where.assignedAdvisorId = filters.assignedAdvisorId;
    }
    return where;
  }
}
