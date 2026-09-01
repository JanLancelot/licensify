/**
 * Converts raw developer/server auth errors into friendly, understandable user messages.
 */
export function formatAuthError(err: any): string {
  if (!err) {
    return 'An unexpected error occurred. Please try again.';
  }

  const message = typeof err === 'string' ? err : err.message || err.toString() || '';
  const lowerMsg = message.toLowerCase();

  // 1. Incorrect credentials / account not found
  if (
    lowerMsg.includes('invalidaccountsecret') ||
    lowerMsg.includes('invalidaccountid') ||
    lowerMsg.includes('invalidcredentials') ||
    lowerMsg.includes('invalidsecret') ||
    lowerMsg.includes('invalidpassword') ||
    lowerMsg.includes('could not find account') ||
    lowerMsg.includes('user-not-found') ||
    lowerMsg.includes('wrong password') ||
    lowerMsg.includes('incorrect password') ||
    lowerMsg.includes('invalid-login-credentials')
  ) {
    return 'Incorrect email or password. Please check your details and try again.';
  }

  // 2. Account already exists (registration)
  if (
    lowerMsg.includes('accountalreadyexists') ||
    lowerMsg.includes('useralreadyexists') ||
    lowerMsg.includes('already in use') ||
    lowerMsg.includes('already exists') ||
    lowerMsg.includes('email-already-in-use')
  ) {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  // 3. Invalid or expired verification code
  if (
    lowerMsg.includes('invalidcode') ||
    lowerMsg.includes('verificationfailed') ||
    lowerMsg.includes('invalid otp') ||
    lowerMsg.includes('code-expired') ||
    lowerMsg.includes('invalid code')
  ) {
    return 'The verification code is incorrect or expired. Please check your email and try again.';
  }

  // 4. Rate limiting / Too many attempts
  if (
    lowerMsg.includes('toomanyrequests') ||
    lowerMsg.includes('ratelimit') ||
    lowerMsg.includes('too many attempts')
  ) {
    return 'Too many failed attempts. Please wait a few moments before trying again.';
  }

  // 5. Network / Connectivity issues
  if (
    lowerMsg.includes('failed to fetch') ||
    lowerMsg.includes('network error') ||
    lowerMsg.includes('network request failed') ||
    lowerMsg.includes('offline') ||
    lowerMsg.includes('timeout')
  ) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  // 6. Google Sign In canceled
  if (lowerMsg.includes('canceled') || lowerMsg.includes('popup_closed_by_user')) {
    return 'Sign in was canceled. Please try again.';
  }

  // 7. Handle Convex raw server errors (e.g., Uncaught Error: ...)
  if (lowerMsg.includes('uncaught error') || lowerMsg.includes('server error') || message.includes('CONVEX M')) {
    return 'Sign in failed. Please check your information and try again.';
  }

  // If message is short and doesn't look like code/stacktrace, return as is
  if (message.length < 80 && !message.includes('Stack:') && !message.includes('http') && !message.includes('{')) {
    return message;
  }

  return 'Sign in failed. Please try again.';
}
