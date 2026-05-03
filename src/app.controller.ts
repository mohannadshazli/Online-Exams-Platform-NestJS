import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Public()
  // @Get('test')
  // async test() {
  //   console.log('--- Logout Method Started ---');
  //   console.log('Token:', 'example_access_token');

  //   try {
  //     // تجربة تخزين قيمة ثابتة لمدة دقيقة بدون حسابات معقدة
  //     await this.cacheManager.set('test_key', 'it_works', 60000);
  //     console.log('--- Sent to Redis Successfully ---');
  //   } catch (error) {
  //     console.error('--- Redis Error ---', error);
  //   }
  //   // // جرب تخزن قيمة لمدة 10 ثواني (10000 مللي ثانية)
  //   // await this.cacheManager.set('test_key', 'hello', 15000);

  //   // // استنى ثانيتين وشوفها موجودة ولا لا
  //   // setTimeout(async () => {
  //   //   const val = await this.cacheManager.get('test_key');
  //   //   console.log('Value after 2s:', val);
  //   // }, 2000);
  // }
}
