export interface User {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  imageUrl: string;
  refreshToken: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
