import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  SessionApiParam,
  WorkingSessionParam,
} from '@waha/nestjs/params/SessionApiParam';

import { SessionManager } from '../core/abc/manager.abc';
import { WhatsappSession } from '../core/abc/session.abc';
import {
  AcceptCallRequest,
  EndCallRequest,
  RejectCallRequest,
  StartCallRequest,
  StartCallResponse,
} from '../structures/calls.dto';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { CanSession, FromParam } from '@waha/core/auth/policies';

import { Action } from '@waha/core/auth/casl.types';

@ApiSecurity('api_key')
@Controller('api/:session/calls')
@ApiTags('📞 Calls')
@UseGuards(PoliciesGuard)
@CheckPolicies(CanSession(Action.Send, FromParam('session')))
export class CallsController {
  constructor(private manager: SessionManager) {}

  @Post('reject')
  @SessionApiParam
  @ApiOperation({ summary: 'Reject incoming call' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  rejectCall(
    @WorkingSessionParam session: WhatsappSession,
    @Body() request: RejectCallRequest,
  ) {
    return session.rejectCall(request.from, request.id);
  }

  @Post('start')
  @SessionApiParam
  @ApiOperation({
    summary: 'Start a native audio call',
    description:
      'Place an outgoing WhatsApp audio call. Optionally stream a raw 16 kHz mono s16le PCM file as the outgoing audio and record the peer audio to a file.',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  startCall(
    @WorkingSessionParam session: WhatsappSession,
    @Body() request: StartCallRequest,
  ): Promise<StartCallResponse> {
    return session.startCall(request);
  }

  @Post('accept')
  @SessionApiParam
  @ApiOperation({ summary: 'Accept an incoming native audio call' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  acceptCall(
    @WorkingSessionParam session: WhatsappSession,
    @Body() request: AcceptCallRequest,
  ): Promise<void> {
    return session.acceptCall(request);
  }

  @Post('end')
  @SessionApiParam
  @ApiOperation({ summary: 'End an active native call' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  endCall(
    @WorkingSessionParam session: WhatsappSession,
    @Body() request: EndCallRequest,
  ): Promise<void> {
    return session.endCall(request);
  }
}
