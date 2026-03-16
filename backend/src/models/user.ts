// User schema definition for MongoDB using Mongoose. This schema defines the structure of the user documents in the database, including fields for name, email, password, phone number, and timestamps for creation and updates. It also includes validation rules for the fields, such as required fields and unique email addresses.
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string; // hashed
}
