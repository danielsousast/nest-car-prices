import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private readonly reportsRepository: Repository<Report>,
    ) {}
    
    createReport(reportDto: CreateReportDto) {
        const report =  this.reportsRepository.create(reportDto)
        return this.reportsRepository.save(report)
    }
}
