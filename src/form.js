import React from "react";
import { connectForm } from "./hocs";
import { compose } from "functional";

const Component = ({ form, formModels, formActions }) => {
  const validate = () => {
    formActions.touchForm();
  }

  return (
    <div>
      <div>{form.input}</div>
      <div><button onClick={() => {
        formActions.setFormData({
          input: "yo",
          tt: "trr"
        });
        formActions.untouchForm();
      }}>setForm</button><button onClick={validate}>validate</button></div>
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
  connectForm(
    {
      form: {
        input: {
          defaultValue: "123"
        },
        check: {
          defaultValue: true
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
    ({ form, formModels, formActions }) => ({ form, formModels, formActions })
  )
)(Component);
