import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class InvalidReferenceNumberException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'PUBLICATIONS.INVALID_REFERENCE_NUMBER';

  constructor(value: string) {
    super(`The value "${value}" is not a valid reference number. Expected format: PUB-YYYY-NNNNN.`);
  }
}
