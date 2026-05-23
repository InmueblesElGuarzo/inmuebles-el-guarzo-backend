import {
  DomainErrorType,
  DomainException,
} from '../../../../shared-kernel/domain/exceptions/domain.exception';

export class InvalidProposedDescriptionException extends DomainException {
  public readonly type = DomainErrorType.VALIDATION;
  public readonly code = 'PUBLICATIONS.INVALID_PROPOSED_DESCRIPTION';

  constructor(value: string) {
    super(
      `Proposed description is too short. Minimum 20 characters required, got "${value.length}".`,
    );
  }
}
