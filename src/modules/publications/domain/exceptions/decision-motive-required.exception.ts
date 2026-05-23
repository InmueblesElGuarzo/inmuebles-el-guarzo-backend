import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class DecisionMotiveRequiredException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'PUBLICATIONS.DECISION_MOTIVE_REQUIRED';

  constructor() {
    super('A rejection motive is required when rejecting a publication request.');
  }
}
