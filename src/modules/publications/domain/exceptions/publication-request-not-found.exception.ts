import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class PublicationRequestNotFoundException extends DomainException {
  public readonly type = DomainErrorType.NOT_FOUND;
  public readonly code = 'PUBLICATIONS.NOT_FOUND';

  constructor(requestId: string) {
    super(`Publication request "${requestId}" was not found.`);
  }
}
