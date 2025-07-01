import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register new user with correct parameters', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test User',
        lastName: 'sample',
        role: UserRole.STUDENT
      };

      const expectedResult = {
        access_token: 'jwt-token-here',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test User',
          lastName: 'sample',
          role: UserRole.STUDENT
        }
      };

      mockAuthService.register.mockResolvedValue(expectedResult);
      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle registration errors', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test User',
        lastName: 'sample'
      };

      const error = new Error('Email already exists');
      mockAuthService.register.mockRejectedValue(error);
      await expect(controller.register(registerDto)).rejects.toThrow(error);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should return user data without password', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test User',
        lastName: 'sample'
      };

      const expectedResult = {
        access_token: 'jwt-token-here',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test User',
          lastName: 'sample',
          role: UserRole.STUDENT
        }
      };

      mockAuthService.register.mockResolvedValue(expectedResult);
      const result = await controller.register(registerDto);
      expect(result.user).not.toHaveProperty('password');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should login user with correct parameters', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        access_token: 'jwt-token-here',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test User',
          lastName: 'sample',
          role: UserRole.STUDENT
        }
      };

      mockAuthService.login.mockResolvedValue(expectedResult);
      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle login errors', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);
      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return access token and user data', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        access_token: 'jwt-token-here',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test User',
          lastName: 'sample',
          role: UserRole.STUDENT
        }
      };

      mockAuthService.login.mockResolvedValue(expectedResult);
      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });
  });
});