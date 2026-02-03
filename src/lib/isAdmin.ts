/**
 * Check if a user is an admin based on their email
 * @param userEmail - The user's email address
 * @returns true if the user is an admin, false otherwise
 */
export function isAdmin(userEmail: string | undefined): boolean {
    if (!userEmail) return false;
    return userEmail.toLowerCase() === 'admin@cstore.com';
}
