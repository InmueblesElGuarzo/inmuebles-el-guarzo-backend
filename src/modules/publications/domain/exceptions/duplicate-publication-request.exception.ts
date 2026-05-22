import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class DuplicatePublicationRequestException extends DomainException {
  public readonly type = DomainErrorType.CONFLICT;
  public readonly code = 'PUBLICATIONS.DUPLICATE_REQUEST';

  constructor(dedupHash: string) {
    super(`A publication request with dedup hash "${dedupHash}" already exists.`);
  }
}
