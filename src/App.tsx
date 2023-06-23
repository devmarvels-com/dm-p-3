import React from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { isValidPhoneNumber } from "libphonenumber-js";
import "./App.css";

yup.addMethod<yup.StringSchema>(yup.string, "validPhone", function (message) {
  return this.test("validPhone", message, (value) => {
    if (!value) {
      return false;
    }
    return isValidPhoneNumber(value, "US");
  });
});

enum SubscriptionEnum {
  yes = "yes",
  no = "no",
}

type IFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumbers?: {
    phone: string;
  }[];
  subscribe: SubscriptionEnum;
};

declare module "yup" {
  interface StringSchema {
    validPhone(message: string): StringSchema;
  }
}

const errMsg = {
  firstNameErr: "Invalid First Name. Must be at least 2 characters long",
  lastNameErr: "Invalid Last Name. Must be at least 2 characters long",
  emailErr: "Invalid email. Must be a valid name@example.com",
  subscribe: 'You must select "yes" or "no"',
};

const schema: yup.ObjectSchema<IFormInput> = yup.object({
  firstName: yup.string().min(2, errMsg.firstNameErr).required(),
  lastName: yup.string().min(2, errMsg.lastNameErr).required(),
  email: yup.string().email(errMsg.emailErr).required(errMsg.emailErr),
  phoneNumbers: yup.array(
    yup.object({
      phone: yup.string().validPhone("Bad Phone Number").required(),
    })
  ),
  subscribe: yup.string<SubscriptionEnum>().defined(errMsg.subscribe),
});

function App() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      phoneNumbers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const onFormSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data);
  };

  const hasError = {
    firstName: errors.firstName,
    lastName: errors.lastName,
    email: errors.email,
    subscribe: errors.subscribe,
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className={`field ${hasError.firstName ? "has-error" : ""}`}>
          <label>First Name</label>
          <input {...register("firstName")} />
          <span>{errors.firstName?.message}</span>
        </div>
        <div className={`field ${hasError.lastName ? "has-error" : ""}`}>
          <label>Last Name</label>
          <input {...register("lastName")} />
          <span>{errors.lastName?.message}</span>
        </div>
        <div className={`field ${hasError.email ? "has-error" : ""}`}>
          <label>Email</label>
          <input {...register("email")} />
          <span>{errors.email?.message}</span>
        </div>
        <div className={`field ${hasError.subscribe ? "has-error" : ""}`}>
          <label>Subscribe</label>
          <select {...register("subscribe")}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <span>{errors.subscribe?.message}</span>
        </div>

        <button type="button" onClick={() => append({ phone: "" })}>
          Add Phone
        </button>

        <div className="field field-arr">
          {fields.map((field, index) => {
            return (
              <div key={field.id}>
                <section className="phoneNumber">
                  <input
                    placeholder="Your Phone Number"
                    type="phone"
                    {...register(`phoneNumbers.${index}.phone` as const)}
                  />
                </section>
                <span>{errors.phoneNumbers?.[index]?.phone?.message}</span>
                <button onClick={() => remove(index)}>Remove</button>
              </div>
            );
          })}
        </div>

        <div className="submit-btn">
          <input type="submit" />
        </div>
      </form>
    </div>
  );
}

export default App;
