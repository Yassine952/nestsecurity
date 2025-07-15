import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../entities';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async create(email: string, password: string): Promise<User> {
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    // Assign default role
    const defaultRole = await this.roleRepository.findOne({
      where: { name: 'USER' },
    });
    if (defaultRole) {
      user.roles = [defaultRole];
    }

    return this.userRepository.save(user);
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async generateEmailVerificationToken(): Promise<string> {
    return Math.random().toString(36).substr(2, 15);
  }

  async generateTwoFactorCode(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async setEmailVerificationToken(user: User, token: string): Promise<void> {
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.userRepository.save(user);
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });
    
    const updatedUser = await this.userRepository.findOne({ where: { id: user.id } });
    if (!updatedUser) {
      throw new BadRequestException('User not found after verification');
    }
    
    return updatedUser;
  }

  async setTwoFactorCode(user: User, code: string): Promise<void> {
    user.twoFactorCode = code;
    user.twoFactorCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await this.userRepository.save(user);
  }

  async verifyTwoFactorCode(user: User, code: string): Promise<boolean> {
    if (!user.twoFactorCode || !user.twoFactorCodeExpires || user.twoFactorCodeExpires < new Date()) {
      return false;
    }

    const isValid = user.twoFactorCode === code;
    if (isValid) {
      await this.userRepository.update(user.id, {
        twoFactorCode: null,
        twoFactorCodeExpires: null,
      });
    }

    return isValid;
  }

  async enableTwoFactor(user: User): Promise<void> {
    user.isTwoFactorEnabled = true;
    await this.userRepository.save(user);
  }

  async disableTwoFactor(user: User): Promise<void> {
    await this.userRepository.update(user.id, {
      isTwoFactorEnabled: false,
      twoFactorSecret: null,
    });
  }
} 