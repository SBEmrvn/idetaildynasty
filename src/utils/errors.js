export function getErrorMessage(error) {
  const msg = error?.message?.toLowerCase() || ''

  if (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed') ||
    msg.includes('network request failed')
  ) return 'No internet connection. Please check your network and try again.'

  if (msg.includes('timeout') || msg.includes('timed out'))
    return 'The request timed out. Your connection may be slow — please try again.'

  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password'))
    return 'Invalid email or password. Please try again.'

  if (msg.includes('email not confirmed'))
    return 'Please verify your email address before signing in.'

  if (msg.includes('user already registered') || msg.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.'

  if (msg.includes('password should be at least'))
    return 'Password must be at least 6 characters.'

  if (msg.includes('unable to validate email address'))
    return 'Please enter a valid email address.'

  if (msg.includes('rate limit') || msg.includes('too many requests'))
    return 'Too many attempts. Please wait a moment and try again.'

  return error?.message || 'Something went wrong. Please try again.'
}
