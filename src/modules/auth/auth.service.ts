import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from 'bcrypt';
import { use } from "passport";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    
    constructor(private prisma: PrismaService,
                private jwtService:JwtService
    ) {}

    
    
    async register(data: any) {

        const hashedPassword = await bcrypt.hash(data.password, 10)

        return await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            }
            
        })
    }

    async logIn(data: any) {

        const user = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        })

        if (!user) throw new UnauthorizedException('Invalid credentials');


        const validatePassword = await bcrypt.compare(data.password, user.password)

        if (!validatePassword) throw new UnauthorizedException('Invalid credentials');

        // const {password, ...withoutPassword} = user

        const payload = {
            id: user.id,
            email: user.email,
            owner: user.owner
        }

        const token = this.jwtService.sign(payload)


        const { owner, ...userWithoutOwner } = user;

    return {
      user: userWithoutOwner,
      email: user.email,
      token,
      owner,
    };
    }
}