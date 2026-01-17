import limax from 'limax';

/**
 * Generates a unique slug from a name by appending a timestamp-based suffix
 * @param name The name to slugify
 * @returns A unique slug
 */
export const generateSlug = (name: string): string => {
  const baseSlug = limax(name, {
    lang: 'en',
    separator: '-',
    separateNumbers: true,
    separateApostrophes: true,
  });

  // Add a timestamp-based suffix (last 4 digits of timestamp + 2 random chars)
  const timestamp = Date.now().toString().slice(-4);
  const randomChars = Math.random().toString(36).substring(2, 4);

  return `${baseSlug}-${timestamp}${randomChars}`;
};
