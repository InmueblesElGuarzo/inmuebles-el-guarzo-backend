import { DomainErrorType, DomainException } from './domain.exception';

export class InvalidFullNameException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'IAM.INVALID_FULL_NAME';

  constructor(value: string) {
    super(
      `The value "${value}" is not a valid full name. Must be between 2 and 150 characters after trimming, contain no control characters, and include at least one space separating name and surname.`,
    );
  }
}
