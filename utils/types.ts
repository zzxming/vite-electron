export const isUndefined = (val: any): val is undefined => val === undefined;
export const isBoolean = (val: any): val is boolean => typeof val === 'boolean';
export const isNumber = (val: any): val is number => typeof val === 'number';
export const isArray = Array.isArray;
export const isFunction = (val: any): val is Function => typeof val === 'function';
export const isObject = (val: any): val is Record<any, any> => val !== null && typeof val === 'object';
export const isString = (val: any): val is string => typeof val === 'string';
