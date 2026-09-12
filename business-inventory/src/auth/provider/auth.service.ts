import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/provider/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  registerUser() {}
}
