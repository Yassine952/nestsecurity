import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../entities';
import { CreateResourceDto, UpdateResourceDto } from './dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
  ) {}

  async findAll(userId: number): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({
      where: { id, userId, isActive: true },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async create(createResourceDto: CreateResourceDto, userId: number): Promise<Resource> {
    const resource = this.resourceRepository.create({
      ...createResourceDto,
      userId,
    });

    return this.resourceRepository.save(resource);
  }

  async update(id: number, updateResourceDto: UpdateResourceDto, userId: number): Promise<Resource> {
    const resource = await this.findOne(id, userId);
    
    Object.assign(resource, updateResourceDto);
    return this.resourceRepository.save(resource);
  }

  async remove(id: number, userId: number): Promise<void> {
    const resource = await this.findOne(id, userId);
    await this.resourceRepository.update(id, { isActive: false });
  }

  async findAllForAdmin(): Promise<Resource[]> {
    return this.resourceRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
} 