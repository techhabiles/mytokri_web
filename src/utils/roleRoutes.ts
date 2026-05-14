import { ROLE_ADMIN, ROLE_HUB_MANAGER } from './constants'

export function homeRouteForRole(role: number): string {
  switch (role) {
    case ROLE_ADMIN:
      return '/admin'
    case ROLE_HUB_MANAGER:
      return '/hub-manager'
    default:
      return '/login'
  }
}
