// Password Validation Helper Function for User Registration and Password Update. This function checks if the password meets certain criteria such as minimum length, presence of letters, and uppercase letters. It returns an object indicating whether the password is valid and an error message if it is not.
export default function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one letter" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" };
  }
  return { valid: true };
}
