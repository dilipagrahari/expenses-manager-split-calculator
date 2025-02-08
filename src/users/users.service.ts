import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword, comparePasswords } from '../utils/hash.helper';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>,
  private jwtService: JwtService,
  private configService: ConfigService) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find({}, { _id: 1, name: 1, email: 1, mobile: 1, age: 1, gender: 1 }).lean();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await hashPassword(createUserDto.password);
    const newUser = new this.userModel(createUserDto);
    return await newUser.save();  // Errors will be handled globally
  }

  async deleteUser(identifier: string): Promise<{ message: string }> {
    const result = await this.userModel.deleteOne({
      $or: [{ _id: identifier }, { email: identifier }],
    });
  
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
  
    return { message: 'User deleted successfully' };
  }

  async updateUser(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password); // Encrypt New Password
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true, // Return updated user
      runValidators: true, // Validate fields
    });
  
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  
    return updatedUser;
  }
  
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).lean();

    if (user && (await comparePasswords(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    // Fallback to default credentials from .env
    const defaultEmail = this.configService.get<string>('DEFAULT_EMAIL');
    const defaultPassword = this.configService.get<string>('DEFAULT_PASSWORD');

    if (email === defaultEmail && password === defaultPassword) {
      return { email: defaultEmail, role: 'admin' };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { email: user.email, sub: user._id };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
  
}
