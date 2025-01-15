import React, { SyntheticEvent, useRef } from "react";
import { CareTeam } from "../../models/careTeam";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { updateCareTeam } from "../../api/user";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface EditCareTeamProps {
  careTeam: CareTeam
  onConfirm?: () => void
  onCancel?: () => void
}

const EditCareTeamForm: React.FC<EditCareTeamProps> = ({ careTeam, onConfirm, onCancel }) => {

  const {
    register,
    trigger,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm();


  const queryClient = useQueryClient();
  const { user } = useStore()
  const axiosPrivate = useAxiosPrivate();

  const careTeamMutation = useMutation({

    mutationFn: (careTeamName: string) => updateCareTeam(
      axiosPrivate, careTeam.id, careTeamName
    ),

    onSuccess: () => {
      // When we successfully
      queryClient.invalidateQueries({ queryKey: ['careTeams', user.id] });
      onCancel();
    },

    onError: () => {
      toast.error("Was unable to update team.");
      onCancel();
    }

  })

  const careTeamSubmit = async (data: any) => {

    clearErrors(["name"])
    const isValid = await trigger();

    if (isValid) {
      careTeamMutation.mutate(data.name);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-4xl text-header">Edit Care Team Name</h2>
      <form
        onSubmit={handleSubmit(careTeamSubmit)}
        className="flex flex-col gap-4 "
      >
        <label className="block text-sm font-medium text-gray-600">
          Care Team Name
          <input
            {...register('name', { required: "Name is required" })}
            type="text"
            className="input-field"
            placeholder={careTeam.name}
          />
          {errors.name && <p className="text-red-500">{(errors.name.message as string)}</p>}
        </label>

        <div className="flex gap-4 p-2">
          <button
            onClick={onConfirm}
            className="btn-primary"
          >
            submit
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            cancel
          </button>
        </div>
      </form>
    </div >
  )
}

export default EditCareTeamForm;
