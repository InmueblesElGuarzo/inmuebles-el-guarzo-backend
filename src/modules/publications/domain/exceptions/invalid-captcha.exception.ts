import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class InvalidCaptchaException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'PUBLICATIONS.INVALID_CAPTCHA';

  public constructor() {
    super('El token de verificación CAPTCHA es inválido o ha expirado.');
  }
}
