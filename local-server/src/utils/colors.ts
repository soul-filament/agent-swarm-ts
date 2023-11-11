import * as colors from 'colors';
import * as readline from 'readline';

colors.enable();

const spinnerBase = '▁▃▄▅▆▇█▇▆▅▄▃';
let spinnerIndex = 0;

export function clearLine() {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(' '.repeat(process.stdout.columns));
    readline.cursorTo(process.stdout, 0);
}

export function header(text: string) {
    clearLine();
    console.log(text.blue);
}

export function hr() {
    clearLine();
    console.log('─'.repeat(process.stdout.columns).grey);
}

export function note(text: string) {
    clearLine();
    console.log(`    > ${text}`.grey);
}

export function spinner(text: string) {
    const spinnerChar = spinnerBase[spinnerIndex];
    spinnerIndex = (spinnerIndex + 1) % spinnerBase.length;
    clearLine();
    process.stdout.write(`    ${spinnerChar} ${text}`.grey);
}

export function complete(text: string) {
    clearLine();
    console.log(`    ✓ ${text}`.green);
}

export function fail(text: string) {
    clearLine();
    console.log(`    ✗ ${text}`.red);
}

export function WithSpinner(name: string){
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            const originalMethod = descriptor.value;
            descriptor.value = async function (...args: any[]) {
                spinner(name);
                try {
                    const result = await originalMethod.apply(this, args);
                    complete(name);
                    return result;
                } catch (error) {
                    fail(name);
                    throw error;
                }
            }
        }
}