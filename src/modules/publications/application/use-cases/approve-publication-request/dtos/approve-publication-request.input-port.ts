/**
 * ApprovePublicationRequestInputPort — Contrato del caso de uso ApprovePublicationRequest.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { InputPort } from '../../../../../../shared-kernel/application/ports/input-port';

import { ApprovePublicationRequestInput } from './approve-publication-request-input.dto';
import { ApprovePublicationRequestOutput } from './approve-publication-request-output.dto';

export type ApprovePublicationRequestInputPort = InputPort<
  ApprovePublicationRequestInput,
  ApprovePublicationRequestOutput
>;

export const APPROVE_PUBLICATION_REQUEST_INPUT_PORT = Symbol('ApprovePublicationRequestInputPort');
