/**
 * Returns a translate function for a module so template only uses short keys (no "module." prefix).
 * Example: useModuleT('employeeForm') then t('province') → "Province" (value from locale).
 * When translation is missing, returns '' so template fallbacks (e.g. ?? 'Label') are used.
 */
export function useModuleT(module: string) {
  const { t } = useI18n()
  return (key: string, ...args: unknown[]) => {
    if (!key) return ''
    const fullKey = `${module}.${key}`
    const value = t(fullKey, ...args)
    if (typeof value !== 'string') return ''
    // If i18n returns the key (translation missing), return '' so ?? fallback in template works
    if (value === fullKey) return ''
    return value
  }
}
