/**
 * SubmitPublicationRequestInteractor — Implementacion del caso de uso SubmitPublicationRequest.
 *
 * Flujo:
 *   1. Verificar token CAPTCHA contra Cloudflare Turnstile.
 *   2. Calcular dedupHash (SHA-256 de email + location + offerType).
 *   3. Verificar que no exista una solicitud con ese hash (anti-spam).
 *   4. Obtener el siguiente numero de referencia para el año en curso.
 *   5. Construir los VOs y llamar a PublicationRequest.submit().
 *   6. Persistir y publicar eventos de dominio.
 *
 * Errores de dominio que retorna en Result.fail:
 *   - DuplicatePublicationRequestException: solicitud duplicada detectada.
 *   - InvalidCaptchaException: token CAPTCHA inválido o expirado.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { createHash } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { DomainException } from '../../../../../shared-kernel/domain/exceptions/domain.exception';
import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { Result } from '../../../../../shared-kernel/domain/result';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { Email } from '../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { PhoneNumber } from '../../../../../shared-kernel/domain/value-objects/phone-number.value-object';
import {
  EVENT_BUS,
  EventBus,
} from '../../../../../shared-kernel/infrastructure/event-bus/event-bus.port';

import {
  CreatePublicationRequestInput,
  PublicationRequest,
} from '../../../domain/aggregates/publication-request.aggregate';
import { DuplicatePublicationRequestException } from '../../../domain/exceptions/duplicate-publication-request.exception';
import { InvalidCaptchaException } from '../../../domain/exceptions/invalid-captcha.exception';
import { ProposedDescription } from '../../../domain/value-objects/proposed-description.value-object';
import { ProposedLocation } from '../../../domain/value-objects/proposed-location.value-object';
import { PublicationRequestOfferType } from '../../../domain/value-objects/publication-request-offer-type.value-object';
import { ReferenceNumber } from '../../../domain/value-objects/reference-number.value-object';
import { CAPTCHA_VERIFIER, CaptchaVerifierPort } from '../../ports/output/captcha-verifier.port';
import {
  PUBLICATION_REQUEST_REPOSITORY,
  PublicationRequestRepositoryPort,
} from '../../ports/output/publication-request.repository.port';

import { SubmitPublicationRequestInput } from './dtos/submit-publication-request-input.dto';
import { SubmitPublicationRequestOutput } from './dtos/submit-publication-request-output.dto';
import { SubmitPublicationRequestInputPort } from './dtos/submit-publication-request.input-port';

@Injectable()
export class SubmitPublicationRequestInteractor implements SubmitPublicationRequestInputPort {
  public constructor(
    @Inject(PUBLICATION_REQUEST_REPOSITORY)
    private readonly repo: PublicationRequestRepositoryPort,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBus,
    @Inject(CAPTCHA_VERIFIER)
    private readonly captchaVerifier: CaptchaVerifierPort,
  ) {}

  public async execute(
    input: SubmitPublicationRequestInput,
  ): Promise<Result<SubmitPublicationRequestOutput, DomainException>> {
    // Paso 1 — verificar CAPTCHA
    const captchaValid = await this.captchaVerifier.verify(input.captchaToken);
    if (!captchaValid) {
      return Result.fail(new InvalidCaptchaException());
    }

    // Paso 2 — deduplicación
    const dedupHash = SubmitPublicationRequestInteractor.buildDedupHash(
      input.ownerEmail,
      input.proposedLocation,
      input.proposedOfferType,
    );
    const existing = await this.repo.findByDedupHash(dedupHash);
    if (existing.isPresent()) {
      return Result.fail(new DuplicatePublicationRequestException(dedupHash));
    }

    // Paso 3 — número de referencia
    const year = new Date().getFullYear();
    const sequence = await this.repo.nextReferenceNumber(year);

    // Paso 4 — crear agregado y persistir
    const createInput = SubmitPublicationRequestInteractor.buildCreateInput(
      input,
      year,
      sequence,
      dedupHash,
    );
    const request = PublicationRequest.submit(createInput);
    await this.repo.save(request);
    const events = request.pullDomainEvents();
    await this.eventBus.publish(events);

    return Result.ok(SubmitPublicationRequestInteractor.toOutput(request));
  }

  private static buildDedupHash(email: string, location: string, offerType: string): string {
    return createHash('sha256').update(`${email}|${location}|${offerType}`).digest('hex');
  }

  private static buildCreateInput(
    input: SubmitPublicationRequestInput,
    year: number,
    sequence: number,
    dedupHash: string,
  ): CreatePublicationRequestInput {
    return {
      id: UniqueId.generate(),
      referenceNumber: ReferenceNumber.generate(year, sequence),
      ownerFullName: FullName.create(input.ownerFullName),
      ownerEmail: Email.create(input.ownerEmail),
      ownerPhonePrimary: PhoneNumber.create(input.ownerPhonePrimary),
      ownerPhoneSecondary: Maybe.fromNullable(input.ownerPhoneSecondary).map((v) =>
        PhoneNumber.create(v),
      ),
      ownerDocumentType: Maybe.fromNullable(input.ownerDocumentType),
      ownerDocumentNumber: Maybe.fromNullable(input.ownerDocumentNumber),
      proposedPropertyTypeId: Maybe.fromNullable(input.proposedPropertyTypeId).map((v) =>
        UniqueId.fromString(v),
      ),
      proposedOfferType: PublicationRequestOfferType.create(input.proposedOfferType),
      proposedLocation: ProposedLocation.create(input.proposedLocation),
      proposedAreaM2: Maybe.fromNullable(input.proposedAreaM2),
      proposedDescription: ProposedDescription.create(input.proposedDescription),
      proposedExpectedPrice: Maybe.fromNullable(input.proposedExpectedPrice),
      captchaValidated: true,
      submittedFromIp: Maybe.fromNullable(input.submittedFromIp),
      submittedFromUserAgent: Maybe.fromNullable(input.submittedFromUserAgent),
      dedupHash,
    };
  }

  private static toOutput(request: PublicationRequest): SubmitPublicationRequestOutput {
    return {
      id: request.id.value,
      referenceNumber: request.referenceNumber.value,
      status: request.status.value,
      createdAt: request.createdAt,
    };
  }
}
