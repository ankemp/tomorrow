# Custom Instructions for Writing Tests with Vitest Using VS Code Copilot

1. **Writing Tests**

   - Use descriptive test names to make the purpose of the test clear.
   - Start by writing a `describe` block to group related tests:

     ```javascript
     import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
     import { describe, it, expect } from 'vitest';

     describe('Feature or Component Name', () => {
       // ...existing code...
     });
     ```

   - Use `it` or `test` for individual test cases:
     ```javascript
     it('should perform a specific behavior', () => {
       // Arrange
       // Act
       // Assert
       expect(actual).toBe(expected);
     });
     ```

2. **Leverage Copilot Suggestions**

   - Start typing a test case, and let Copilot suggest completions.
   - Use comments to guide Copilot, e.g., `// Test for edge case`.

3. **Mocking and Stubbing**

   - Use Vitest's built-in mocking capabilities for dependencies:
     ```javascript
     vi.mock('module-name', () => ({
       // Mock implementation
     }));
     ```

4. **Using @ngneat/spectator**

   - Use `@ngneat/spectator` to simplify Angular component testing:

     ```javascript
     import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';

     const createComponent = createComponentFactory({
       component: MyComponent,
     });

     describe('MyComponent', () => {
       let spectator: Spectator<MyComponent>;

       beforeEach(() => {
         spectator = createComponent();
       });

       it('should create the component', () => {
         expect(spectator.component).toBeTruthy();
       });
     });
     ```

5. **Debugging Tests**

   - Use `console.log` or VS Code's debugging tools to troubleshoot failing tests.

6. **Best Practices**

   - Write isolated and independent tests.
   - Avoid hardcoding values; use variables or fixtures.
   - Test edge cases and error handling.

7. **Example Test**

   ```javascript
   import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
   import { describe, it, expect } from 'vitest';

   describe('Math Utilities', () => {
     it('should add two numbers correctly', () => {
       const result = add(2, 3);
       expect(result).toBe(5);
     });
   });
   ```
