import { UserModel, IUser } from '../models/userModel';

const createUser = async (username: string, password: string): Promise<IUser> => {
  const user = new UserModel({ username, password });
  return await user.save();
};

const getAllUsers = async (): Promise<IUser[]> => {
  return await UserModel.find();
};

const getUserByUsername = async (username: string): Promise<IUser | null> => {
  return await UserModel.findOne({ username });
};

const getUserById = async (userId: string): Promise<IUser | null> => {
  return await UserModel.findById(userId);
};

const updateUser = async (userId: string, newData: { username?: string; password?: string }): Promise<IUser | null> => {
  return await UserModel.findByIdAndUpdate(userId, newData, { new: true });
};

const deleteUser = async (userId: string): Promise<IUser | null> => {
  return await UserModel.findOneAndDelete({ _id: userId }) as IUser | null;
};

export {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  deleteUser,
};
