import React, { useRef, useState } from "react";
import { useStore } from "../../store";
import { updateUser } from "../../api/auth";
import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { User } from "../../models/user";
import { useForm } from "react-hook-form";

interface ChangeUserInfoFormProps {
  onSubmit: () => void
}

const ChangeUserInfoForm: React.FC<ChangeUserInfoFormProps> = ({ onSubmit }) => {


  const { user, setUser } = useStore();
  const axiosPrivate = useAxiosPrivate()
  const [disableSubmit, setDisableSubmit] = useState(false);
  const formRef = useRef(null);
  const {
    register,
    trigger,
    setError,
    formState: { errors },
  } = useForm();

  const updateUserMutation = useMutation({
    mutationFn: (userInfo: User) => updateUser(axiosPrivate, userInfo),
    onSuccess: (data: any) => {
      setUser(data);
      onSubmit();
    },
    onError: async (error: any) => {
      for (const [key, value] of Object.entries(error.response.data)) {
        const errors: string[] = value as string[]
        setError(key, { type: 'custom', message: errors.join(" ") })
      }
    }
  })

  const formSubmit = async (event: any) => {
    setDisableSubmit(true);
    event.preventDefault();

    const body = new FormData(formRef.current);

    const userInfo: User = {
      id: user.id,
      lastLogin: user.lastLogin,
      firstName: (body.get('firstName') as string),
      lastName: (body.get('lastName') as string),
      email: (body.get('email') as string)
    }


    // call form submit after we've ensured that we are successful
    const isValid = await trigger()
    if (isValid) {
      updateUserMutation.mutate(userInfo)
    }
    setDisableSubmit(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-4xl text-header ">
        Change User Info
      </h2>
      <p className="font-bold">
        Enter in your new account information and confirm it.
      </p>
      <form ref={formRef} className="flex flex-col gap-4" onSubmit={formSubmit}>
        <label>
          <input
            {...register('firstName', { required: "First name is required" })}
            className="input-field"
            placeholder={user.firstName ? user.firstName : "First Name"}
            defaultValue={user.firstName}
            type="text"
            name="firstName"
            id="firstName"
          />
          {errors.firstName && <p className="text-red-500">{(errors.firstName.message as string)}</p>}
        </label>
        <label>
          <input
            {...register('lastName', { required: "Last name is required" })}
            className="input-field"
            placeholder={user.lastName ? user.lastName : "Last Name"}
            defaultValue={user.lastName}
            type="text"
            name="lastName"
            id="lastName"
          />
          {errors.lastName && <p className="text-red-500">{(errors.lastName.message as string)}</p>}
        </label>

        <label>
          <input
            {...register('email',
              {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                  message: "invalid email address"
                }
              }
            )}
            className="input-field"
            placeholder={user.email}
            defaultValue={user.email}
            type="email"
            name="email"
            id="email"
          />
          {errors.email && <p className="text-red-500">{(errors.email.message as string)}</p>}
        </label>
        <div>
          <button
            type="submit"
            className="btn-primary"
            disabled={disableSubmit}
          >Submit</button>
        </div>
      </form>
    </div>
  )
}

export default ChangeUserInfoForm;
