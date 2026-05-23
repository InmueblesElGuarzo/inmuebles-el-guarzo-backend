/**
 * RejectPublicationRequestInputPort — Contrato del caso de uso RejectPublicationRequest.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { InputPort } from '../../../../../../shared-kernel/application/ports/input-port';

import { RejectPublicationRequestInput } from './reject-publication-request-input.dto';
import { RejectPublicationRequestOutput } from './reject-publication-request-output.dto';

export type RejectPublicationRequestInputPort = InputPort<
  RejectPublicationRequestInput,
  RejectPublicationRequestOutput
>;

export const REJECT_PUBLICATION_REQUEST_INPUT_PORT = Symbol('RejectPublicationRequestInputPort');
