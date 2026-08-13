import React from 'react';

export default function FileUpload({ onUpload }) {
  const handleChange = async e => {
    const file = e.target.files[0]
    if (!file) return;

    await onUpload(file)
  }

  return (
    <div>
      <label htmlFor="mov">Select a .MOV video:</label>
      <input
        id="mov"
        type="file"
        accept="video/*,video/quicktime"
        onChange={handleChange}
      />
    </div>
  );
}
