import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { LoginDto } from './dto';

interface UserPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly users: Record<string, { password: string }> = {
    'admin@contactship.com': {
      password: '',
    },
  };

  constructor(private readonly jwtService: JwtService) {
    void hash('admin123', 10).then((hashed) => {
      this.users['admin@contactship.com'].password = hashed;
    });
  }

  async validateUser(email: string, password: string): Promise<UserPayload> {
    const user = this.users[email];
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      sub: email,
      email,
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = { sub: user.sub, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
