/**
 * Events
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatIdProperty } from '@waha/structures/properties.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

function CallIdProperty() {
  return ApiProperty({
    description: 'Call ID',
    example: 'ABCDEFGABCDEFGABCDEFGABCDEFG',
  });
}

export class RejectCallRequest {
  @ChatIdProperty()
  @IsString()
  @IsNotEmpty()
  from: string;

  @CallIdProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class CallData {
  @CallIdProperty()
  id: string;

  @ChatIdProperty()
  from?: string;

  timestamp: number;

  isVideo: boolean;

  isGroup: boolean;

  _data: any;
}

function AudioFileProperty(description: string) {
  return ApiPropertyOptional({
    description: description,
    example: '/tmp/waha/call-in.pcm',
  });
}

export class StartCallRequest {
  @ChatIdProperty()
  @IsString()
  @IsNotEmpty()
  to: string;

  @AudioFileProperty(
    'Path to a raw 16 kHz mono s16le PCM file streamed as the outgoing audio once the call is active',
  )
  @IsString()
  @IsOptional()
  audioIn?: string;

  @AudioFileProperty(
    'Path where the decoded peer audio is written (raw 16 kHz mono s16le PCM)',
  )
  @IsString()
  @IsOptional()
  audioOut?: string;
}

export class StartCallResponse {
  @CallIdProperty()
  id: string;
}

export class AcceptCallRequest {
  @CallIdProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @AudioFileProperty(
    'Path to a raw 16 kHz mono s16le PCM file streamed as the outgoing audio once the call is active',
  )
  @IsString()
  @IsOptional()
  audioIn?: string;

  @AudioFileProperty(
    'Path where the decoded peer audio is written (raw 16 kHz mono s16le PCM)',
  )
  @IsString()
  @IsOptional()
  audioOut?: string;
}

export class EndCallRequest {
  @CallIdProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
