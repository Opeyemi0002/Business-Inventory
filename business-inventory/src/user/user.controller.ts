import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from './provider/user.service';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { AssignPermissionDto } from './Dtos/assign-permission.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('admin-permission')
  @UseGuards(SuperAdminGuard)
  async changeUserPermission(@Body() body: AssignPermissionDto) {
    return this.userService.createPermission(body);
  }
}
