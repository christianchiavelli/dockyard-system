/**
 * Composable para formatação de dados de funcionários
 *
 * Responsabilidades:
 * - Gerar iniciais a partir do nome
 * - Gerar label do tier/nível
 */
export function useEmployeeFormat() {
  /**
   * Gera iniciais a partir do nome completo
   * Exemplos:
   * - "John Doe" -> "JD"
   * - "Maria" -> "MA"
   * - "" -> "??"
   */
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean)

    if (parts.length === 0) return '??'

    if (parts.length === 1) {
      return (parts[0] ?? '').substring(0, 2).toUpperCase()
    }

    const first = parts[0] ?? ''
    const last = parts[parts.length - 1] ?? ''
    return (first.charAt(0) + last.charAt(0)).toUpperCase()
  }

  /**
   * Gera label do tier baseado no nível (0-indexed)
   * Exemplos:
   * - 0 -> "Tier 1"
   * - 1 -> "Tier 2"
   * - 5 -> "Tier 6"
   */
  const getLevelLabel = (level: number): string => {
    return `Tier ${level + 1}`
  }

  return {
    getInitials,
    getLevelLabel,
  }
}
