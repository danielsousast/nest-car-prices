import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private readonly reportsRepository: Repository<Report>,
    ) {}
    
    create(reportDto: CreateReportDto, user: User) {
        const report =  this.reportsRepository.create(reportDto)
        report.user = user;
        return this.reportsRepository.save(report)
    }

    async changeApproval(id: string, approved: boolean) {
        const report = await this.reportsRepository.findOne({ where: { id: parseInt(id) } });
 
        if (!report) {
            throw new NotFoundException('Report not found');
        }

        report.approved = approved;
        return this.reportsRepository.save(report);
    }

    async getEstimate({ make, model, year, latitude, longitude, mileage }: GetEstimateDto) {
        return this.reportsRepository.createQueryBuilder()
            .select('AVG(price)', 'price')
            .where('make = :make', { make })
            .andWhere('model = :model', { model })
            .andWhere('year - :year BETWEEN -3 AND 3', { year })
            .andWhere('latitude - :latitude BETWEEN -5 AND 5', { latitude })
            .andWhere('longitude - :longitude BETWEEN -5 AND 5', { longitude })
            .orderBy('ABS(mileage - :mileage)', 'DESC')
            .setParameters({ mileage })
            .limit(3)
            .getRawOne();
    }   
}
