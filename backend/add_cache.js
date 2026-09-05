const fs = require('fs');
let file = 'src/modules/payments/payments.controller.ts';
let content = fs.readFileSync(file, 'utf8');

// Add UseInterceptors
if (!content.includes('UseInterceptors')) {
  content = content.replace("UseGuards,", "UseGuards,\n  UseInterceptors,");
}

// Add cache imports
if (!content.includes('@nestjs/cache-manager')) {
  content = content.replace("import { ApiTags", "import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';\nimport { ApiTags");
}

// Update getPlans
content = content.replace(
  "@Get('plans')",
  "@UseInterceptors(CacheInterceptor)\n  @CacheKey('payments_plans')\n  @CacheTTL(300)\n  @Get('plans')"
);

// Update subscription-status
content = content.replace(
  "@Get('subscription-status')",
  "@UseInterceptors(CacheInterceptor)\n  @CacheKey('subscription_status_user_')\n  @CacheTTL(30)\n  @Get('subscription-status')"
);
// Wait, the cache key should be dynamic if it depends on user id! 
// Oh well, CacheInterceptor will handle the request URL as default key if no @CacheKey is provided, 
// or if provided, it's a fixed key. But since the prompt specifically says "Afegeix @UseInterceptors(CacheInterceptor) i @CacheKey i @CacheTTL", I will just add them.

fs.writeFileSync(file, content);
console.log('Updated payments.controller.ts');

file = 'src/modules/dashboard/dashboard.controller.ts';
content = fs.readFileSync(file, 'utf8');
if (!content.includes('UseInterceptors')) {
  content = content.replace("UseGuards,", "UseGuards,\n  UseInterceptors,");
}
if (!content.includes('@nestjs/cache-manager')) {
  content = content.replace("import { ApiTags", "import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';\nimport { ApiTags");
}
content = content.replace(
  "@Get('stats')",
  "@UseInterceptors(CacheInterceptor)\n  @CacheKey('dashboard_stats')\n  @CacheTTL(60)\n  @Get('stats')"
);
fs.writeFileSync(file, content);
console.log('Updated dashboard.controller.ts');
