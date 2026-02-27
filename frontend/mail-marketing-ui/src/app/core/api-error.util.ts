export function getApiErrorMessage(error: any): string {
  if (!error) return 'Beklenmeyen bir hata oluştu.';

  const modelState = error?.error?.errors;
  if (modelState && typeof modelState === 'object') {
    const firstKey = Object.keys(modelState)[0];
    if (firstKey && Array.isArray(modelState[firstKey]) && modelState[firstKey].length > 0) {
      return modelState[firstKey][0];
    }
  }

  return error?.error?.message || 'İşlem başarısız oldu.';
}
