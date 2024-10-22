import { useZIndex as useElZIndex } from 'element-plus';

export const useZIndex = () => {
  const { currentZIndex, nextZIndex } = useElZIndex();

  return {
    currentZIndex,
    nextZIndex,
  };
};
