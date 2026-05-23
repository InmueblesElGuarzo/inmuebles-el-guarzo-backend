/**
 * StartReviewPublicationRequestInputPort — Contrato del caso de uso StartReviewPublicationRequest.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { InputPort } from '../../../../../../shared-kernel/application/ports/input-port';

import { StartReviewPublicationRequestInput } from './start-review-publication-request-input.dto';
import { StartReviewPublicationRequestOutput } from './start-review-publication-request-output.dto';

export type StartReviewPublicationRequestInputPort = InputPort<
  StartReviewPublicationRequestInput,
  StartReviewPublicationRequestOutput
>;

export const START_REVIEW_PUBLICATION_REQUEST_INPUT_PORT = Symbol(
  'StartReviewPublicationRequestInputPort',
);
