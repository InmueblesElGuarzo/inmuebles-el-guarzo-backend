import { DomainErrorType, DomainException } from './domain.exception';

export class InvalidPhoneNumberException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'SHARED.INVALID_PHONE_NUMBER';

  constructor(value: string) {
    super(`The value "${value}" is not a valid phone number.`);
  }
}
