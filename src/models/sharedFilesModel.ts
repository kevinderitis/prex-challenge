import { Schema, model, Document } from 'mongoose';
import { IFile } from './filesModel';

interface ISharedFile extends Document {
  fileId: string;
  owner: string;
  sharedWith: string;
}

const SharedFileSchema: Schema = new Schema({
  fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
  owner: { type: String, required: true },
  sharedWith: { type: String, required: true },
});

interface FileQueriesResult {
  myFiles: IFile[];
  sharedWithMe: ISharedFile[];
}
const SharedFileModel = model<ISharedFile>('SharedFile', SharedFileSchema);

export { SharedFileModel, ISharedFile, FileQueriesResult };
