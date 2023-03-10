import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { SeedService } from './seed.service';

@ApiTags('Seeds')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @Auth(ValidRoles.admin)
  exectuedSeed() {
    return this.seedService.runSeed();
  }
 
}
