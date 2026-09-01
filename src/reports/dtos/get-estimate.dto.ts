import { Transform } from 'class-transformer';
import { IsLatitude, IsLongitude, IsNumber, IsString, Max, Min } from 'class-validator';

export class GetEstimateDto {
  @IsString()   
  make!: string;

  @IsString()
  model!: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1930)
  @Max(2050)
  year!: number;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  mileage!: number;
}