import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for frontend integration
  app.enableCors();

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Smart Home Assistant is running on: http://localhost:${port}`);
  console.log(`🌐 Web Interface: http://localhost:${port}/index.html`);
  console.log(`📋 Health check: http://localhost:${port}/assistant/health`);
  console.log(`💡 Don't forget to set your OPENAI_API_KEY in the .env file!`);
}
bootstrap();
