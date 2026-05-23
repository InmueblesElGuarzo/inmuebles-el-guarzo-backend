import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class PublicationRequestAlreadyDecidedException extends DomainException {
  public readonly type = DomainErrorType.BUSINESS_RULE;
  public readonly code = 'PUBLICATIONS.ALREADY_DECIDED';

  constructor(requestId: string) {
    super(`Publication request "${requestId}" has already been decided and cannot be modified.`);
  }
}
