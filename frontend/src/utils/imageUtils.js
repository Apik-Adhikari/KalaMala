export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300';
  
  // Normalize backslashes to forward slashes
  const normalizedPath = imagePath.replace(/\\/g, '/');
  
  if (normalizedPath.startsWith('uploads/')) {
    return `http://localhost:5000/${normalizedPath}`;
  }
  
  return normalizedPath;
};
