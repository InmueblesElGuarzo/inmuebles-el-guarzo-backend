import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class InvalidProposedDescriptionException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'PUBLICATIONS.INVALID_PROPOSED_DESCRIPTION';

  constructor(value: string) {
    const currentLength = value.trim().length;
    let message = '';

    if (currentLength < 20) {
      message = `Proposed description is too short. Minimum 20 characters required, got ${currentLength}.`;
    } else {
      message = `Proposed description is too long. Maximum 2000 characters allowed, got ${currentLength}.`;
    }

    super(message);
  }
}
