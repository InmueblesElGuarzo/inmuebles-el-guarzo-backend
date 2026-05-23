import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class InvalidPublicationRequestStatusTransitionException extends DomainException {
  public readonly type = DomainErrorType.BUSINESS_RULE;
  public readonly code = 'PUBLICATIONS.INVALID_STATUS_TRANSITION';

  constructor(from: string, to: string) {
    super(`Cannot transition publication request from "${from}" to "${to}".`);
  }
}
