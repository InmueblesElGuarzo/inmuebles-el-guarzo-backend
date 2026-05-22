/**
 * ListPublicationRequestsInputPort — Contrato del caso de uso ListPublicationRequests.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { InputPort } from '../../../../../../shared-kernel/application/ports/input-port';

import { ListPublicationRequestsInput } from './list-publication-requests-input.dto';
import { ListPublicationRequestsOutput } from './list-publication-requests-output.dto';

export type ListPublicationRequestsInputPort = InputPort<
  ListPublicationRequestsInput,
  ListPublicationRequestsOutput
>;

export const LIST_PUBLICATION_REQUESTS_INPUT_PORT = Symbol('ListPublicationRequestsInputPort');
