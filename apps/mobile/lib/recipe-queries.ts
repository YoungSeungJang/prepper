export const recipeQueryKeys = {
  all: ['recipes'] as const,
  detail: (id: string) => ['recipes', id] as const,
  list: ['recipes', 'list'] as const,
};
