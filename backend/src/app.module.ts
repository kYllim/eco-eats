import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApplicationModule } from './application/application.module';
import { WebsocketModule } from './interface/websocket/websocket.module';
import { HttpModule } from './interface/http/http.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    ApplicationModule,
    WebsocketModule,
    HttpModule,
  ],
})
export class AppModule {}