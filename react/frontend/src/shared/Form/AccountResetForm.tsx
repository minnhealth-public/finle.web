import React, { SyntheticEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { resetPassword } from "../../api/auth";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

interface AccountResetFormProps {
  onSubmit: () => void
}

const AccountResetForm: React.FC<AccountResetFormProps> = ({ onSubmit }) => {

  const {
    register,
    trigger,
    setError,
    watch,
    formState: { errors },
  } = useForm();
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = useRef(null);

  const updatePasswordMutation = useMutation({
    mutationFn: (newPassword: string) => resetPassword(newPassword, searchParams.get("token")),
    onSuccess: () => {
      onSubmit();
    },
    onError: async (error: any) => {
      if (error.response.status == 401) {
        setError("root.serverError", { type: error.response.status, message: "Sorry there was an error " });
      }
      for (const [key, value] of Object.entries(error.response.data)) {
        const errors: string[] = value as string[]
        setError(key, { type: 'custom', message: errors.join(" ") })
      }
    }
  })

  const formSubmit = async (evt: SyntheticEvent) => {
    setDisableSubmit(true);
    evt.preventDefault()
    const body = new FormData(formRef.current);
    // call form submit after we've ensured that we are successful
    const isValid = await trigger()
    if (isValid) {
      updatePasswordMutation.mutate(body.get("password") as string)
    }

    setDisableSubmit(false);
  }

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-4"
      onSubmit={formSubmit}
    >
      <label>
        <input
          {...register('password', { required: "Password is required" })}
          required
          className="input-field"
          placeholder="PASSWORD"
          type="password"
          name="password"
          id="password"
        />
        {errors.password && <p className="text-red-500">{(errors.password.message as string)}</p>}
      </label>
      <label>
        <input
          {...register('confirmPassword', {
            required: "Password confirmation is required",
            validate: (val: string) => {
              if (watch('password') !== val) {
                return "Passwords do not match";
              }
            },
          })}
          required
          className="input-field"
          placeholder="CONFIRM PASSWORD"
          type="password"
          name="confirmPassword"
          id="confirmPassword"
        />
        {errors.confirmPassword && <p className="text-red-500">{(errors.confirmPassword.message as string)}</p>}
      </label>
      {errors?.root?.serverError && <p className="text-red-500">{(errors.root.serverError.message as string)}</p>}
      <div>
        <button
          disabled={disableSubmit}
          type="submit"
          className="btn-primary">Submit</button>
      </div>
    </form>
  )
}

export default AccountResetForm;
