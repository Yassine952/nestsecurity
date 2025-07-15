import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/users.service';
import { User } from '../entities';
import { RegisterDto, LoginDto, TwoFactorDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password } = registerDto;
    
    const user = await this.usersService.create(email, password);
    
    // Generate verification token
    const verificationToken = await this.usersService.generateEmailVerificationToken();
    await this.usersService.setEmailVerificationToken(user, verificationToken);
    
    // Send verification email
    await this.sendVerificationEmail(user, verificationToken);
    
    return { message: 'User registered successfully. Please check your email to verify your account.' };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; requires_2fa?: boolean }> {
    const { email, password } = loginDto;
    
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(user, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    if (user.isTwoFactorEnabled) {
      // Generate and send 2FA code
      const twoFactorCode = await this.usersService.generateTwoFactorCode();
      await this.usersService.setTwoFactorCode(user, twoFactorCode);
      await this.sendTwoFactorCode(user, twoFactorCode);
      
      return { 
        access_token: this.generateTempToken(user),
        requires_2fa: true 
      };
    }

    return { access_token: this.generateToken(user) };
  }

  async verifyTwoFactor(user: any, twoFactorDto: TwoFactorDto): Promise<{ access_token: string }> {
    const { code } = twoFactorDto;
    
    // Fetch the complete user entity from database
    const fullUser = await this.usersService.findOneById(user.id);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    
    const isValid = await this.usersService.verifyTwoFactorCode(fullUser, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired 2FA code');
    }

    return { access_token: this.generateToken(fullUser) };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    await this.usersService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = await this.usersService.generateEmailVerificationToken();
    await this.usersService.setEmailVerificationToken(user, verificationToken);
    await this.sendVerificationEmail(user, verificationToken);

    return { message: 'Verification email sent' };
  }

  async enableTwoFactor(user: User): Promise<{ message: string }> {
    await this.usersService.enableTwoFactor(user);
    return { message: 'Two-factor authentication enabled' };
  }

  async disableTwoFactor(user: User): Promise<{ message: string }> {
    await this.usersService.disableTwoFactor(user);
    return { message: 'Two-factor authentication disabled' };
  }

  async getUserProfile(userId: number): Promise<User> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private generateToken(user: User): string {
    const payload = { 
      sub: user.id, 
      email: user.email,
      roles: user.roles?.map(role => role.name) || [],
      verified: true 
    };
    return this.jwtService.sign(payload);
  }

  private generateTempToken(user: User): string {
    const payload = { 
      sub: user.id, 
      email: user.email,
      roles: user.roles?.map(role => role.name) || [],
      verified: false,
      temp: true 
    };
    return this.jwtService.sign(payload, { expiresIn: '10m' });
  }

  private async sendVerificationEmail(user: User, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Email Verification',
      template: 'verification', // You'll need to create this template
      context: {
        name: user.email,
        verificationUrl,
      },
    });
  }

  private async sendTwoFactorCode(user: User, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Two-Factor Authentication Code',
      template: 'two-factor', // You'll need to create this template
      context: {
        name: user.email,
        code,
      },
    });
  }
} 