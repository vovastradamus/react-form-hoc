import React from "react";
import FormHOC from "./hocs/form";
import { compose } from "functional";

const Component = ({ form, formModels }) => {
  return (
    <div>
      <div>{form.input}</div>
      <div>
        <input
          defaultValue={form.input}
          onChange={({ target: { value } }) => (form.input = value)}
        />
      </div>
      <div>{formModels.input.$hasErrors ? "has-errors" : null}</div>
      <div>{formModels.input.$errors.join()}</div>
      <input
        name="isGoing"
        type="checkbox"
        checked={form.check}
        onChange={() => (form.check = !form.check)}
      />
      <div>{formModels.check.$errors.join()}</div>
    </div>
  );
};

export default compose(
  FormHOC(
    {
      form: {
        input: {
          defaultValue: "123"
        },
        check: {
          defaultValue: false
        }
      },
      validations: {
        input: [
          value => !value && "required",
          value => value.length < 6 && `need more 6, try ${value.length}`
        ],
        check: [value => !value && "required"]
      }
    },
    ({ form, formModels }) => ({ form, formModels })
  )
)(Component);
