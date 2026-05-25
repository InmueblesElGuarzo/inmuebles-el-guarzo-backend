/**
 * PersonalDataAuthorizationRepositoryPort — Puerto de salida para persistir
 * autorizaciones de tratamiento de datos personales (Ley 1581 de 2012).
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { TransactionContext } from '../../../../../shared-kernel/infrastructure/event-bus/event-handler.port';

export interface CreatePersonalDataAuthorizationInput {
  id: string;
  subjectType: 'PUBLICATION_REQUEST';
  subjectId: string;
  titularFullName: string;
  titularDocumentType: string;
  titularDocumentNumber: string;
  authorizedPurposes: string;
  privacyNoticeVersion: string;
  consentIp?: string;
  consentUserAgent?: string;
}

export interface PersonalDataAuthorizationRepositoryPort {
  save(input: CreatePersonalDataAuthorizationInput, tx?: TransactionContext): Promise<void>;
}

export const PERSONAL_DATA_AUTHORIZATION_REPOSITORY = Symbol('PersonalDataAuthorizationRepository');
