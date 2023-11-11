exports.handler = async ({ expression }) => {
  try {
    const result = eval(expression);
    return { result };
  } catch (error) {
    throw new Error('Invalid expression or calculation error');
  }
};