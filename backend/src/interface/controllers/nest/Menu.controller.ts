import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { GetConsumable } from '../../../application/use-cases/Consumable/GetConsumable';
import {
  UpdateConsumable,
  type UpdateConsumableDTO,
} from '../../../application/use-cases/Consumable/UpdateConsumable';
import { RemoveConsumable } from '../../../application/use-cases/Consumable/RemoveConsumable';

@Controller('menu')
export class MenuController {
  constructor(
    private readonly getConsumable: GetConsumable,
    private readonly updateConsumable: UpdateConsumable,
    private readonly removeConsumable: RemoveConsumable,
  ) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    const consumable = await this.getConsumable.execute(id);
    if (!consumable) throw new BadRequestException('PLAT_INTROUVABLE');
    return consumable;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateConsumableDTO) {
    return await this.updateConsumable.execute(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.removeConsumable.execute(id);
    return { ok: true };
  }
}
