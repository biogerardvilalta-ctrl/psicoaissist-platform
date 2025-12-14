import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, ChangeRoleDto } from './dto/users.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(page?: number, limit?: number): Promise<{
        users: UserResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<UserResponseDto>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    changeRole(id: string, changeRoleDto: ChangeRoleDto): Promise<UserResponseDto>;
}
