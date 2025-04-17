import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import { MentionsInput, Mention } from 'react-mentions';
import useBugStore from '../store/bugStore';

export default function BugDetails({ bug }) {
  const { addComment, addAttachment, toggleWatcher, addReaction } = useBugStore();
  const [comment, setComment] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: files => {
      files.forEach(file => addAttachment(bug.id, file));
    }
  });

  const handleAddComment = (e) => {
    e.preventDefault();
    addComment(bug.id, comment, 'Current User');
    setComment('');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{bug.title}</h2>
          <div className="mt-1 flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              bug.severity === 'Critical' ? 'bg-red-100 text-red-800' :
              bug.severity === 'High' ? 'bg-orange-100 text-orange-800' :
              bug.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {bug.severity}
            </span>
            {bug.labels.map(label => (
              <span key={label} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {label}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => toggleWatcher(bug.id, 1, 'Current User')}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          {bug.watchers?.some(w => w.id === 1) ? 'Unwatch' : 'Watch'}
        </button>
      </div>

      <div className="mt-4">
        <ReactMarkdown className="prose">
          {bug.description}
        </ReactMarkdown>
      </div>

      {/* Attachments */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
        <div {...getRootProps()} className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600">
              <input {...getInputProps()} />
              <p>Drop files here or click to upload</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
        <form onSubmit={handleAddComment} className="mt-2">
          <MentionsInput
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Add a comment... Use @ to mention someone"
          >
            <Mention
              trigger="@"
              data={[
                { id: 1, display: 'John Doe' },
                { id: 2, display: 'Jane Smith' }
              ]}
            />
          </MentionsInput>
          <div className="mt-2 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Comment
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}