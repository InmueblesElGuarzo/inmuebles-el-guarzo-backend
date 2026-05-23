import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class InvalidProposedLocationException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'PUBLICATIONS.INVALID_PROPOSED_LOCATION';

  constructor(value: string) {
    super(`Proposed location "${value}" is invalid. Must be between 1 and 300 characters.`);
  }
}
