const fs = require('fs');
const files = [
  'src/modules/admin/admin.controller.ts',
  'src/modules/payments/payments.controller.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('@ApiTags')) {
    const importMatch = content.match(/import \{[^}]+\} from '@nestjs\/common';/);
    if (importMatch) {
      content = content.replace(
        importMatch[0],
        importMatch[0] + "\nimport { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';"
      );
    } else {
        content = "import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';\n" + content;
    }

    const controllerName = file.includes('admin') ? 'Admin' : 'Payments';
    content = content.replace(
      /@Controller\('[^']+'\)/,
      `@ApiTags('${controllerName}')\n@ApiBearerAuth()\n$&`
    );

    // Naive ApiOperation addition to all methods
    const methodRegex = /@(Get|Post|Patch|Put|Delete)\('[^']*'\)\s+async\s+(\w+)/g;
    content = content.replace(methodRegex, (match, method, name) => {
      return `@ApiOperation({ summary: '${name}' })\n  @ApiResponse({ status: 200, description: 'Success' })\n  ${match}`;
    });

    const methodRegex2 = /@(Get|Post|Patch|Put|Delete)\(\)\s+async\s+(\w+)/g;
    content = content.replace(methodRegex2, (match, method, name) => {
      return `@ApiOperation({ summary: '${name}' })\n  @ApiResponse({ status: 200, description: 'Success' })\n  ${match}`;
    });
    
    // Also non-async methods
    const methodRegex3 = /@(Get|Post|Patch|Put|Delete)\('[^']*'\)\s+(?!async)(\w+)/g;
    content = content.replace(methodRegex3, (match, method, name) => {
      return `@ApiOperation({ summary: '${name}' })\n  @ApiResponse({ status: 200, description: 'Success' })\n  ${match}`;
    });

    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}
