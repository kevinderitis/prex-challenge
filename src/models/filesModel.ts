import { Schema, model, Document, Types } from 'mongoose';

interface IFile extends Document {
  filename: string;
  user: string;
  url: string;
}

const FileSchema: Schema = new Schema({
  filename: { type: String, required: true },
  user: { type: String, required: true },
  url: { type: String, required: true }
});

const FileModel = model<IFile>('File', FileSchema);

export { FileModel, IFile };
