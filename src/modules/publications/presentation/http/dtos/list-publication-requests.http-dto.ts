import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListPublicationRequestsHttpDto {
  @IsOptional()
  @IsIn(['PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'])
  public status?: string;

  @IsOptional()
  @IsUUID()
  public assignedAdvisorId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  public page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  public limit?: number;
}
