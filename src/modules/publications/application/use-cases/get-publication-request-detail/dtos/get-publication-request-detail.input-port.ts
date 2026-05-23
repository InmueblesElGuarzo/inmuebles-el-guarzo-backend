/**
 * GetPublicationRequestDetailInputPort — Contrato del caso de uso GetPublicationRequestDetail.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { InputPort } from '../../../../../../shared-kernel/application/ports/input-port';

import { GetPublicationRequestDetailInput } from './get-publication-request-detail-input.dto';
import { GetPublicationRequestDetailOutput } from './get-publication-request-detail-output.dto';

export type GetPublicationRequestDetailInputPort = InputPort<
  GetPublicationRequestDetailInput,
  GetPublicationRequestDetailOutput
>;

export const GET_PUBLICATION_REQUEST_DETAIL_INPUT_PORT = Symbol(
  'GetPublicationRequestDetailInputPort',
);
