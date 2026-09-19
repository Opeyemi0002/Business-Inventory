import { Injectable } from '@nestjs/common';
import { HashService } from './hash.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService implements HashService {
  async hashPassword(data: string | Buffer) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data, salt);
    return passwordHash;
  }

  async comparePassword(data: string | Buffer, encrypted: string) {
    const confirmPassword = await bcrypt.compare(data, encrypted);
    return confirmPassword;
  }
}
