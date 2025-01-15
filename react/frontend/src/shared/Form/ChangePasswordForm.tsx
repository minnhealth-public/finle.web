import React, { SyntheticEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { changePassword } from "../../api/auth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation } from "@tanstack/react-query";
import usePasswordCheck from "../../hooks/usePasswordCheck";

interface ChangePasswordFormProps {
  onSubmit: () => void
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSubmit }) => {

  const {
    register,
    trigger,
    setError,
    watch,
    formState: { errors },
  } = useForm();
  const [disableSubmit, setDisableSubmit] = useState(false);
  const axiosPrivate = useAxiosPrivate()
  const formRef = useRef(null);
  const { checkPassword } = usePasswordCheck();

  const updatePasswordMutation = useMutation({
    mutationFn: (newPassword: string) => changePassword(axiosPrivate, newPassword),
    onSuccess: () => {
      onSubmit();
    },
    onError: async (error: any) => {
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
    <div className="flex flex-col gap-4">
      <h2 className="text-4xl text-header ">
        Change your<br></br> password
      </h2>
      <p className="font-bold">
        Enter in your new password and confirm it.
      </p>
      <form
        ref={formRef}
        className="flex flex-col gap-4"
        onSubmit={formSubmit}
      >
        <label>
          <input
            {...register('password', {
              required: "Password is required",
              validate: checkPassword
            })}
            required
            className="input-field"
            placeholder="PASSWORD"
            type="password"
            name="password"
            id="password"
          />
          {errors.password && <p className="text-red-500" dangerouslySetInnerHTML={{ __html: errors.password.message as string }}></p>}
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
        <div>
          <button
            disabled={disableSubmit}
            type="submit"
            className="btn-primary">Submit</button>
        </div>
      </form>
    </div>
  )
}

export default ChangePasswordForm;
