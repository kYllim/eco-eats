import {
  Controller,
  Sse,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Observable, merge, map } from 'rxjs';
import { feedBus } from '../../../infrastructure/sse/feed.bus';

interface MessageEvent {
  data: string | object;
  type?: string;
}

@Controller('api/feed')
export class FeedController {
  @Sse('stream')
  handleFeedStream(): Observable<MessageEvent> {
    const welcomeEvent: MessageEvent = {
      type: 'welcome',
      data: { message: "Abonné au fil d'actu EcoEats !" },
    };

    const busEvents: Observable<MessageEvent> = feedBus.getStream().pipe(
      map((data) => ({
        data: { title: data.title, content: data.content },
      })),
    );

    return merge(
      new Observable<MessageEvent>((sub) => {
        sub.next(welcomeEvent);
        sub.complete();
      }),
      busEvents,
    );
  }

  @Post('moderator')
  async publishModeratorMessage(
    @Body() body: { title: string; content: string },
  ) {
    try {
      if (!body.title || !body.content) {
        throw new BadRequestException(
          'Le titre et le contenu sont obligatoires.',
        );
      }

      feedBus.broadcast('moderator.announcement', {
        title: `🛡️ [Modérateur] ${body.title}`,
        content: body.content,
      });

      return { success: true, message: "L'actualité a bien été diffusée !" };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la publication',
      );
    }
  }
}
