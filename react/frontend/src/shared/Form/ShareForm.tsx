import React from "react";

interface ShareFormProps {
  onConfirm: () => void
  onCancel: () => void
}

const ShareForm: React.FC<ShareFormProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-4xl text-header">Are you Sure?</h2>
      <form className="flex gap-4">
        <input type="text">
        </input>
        <button type="submit">Share</button>
      </form>
    </div>
  )
}

export default ShareForm;
