/**
 * Composable para formatação de dados de funcionários
 *
 * Responsabilidades:
 * - Gerar iniciais a partir do nome
 * - Gerar label do tier/nível
 * - Formatar timezone de forma legível
 */

interface TimezoneInfo {
  label: string
  offset: string
}

const timezoneMap: Record<string, TimezoneInfo> = {
  'America/Chicago': { label: 'Chicago', offset: 'UTC-6' },
  'America/Los_Angeles': { label: 'Los Angeles', offset: 'UTC-8' },
  'America/New_York': { label: 'New York', offset: 'UTC-5' },
  'America/Phoenix': { label: 'Phoenix', offset: 'UTC-7' },
  'America/Sao_Paulo': { label: 'São Paulo', offset: 'UTC-3' },
  'Asia/Singapore': { label: 'Singapore', offset: 'UTC+8' },
  'Asia/Tokyo': { label: 'Tokyo', offset: 'UTC+9' },
  'Australia/Sydney': { label: 'Sydney', offset: 'UTC+10' },
  'Europe/Berlin': { label: 'Berlin', offset: 'UTC+1' },
  'Europe/London': { label: 'London', offset: 'UTC+0' },
  UTC: { label: 'UTC', offset: 'UTC+0' },
}

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

  /**
   * Formata timezone para exibição legível
   * Exemplos:
   * - "America/Sao_Paulo" -> "São Paulo (UTC-3)"
   * - "Asia/Tokyo" -> "Tokyo (UTC+9)"
   * - "Unknown/Timezone" -> "Unknown/Timezone"
   */
  const formatTimezone = (timezone: string): string => {
    const info = timezoneMap[timezone]
    if (!info) return timezone

    return `${info.label} (${info.offset})`
  }

  return {
    getInitials,
    getLevelLabel,
    formatTimezone,
  }
}
