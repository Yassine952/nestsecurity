import { DataSource } from 'typeorm';
import { User, Role, Resource } from '../../entities';

const dataSourceOptions = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'app',
  entities: [User, Role, Resource],
  synchronize: true,
  logging: true,
};

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    const roleRepository = dataSource.getRepository(Role);

    // Check if roles already exist
    const existingRoles = await roleRepository.find();
    if (existingRoles.length > 0) {
      console.log('Roles already exist, skipping seeding');
      return;
    }

    // Create default roles
    const roles = [
      { name: 'USER', description: 'Regular user role' },
      { name: 'ADMIN', description: 'Administrator role' },
      { name: 'MODERATOR', description: 'Moderator role' },
    ];

    for (const roleData of roles) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`Role ${roleData.name} created successfully`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed(); 