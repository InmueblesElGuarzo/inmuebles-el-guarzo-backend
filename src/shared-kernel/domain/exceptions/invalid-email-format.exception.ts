import { DomainErrorType, DomainException } from './domain.exception';

export class InvalidEmailFormatException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'IAM.INVALID_EMAIL_FORMAT';

  constructor(value: string) {
    super(`The value "${value}" is not a valid email address.`);
  }
}
