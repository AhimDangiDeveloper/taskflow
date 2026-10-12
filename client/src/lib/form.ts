import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

export function clearFieldError(
  field: string,
  setValue: (value: string) => void,
  setErrors: Dispatch<SetStateAction<Record<string, string>>>,
) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setErrors((current) => (current[field] ? { ...current, [field]: '' } : current));
  };
}
