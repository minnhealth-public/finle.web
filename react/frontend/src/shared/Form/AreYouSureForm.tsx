import React from "react";

interface AreYouSureFormProps {
  onConfirm: () => void
  onCancel: () => void
  message?: string
}

const AreYouSureForm: React.FC<AreYouSureFormProps> = ({ onConfirm, onCancel, message }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-4xl text-header">Are you Sure?</h2>
      {message &&
        <p>
          {message}
        </p>
      }
      <div className="flex gap-4">
        <button
          onClick={onConfirm}
          className="btn-primary"
        >
          Yes
        </button>
        <button
          onClick={onCancel}
          className="btn-secondary"
        >
          No
        </button>
      </div>
    </div>
  )
}

export default AreYouSureForm;
