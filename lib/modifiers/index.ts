//A function that recieves a parameter of ParsedBook and returns a modified parameter of ParsedBook. It receives an array of modifiers, each of which follow the same type declaration. It will then run each of them in order on the result and return the outcome. it should add type check to its callbacks and complain if they are wrong.
export const applyModifiers =
  <T>(modifiers: Array<(book: T) => Promise<T>>) =>
  async (stuff: T) => {
    return modifiers.reduce<Promise<T>>(
      async (acc, modifier) => await modifier(acc as unknown as T),
      stuff as Promise<T>,
    );
  };
