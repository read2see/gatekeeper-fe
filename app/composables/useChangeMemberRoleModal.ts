import type { Membership } from '~/types/domain'

export function useChangeMemberRoleModal(organizationId: string) {
  const stateKey = `change-member-role-${organizationId}`
  const isOpen = useState(`${stateKey}-open`, () => false)
  const member = useState<Membership | null>(`${stateKey}-member`, () => null)

  function open(row: Membership) {
    member.value = row
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    member.value = null
  }

  return {
    isOpen,
    member,
    open,
    close
  }
}
