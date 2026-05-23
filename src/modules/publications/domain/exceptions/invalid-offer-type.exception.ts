import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class InvalidOfferTypeException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'PUBLICATIONS.INVALID_OFFER_TYPE';

  constructor(value: string) {
    super(`"${value}" is not a valid offer type. Valid values: SALE, RENT, BOTH.`);
  }
}
