import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailerModule } from '../../common/mailer/mailer.module';
<<<<<<< HEAD:catequese-bom-pastor-back/src/modules/auth/auth.module.ts
import { S3StorageService } from '../../common/storage/s3-storage.service';
=======
>>>>>>> origin/correcoes-afonso:back/src/modules/auth/auth.module.ts

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    ConfigModule,
    MailerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, S3StorageService],
  exports: [AuthService],
})
export class AuthModule {}
