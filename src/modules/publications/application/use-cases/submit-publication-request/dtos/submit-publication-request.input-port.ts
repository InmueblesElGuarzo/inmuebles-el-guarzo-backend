/**
 * SubmitPublicationRequestInputPort — Contrato del caso de uso SubmitPublicationRequest.
 *
 * Lo implementa SubmitPublicationRequestInteractor. Los controllers dependen
 * solo de esta interfaz via Symbol token.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { InputPort } from '../../../../../../shared-kernel/application/ports/input-port';

import { SubmitPublicationRequestInput } from './submit-publication-request-input.dto';
import { SubmitPublicationRequestOutput } from './submit-publication-request-output.dto';

export type SubmitPublicationRequestInputPort = InputPort<
  SubmitPublicationRequestInput,
  SubmitPublicationRequestOutput
>;

export const SUBMIT_PUBLICATION_REQUEST_INPUT_PORT = Symbol('SubmitPublicationRequestInputPort');
