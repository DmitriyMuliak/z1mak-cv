type Primitive = string | number | boolean | null | undefined;
type FlatPair = { key: string; value: Primitive };
type NestedObject = Record<string, unknown>; // Більш чіткий вхідний тип

/**
 * Рекурсивно згладжує об'єкт у масив пар ключ-значення (FlatPair[]).
 */
export function flattenObject(data: NestedObject, parentKey: string = ''): FlatPair[] {
  let result: FlatPair[] = [];

  const isObject = typeof data === 'object' && data !== null && !Array.isArray(data);

  if (!isObject) {
    // Якщо на вхід прийшов не об'єкт (хоча типізація це запобігає), повертаємо пустий масив.
    return [];
  }

  // Обробка об'єкта
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

    const newKey = parentKey ? `${parentKey}.${key}` : key;
    const value = data[key];

    const isNestedObject = typeof value === 'object' && value !== null;

    if (isNestedObject) {
      if (Array.isArray(value)) {
        // Обробка масивів: кожен елемент додається окремо
        (value as unknown[]).forEach((item) => {
          // Якщо елемент масиву є об'єктом, рекурсивно його згладжуємо
          if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
            result = result.concat(flattenObject(item as NestedObject, newKey));
          } else {
            // Елементи масиву, що не є об'єктами
            result.push({ key: newKey, value: item as Primitive });
          }
        });
      } else {
        // Рекурсія для вкладених об'єктів
        result = result.concat(flattenObject(value as NestedObject, newKey));
      }
    } else {
      // Додавання примітивного значення
      result.push({ key: newKey, value: value as Primitive });
    }
  }

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
