import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as flash from 'express-flash';
import * as session from 'express-session';
import * as methodOverride from 'method-override';
import * as exphbs from 'express-handlebars';
import { join } from 'path';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './common/filters/not-found-exception.filter';
import { helpers } from './common/helpers/hbs-functions'; 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  const hbs = exphbs.create({
    extname: '.hbs',
    layoutsDir: join(__dirname, '..', 'src/views/_layouts'),
    partialsDir: join(__dirname, '..', 'src/views/_partials'),
    defaultLayout: 'main',
    helpers, 
  });

  app.setBaseViewsDir(join(__dirname, '..', 'src/views'));

  app.engine('.hbs', hbs.engine);
  app.setViewEngine('hbs');

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.use(methodOverride('_method'));
  app.use(flash());
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.useGlobalFilters(new NotFoundExceptionFilter());
  const port = process.env.PORT || 3333;
  await app.listen(port, () =>
    Logger.log(`Server running on port ${port}`, 'Bootstrap'),
  );
}

void bootstrap();
