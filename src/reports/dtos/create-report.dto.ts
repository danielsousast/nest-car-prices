import { IsLatitude, IsLongitude, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()   
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
  @Min(1930)
  @Max(2050)
  year!: number;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsNumber()
  @Min(0)
  mileage!: number;
}