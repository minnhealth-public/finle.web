import React, { SyntheticEvent, useContext, useEffect, useRef, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import AuthContext from "../../contexts/AuthContext";
import { useStore } from "../../store";
import { CareTeam } from "../../models/careTeam";
import { useMutation } from "@tanstack/react-query";
import { createCareTeam } from "../../api/user";
import { useSearchParams } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePasswordCheck from "../../hooks/usePasswordCheck";

interface SetupUserProps {
  nextStep: (data: any) => void
}

const SetupUser: React.FC<SetupUserProps> = ({ nextStep }) => {

  const {
    register,
    setValue,
    trigger,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm();

  const { checkPassword } = usePasswordCheck();
  const { user, setCareTeam, setCareTeams } = useStore();
  const axiosPrivate = useAxiosPrivate();
  const { registerUser } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      setValue('email', user.email);
    }
  }, [user, setValue])

  const formRef = useRef(null);

  const createCareTeamMutation = useMutation({
    mutationFn: (careTeam: CareTeam) => createCareTeam(axiosPrivate, careTeam),
  })

  const onSubmit = async (evt: any) => {
    evt.preventDefault();

    if (!!evt.target.middle_name.value)
      return;

    setIsSubmitting(true);
    const body = new FormData(formRef.current);
    const values: FieldValues = {};
    body.forEach((value, key) => { values[key] = value; })
    // checkboxes don't show up if they aren't checked so change to false here for careTeamMember

    const isValid = await trigger()

    if (isValid) {
      // send request
      try {
        await registerUser.mutateAsync(values)
        const initCareTeam: CareTeam = ({
          "name": "Care Team",
          members: [
            {
              relation: "",
              email: values['email'],
              isCareteamAdmin: true, // True because they'll need permission to add people
              isCaree: searchParams.get("hereForYou") === "yes" // grab value from url param set on previous screen
            }
          ]
        } as CareTeam)

        createCareTeamMutation.mutateAsync(initCareTeam)
          .then((careTeam: CareTeam) => {
            setCareTeams([careTeam]);
            setCareTeam(careTeam);
            nextStep({});
            reset();
            clearErrors(["firstName", "lastName", "email", "password", "confirmPassword"])
            // Set the search param of care team.
          })
      } catch (error) {
        setIsSubmitting(false);
        if (error.response.status == 400) {
          for (const key in error.response.data) {
            setError(key, { message: error.response.data[key] });
          }
        } else {
          setError("root.serverError", { type: error.response.status, message: "Sorry there was an error " });
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-4xl text-header max-w-sm">
        Please provide account information.
      </h2>
      {registerUser.isLoading && ('Adding todo...')}
      <form
        onSubmit={(evt: SyntheticEvent) => onSubmit(evt)}
        ref={formRef}
        className="flex flex-col  space-y-4"
      >
        <div>
          <label>
            <input
              {...register('firstName', { required: "First name is required" })}
              required
              type="text"
              name="firstName"
              className="input-field"
              placeholder="FIRST NAME"
            />
            {errors.firstName && <p className="text-red-500">{(errors.firstName.message as string)}</p>}
          </label>
        </div>

        <input
          type="text"
          id="middle_name"
          className="!hidden"
          tabIndex={-1}
          autoComplete='false' />
        <div>
          <label>
            <input
              {...register('lastName', { required: "Last name is required" })}
              required
              type="text"
              name="lastName"
              className="input-field"
              placeholder="LAST NAME"
            />
            {errors.lastName && <p className="text-red-500">{(errors.lastName.message as string)}</p>}
          </label>
        </div>
        <div>
          <label htmlFor="email">
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
              required
              className={`input-field ${user === null ? "" : "text-gray-400"}`}
              placeholder='EMAIL'
              disabled={user !== null}
              type="email"
              name="email"
              id="email"
            />
            {errors.email && <p className="text-red-500">{(errors.email.message as string)}</p>}
          </label>
        </div>
        <div>
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
        </div>
        <div>
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
        </div>
        {errors?.root?.serverError && <p className="text-red-500">{(errors.root.serverError.message as string)}</p>}
        <div className="md:flex gap-4 align-middle items-center">
          <button
            className="btn-primary"
            disabled={isSubmitting}
            type="submit"
          >
            Sign up
          </button>
          <div>* Indicates a required field</div>
        </div>
      </form>
    </div>
  );
}

export default SetupUser;
