export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isBossRole(role?: string | null) {
  if (!isNonEmptyString(role)) {
    return false
  }

  const normalizedRole = role.trim().toLowerCase()
  return ['boss', 'owner', 'admin', 'manager', '老板'].some((keyword) =>
    normalizedRole.includes(keyword),
  )
}

export function hasWorkerManagementAccess(user?: {
  role?: string
  email?: string
  name?: string
} | null) {
  if (!user) {
    return false
  }

  if (isBossRole(user.role)) {
    return true
  }

  return [user.email, user.name].some((value) => {
    if (!isNonEmptyString(value)) {
      return false
    }

    const normalizedValue = value.trim().toLowerCase()
    return ['owner', 'boss', 'admin', '老板'].some((keyword) =>
      normalizedValue.includes(keyword),
    )
  })
}
