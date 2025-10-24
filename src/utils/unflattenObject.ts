type Primitive = string | number | boolean | null | undefined;
type FlatPair = { key: string; value: Primitive };

/**
 * Збирає плаский масив ключів/значень назад у деревовидний об'єкт.
 *
 * @template T - Очікуваний тип відновленого об'єкта.
 * Викликаючому коду рекомендується явно вказати цей тип.
 * @param flatArray - Плаский масив пар ключ-значення.
 * @returns Відновлений об'єкт типу T.
 */

export function unflattenObject<T extends object>(flatArray: FlatPair[]): T {
  // Використовуємо "as T" тільки тут, щоб забезпечити, що ми повертаємо очікуваний тип.
  // current буде мати індексовані типи, щоб уникнути помилок TypeScript.
  const result = {} as T;

  flatArray.forEach((pair) => {
    // Розділення ключа за крапкою
    const keys = pair.key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = result; // Тимчасово використовуємо any для динамічної навігації

    keys.forEach((key, index) => {
      // Перевірка, чи є це останнім ключем (де зберігається значення)
      if (index === keys.length - 1) {
        // --- Логіка для останнього ключа (значення) ---

        // 1. Якщо ключ унікальний, ініціалізуємо його
        if (current[key] === undefined) {
          current[key] = pair.value;
        }
        // 2. Якщо це вже масив, додаємо новий елемент
        else if (Array.isArray(current[key])) {
          current[key].push(pair.value);
        }
        // 3. Якщо це вже просте значення, перетворюємо його на масив
        else {
          current[key] = [current[key], pair.value];
        }
      } else {
        // --- Логіка для проміжного ключа (об'єкт) ---

        // Якщо проміжний об'єкт не існує, ініціалізуємо його
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        // Перехід на наступний рівень
        current = current[key];
      }
    });
  });

  return result;
}

/* Example usage: 

// Вихідні дані
const initialData = { 
  name: 'someValue', 
  arrValue: [1, 2, 'some'], 
  innerObj: { prop: ['some1', 'some2'] } 
};

// 1. Згладження
const flatArray = flattenObject(initialData);

// flatArray буде:
// [
//   { key: 'name', value: 'someValue' },
//   { key: 'arrValue', value: 1 },
//   { key: 'arrValue', value: 2 },
//   { key: 'arrValue', value: 'some' },
//   { key: 'innerObj.prop', value: 'some1' },
//   { key: 'innerObj.prop', value: 'some2' }
// ]


// 2. Збирання
const restoredObject = unflattenObject(flatArray);


// restoredObject буде:
// { 
//   name: 'someValue', 
//   arrValue: [1, 2, 'some'], 
//   innerObj: { prop: ['some1', 'some2'] } 
// }


loggerC('--- Згладжений масив ---');
console.table(flatArray);
loggerC('--- Відновлений об\'єкт ---');
loggerC(JSON.stringify(restoredObject, null, 2));

// Перевірка:
// loggerC('Об\'єкти ідентичні:', JSON.stringify(initialData) === JSON.stringify(restoredObject));

*/
