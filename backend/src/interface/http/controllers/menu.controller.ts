import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { GetConsumable } from '../../../application/usecases/Consumable/GetConsumable';
import { UpdateConsumable } from '../../../application/usecases/Consumable/UpdateConsumable';
import { RemoveConsumable } from '../../../application/usecases/Consumable/RemoveConsumable';
import { AddConsumable } from '../../../application/usecases/Consumable/AddConsumable';
import { feedBus } from '../../../infrastructure/sse/feed.bus';
import { RESTAURANT_REPOSITORY } from '../../../domain/ports/tokens';
import type { IRestaurantRepository } from '../../../domain/ports/repositories';

@Controller('api/menu')
export class MenuController {
  constructor(
    private readonly getConsumable: GetConsumable,
    private readonly updateConsumable: UpdateConsumable,
    private readonly removeConsumable: RemoveConsumable,
    private readonly addConsumable: AddConsumable,
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: IRestaurantRepository,
  ) {}

  /**
   * Ajoute un nouveau plat (et déclenche le flux SSE via le usecase)
   * POST /api/menu
   */
  @Post()
  async handleCreate(@Body() body: any) {
    try {
      const createdConsumable = await this.addConsumable.execute(body);

      try {
        const restaurant = await this.restaurantRepository.findById(
          body.restaurantId,
        );
        const restaurantName = restaurant ? restaurant.name : 'Un restaurant';

        feedBus.broadcast('menu.item.added', {
          title: `${restaurantName} a ajouté ${body.name} !`,
          content: body.description,
        });
      } catch (sseError) {
        console.error("Erreur lors de l'émission sur le feedBus:", sseError);
      }

      return createdConsumable;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Erreur lors du create',
      );
    }
  }

  /**
   * Récupère un plat spécifique par son identifiant.
   * GET /api/menu/:id
   */
  @Get(':id')
  async handleGet(@Param('id') id: string) {
    try {
      const consumable = await this.getConsumable.execute(id);
      if (!consumable) {
        throw new NotFoundException('PLAT_INTROUVABLE');
      }
      return consumable;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération',
      );
    }
  }

  /**
   * Met à jour les informations d'un plat.
   * PUT /api/menu/:id
   */
  @Put(':id')
  async handleUpdate(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.updateConsumable.execute(id, body);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour',
      );
    }
  }

  /**
   * Supprime un plat.
   * DELETE /api/menu/:id
   */
  @Delete(':id')
  @HttpCode(204)
  async handleRemove(@Param('id') id: string) {
    try {
      await this.removeConsumable.execute(id);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression',
      );
    }
  }
}
