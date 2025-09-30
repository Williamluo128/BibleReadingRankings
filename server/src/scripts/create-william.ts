import { prisma } from '../config/database';
import bcrypt from 'bcrypt';

async function createWilliam() {
  try {
    console.log('Creating William admin account...');
    
    // Check if William already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'williamitouch@gmail.com' },
          { username: 'WilliamL' }
        ]
      }
    });

    if (existingUser) {
      console.log('William account exists, updating password...');
      
      // Update password
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          passwordHash: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ William account password updated!');
    } else {
      console.log('Creating new William account...');
      
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      await prisma.user.create({
        data: {
          username: 'WilliamL',
          email: 'williamitouch@gmail.com',
          displayName: 'William L',
          passwordHash: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ William account created!');
    }
    
    console.log('\n📋 Login credentials:');
    console.log('Email: williamitouch@gmail.com');
    console.log('Username: WilliamL');
    console.log('Password: password123');
    console.log('Role: SUPER_ADMIN');
    
  } catch (error) {
    console.error('Error creating William account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWilliam();