import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { GroupRoleGuard } from '../auth/guards/group-role.guard';
import { GroupRoles } from '../auth/decorators/group-roles.decorator';
import { CreateMemberDto } from './dto/create-member.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(GroupRoleGuard)
  @GroupRoles('group_admin')
  @Post(':groupId/members')
  createMember(
    @Param('groupId') groupId: string,
    @Body() dto: CreateMemberDto,
  ) {
    return this.groupsService.createMember(groupId, dto);
  }
}
