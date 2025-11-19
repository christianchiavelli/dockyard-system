import { describe, expect, it } from 'vitest'

import { useEmployeeFormat } from '../composables/useEmployeeFormat'

describe('useEmployeeFormat', () => {
  const { getInitials, getLevelLabel } = useEmployeeFormat()

  describe('getInitials', () => {
    it('should return first and last name initials for full names', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Ana Maria Silva')).toBe('AS')
      expect(getInitials('Carlos Eduardo Santos')).toBe('CS')
    })

    it('should return first two letters for single names', () => {
      expect(getInitials('Maria')).toBe('MA')
      expect(getInitials('João')).toBe('JO')
      expect(getInitials('Ana')).toBe('AN')
    })

    it('should handle names with extra spaces', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD')
      expect(getInitials('Maria    Silva')).toBe('MS')
    })

    it('should return "??" for empty or whitespace-only strings', () => {
      expect(getInitials('')).toBe('??')
      expect(getInitials('   ')).toBe('??')
      expect(getInitials('\t\n')).toBe('??')
    })

    it('should handle single letter names', () => {
      expect(getInitials('A')).toBe('A')
      expect(getInitials('Z')).toBe('Z')
    })

    it('should convert to uppercase', () => {
      expect(getInitials('john doe')).toBe('JD')
      expect(getInitials('maria silva')).toBe('MS')
    })

    it('should handle special characters in names', () => {
      expect(getInitials("O'Brien")).toBe("O'") // Single name with apostrophe
      expect(getInitials('José María')).toBe('JM')
      expect(getInitials("Mary O'Brien")).toBe('MO') // Full name with apostrophe
    })

    it('should handle names with hyphens', () => {
      expect(getInitials('Mary-Anne Smith')).toBe('MS')
      expect(getInitials('Jean-Claude Van Damme')).toBe('JD')
    })
  })

  describe('getLevelLabel', () => {
    it('should return correct tier label for level 0 (Tier 1)', () => {
      expect(getLevelLabel(0)).toBe('Tier 1')
    })

    it('should return correct tier labels for various levels', () => {
      expect(getLevelLabel(1)).toBe('Tier 2')
      expect(getLevelLabel(2)).toBe('Tier 3')
      expect(getLevelLabel(5)).toBe('Tier 6')
      expect(getLevelLabel(10)).toBe('Tier 11')
    })

    it('should handle negative levels (edge case)', () => {
      expect(getLevelLabel(-1)).toBe('Tier 0')
    })

    it('should handle large level numbers', () => {
      expect(getLevelLabel(99)).toBe('Tier 100')
      expect(getLevelLabel(999)).toBe('Tier 1000')
    })
  })
})
