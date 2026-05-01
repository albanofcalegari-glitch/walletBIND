import { Module } from '@nestjs/common';
import { PositionController } from './position.controller';
import { PositionNestService } from './position-nest.service';

@Module({
  controllers: [PositionController],
  providers: [PositionNestService],
  exports: [PositionNestService],
})
export class PositionModule {}
