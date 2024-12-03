import { UseInterceptors } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AuthSocketInterceptor } from 'src/auth/auth-socket.interceptor';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({
  cors: true,
})
@UseInterceptors(AuthSocketInterceptor)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly eventEmiiter: EventEmitter2,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  queue: any[] = [];
  battles: Map<string, { player1: any; player2: any }> = new Map();
  clients: Map<string, any> = new Map();

  queueLock: Set<string> = new Set();

  async handleConnection(client: any) {
    const authorization = client.handshake.headers['authorization'] as string;

    if (!authorization) {
      client.disconnect();
      return;
    }

    const [, token] = authorization.split(' ');

    const verified = this.authService.verifyToken(token);

    if (!verified) {
      client.disconnect();
      return;
    }

    const sub = this.authService.getSub(token);

    const user = await this.userService.findById(sub);

    client.data.info = {
      id: user.id,
      username: user.username,
      image: user.image,
    };

    this.clients.set(user.id, client);

    console.log(`user with ID ${sub} connected with client ID ${client.id}`);
  }

  handleDisconnect(client: any) {
    const authorization = client.handshake.headers['authorization'] as string;

    const [, token] = authorization.split(' ');

    const sub = this.authService.getSub(token);

    this.clients.delete(sub);

    this.queue = this.queue.filter((c) => {
      return c.data.info.id != sub;
    });

    console.log(`user with ID ${sub} disconnected`);
  }

  @SubscribeMessage('battle-choice')
  handleFightChoice(
    client: any,
    payload: { choice: string; battleId: string; username: string },
  ) {
    const authorization = client.handshake.headers['authorization'] as string;

    if (!authorization) {
      client.disconnect();
      return;
    }

    const [, token] = authorization.split(' ');

    const verified = this.authService.verifyToken(token);

    if (!verified) {
      client.disconnect();
      return;
    }

    const sub = this.authService.getSub(token);

    const battle = this.battles.get(payload.battleId);

    if (!battle) {
      console.log('battle not found');
      return;
    }

    const { player1, player2 } = battle;

    if (sub == battle.player1.data.info.id) {
      player1.data.battleChoice = payload.choice;
    } else if (sub == battle.player2.data.info.id) {
      player2.data.battleChoice = payload.choice;
    }

    if (player1.data.battleChoice && player2.data.battleChoice) {
      const winnerId = this.determineWinner(
        {
          choice: player1.data.battleChoice,
          id: player1.data.info.id,
        },
        {
          choice: player2.data.battleChoice,
          id: player2.data.info.id,
        },
      );

      if (winnerId === 'none') {
        this.updateScore([
          {
            id: player1.data.info.id,
            points: 1,
          },
          {
            id: player2.data.info.id,
            points: 1,
          },
        ]);

        battle.player1.emit('finished', {
          result: 'draw',
        });

        battle.player2.emit('finished', {
          result: 'draw',
        });
      } else {
        this.updateScore([
          {
            id: winnerId,
            points: 3,
          },
        ]);

        if (battle.player1.data.info.id == winnerId) {
          battle.player1.emit('finished', {
            result: 'wins',
          });
          battle.player2.emit('finished', {
            result: 'defeated',
          });
        } else {
          battle.player1.emit('finished', {
            result: 'defeated',
          });
          battle.player2.emit('finished', {
            result: 'wins',
          });
        }
      }

      this.battles.delete(payload.battleId);
    }
  }

  @SubscribeMessage('join-queue')
  handleQueueEvent(client: any): void {
    const authorization = client.handshake.headers['authorization'] as string;

    const [, token] = authorization.split(' ');

    const sub = this.authService.getSub(token);

    if (!this.clients.has(sub)) {
      client.disconnect();
      return;
    }

    client.emit('player-in-queue', {
      status: 'PLAYER_IN_QUEUE',
    });

    this.queue.push(client);

    if (this.queue.length >= 2) {
      const player1 = this.queue.shift();
      const player2 = this.queue.shift();

      const battleId = `${player1.data.info.id}.${player2.data.info.id}`;

      this.battles.set(battleId, {
        player1,
        player2,
      });

      player1.emit('waiting-for-choice', {
        status: 'WAITING_FOR_CHOICE',
        battle: {
          id: battleId,
          player1: player1.data.info,
          player2: player2.data.info,
        },
      });

      player2.emit('waiting-for-choice', {
        status: 'WAITING_FOR_CHOICE',
        battle: {
          id: battleId,
          player1: player1.data.info,
          player2: player2.data.info,
        },
      });
    }
  }

  determineWinner(player1: Player, player2: Player): string {
    if (player1.choice === player2.choice) {
      return 'none';
    } else if (
      (player1.choice === 'ROCK' && player2.choice === 'SCISSORS') ||
      (player1.choice === 'PAPER' && player2.choice === 'ROCK') ||
      (player1.choice === 'SCISSORS' && player2.choice === 'PAPER')
    ) {
      return player1.id;
    } else {
      return player2.id;
    }
  }

  updateScore(data: BattleFinishedEvent[]) {
    this.eventEmiiter.emit('battle-finished', data);
  }
}

interface Player {
  choice: string;
  id: string;
}

export interface BattleFinishedEvent {
  id: string;
  points: number;
}
