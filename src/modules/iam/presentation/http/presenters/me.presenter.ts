/**
 * MePresenter — Transforma el GetCurrentUserOutput (DTO interno del use
 * case) a la forma JSON exacta que devolvemos al cliente HTTP.
 *
 * → CAPA: Interface Adapters (Uncle Bob)
 */

import { ApiProperty } from '@nestjs/swagger';
import { GetCurrentUserOutput } from '../../../application/use-cases/get-current-user/dtos/get-current-user-output.dto';

export class MeHttpResponse {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty({ example: 'admin@inmuebleselguarzo.com.co' })
  public email!: string;

  @ApiProperty({ example: 'Juan Carlos Pérez' })
  public fullName!: string;

  @ApiProperty({ nullable: true, example: '+57 300 123 4567' })
  public phone!: string | null;

  @ApiProperty({ enum: ['ADMIN', 'ADVISOR'], example: 'ADMIN' })
  public role!: string;

  @ApiProperty({ example: true })
  public isActive!: boolean;

  @ApiProperty({ nullable: true, format: 'date-time' })
  public lastLoginAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  public createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  public updatedAt!: string;
}

export class MePresenter {
  public static toHttp(output: GetCurrentUserOutput): MeHttpResponse {
    return {
      id: output.id,
      email: output.email,
      fullName: output.fullName,
      phone: output.phone ?? null,
      role: output.role,
      isActive: output.isActive,
      lastLoginAt: output.lastLoginAt?.toISOString() ?? null,
      createdAt: output.createdAt.toISOString(),
      updatedAt: output.updatedAt.toISOString(),
    };
  }
}
