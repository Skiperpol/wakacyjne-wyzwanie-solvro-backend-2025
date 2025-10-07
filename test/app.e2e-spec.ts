import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { SuperTest, Test as SuperTestRequest } from 'supertest';
import type { Server } from 'http';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type BacktestResponse = {
  symbol: string;
  strategy: string;
  params: { shortEma: number; longEma: number };
  results: {
    profit: number;
    winRate: number;
    trades: number;
    wins: number;
    losses: number;
  };
};

describe('Backtests E2E (real Binance)', () => {
  let app: INestApplication;
  let server: Server;
  let http: SuperTest<SuperTestRequest>;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: async () => {},
        $connect: async () => {},
        $disconnect: async () => {},
      });

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    server = app.getHttpServer() as unknown as Server;
    http = request(server as unknown as Server);
    jest.setTimeout(60000);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /backtests/run should return results with metrics', async () => {
    const res = await http
      .post('/backtests/run')
      .send({
        symbol: 'BTCUSDT',
        from: '2024-01-01',
        to: '2024-01-10',
        strategy: 'ema_crossover',
        params: { shortEma: 10, longEma: 30 },
      })
      .expect(201);

    const body: BacktestResponse = res.body as BacktestResponse;
    expect(body).toBeDefined();
    expect(body.symbol).toBe('BTCUSDT');
    expect(body.strategy).toBe('ema_crossover');
    expect(body.params).toEqual({ shortEma: 10, longEma: 30 });
    expect(body.results).toBeDefined();
    expect(typeof body.results.profit).toBe('number');
    expect(typeof body.results.winRate).toBe('number');
    expect(typeof body.results.trades).toBe('number');
    expect(typeof body.results.wins).toBe('number');
    expect(typeof body.results.losses).toBe('number');
  });

  it('POST /backtests/run should 400 on unknown strategy', async () => {
    await http
      .post('/backtests/run')
      .send({
        symbol: 'BTCUSDT',
        from: '2024-01-01',
        to: '2024-01-10',
        strategy: 'unknown_strategy',
      })
      .expect(400);
  });
});
