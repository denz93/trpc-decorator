# TRPC Decorator

A library to simplify building TRPC routes using decorator syntax, enhancing ease of use and compatibility with Dependency Injection paradigms like TSyringe.

## Benefits

- Class-style declaration of TRPC routes
- Better integration with Dependency-Injection paradigms (e.g., TSyringe)
- Improved code organization and readability

## Installation

```bash
npm install @denz93/trpc-decorator
```

## Requirements

Ensure the following configurations are set in your project:

1. Install the "reflect-metadata" package:
   ```bash
   npm install reflect-metadata
   ```

2. Import "reflect-metadata" in your project's root file:
   ```typescript
   import "reflect-metadata";
   ```

3. If using TypeScript 5.0 or above, update your `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "experimentalDecorators": true,
       "emitDecoratorMetadata": true
     }
   }
   ```

## Usage

### Setting up TRPC and decorators

```typescript
// server/trpc.ts
import { initTRPC } from '@trpc/server';
import { useDecorators } from "@denz93/trpc-decorator";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const authProcedure = t.procedure.use(() => {
  // Implement your authentication logic here
});

export const decorators = useDecorators({
  "public": publicProcedure,
  "auth": authProcedure,
  // Add more custom procedures as needed
});
```

### Creating a route

```typescript
// server/TestRoute.ts
import { decorators } from "./trpc";
import { z } from "zod";

@decorators.route()
export class TestRoute {
    @decorators.query("public")
    sayHello(@decorators.input(z.string()) name: string) {
        return `Hello ${name}! How are you?`;
    }

    @decorators.query("auth")
    whoAmI(@decorators.context() ctx: any) {
        return `You are ${ctx.user.name}`;
    }
}
```

### Integrating routes

```typescript
// server/_app.ts
import { router } from './trpc';
import { createTrpcDecoratorRoutes } from "@denz93/trpc-decorator";
import { RouteControllerType } from "./types-generated";
import { TestRoute } from './TestRoute';

const appRouter = router({
  ...createTrpcDecoratorRoutes(new TestRoute()) as RouteControllerType
});

// Export only the type of the router to prevent importing server code on the client
export type AppRouter = typeof appRouter;
```

## Generating Types for Routes

To generate type definitions for your routes, run:

```bash
npx trpc-decorator-gen
```

This command will create type definitions that can be used to ensure type safety across your application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
